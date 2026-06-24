import { Component, OnInit, inject } from '@angular/core';
import { PublicacionCard } from '../publicacion-card/publicacion-card';
import { PublicacionForm } from '../publicacion-form/publicacion-form';
import { PublicacionesService } from '../../services/publicaciones';
import { AuthService } from '../../services/auth';
import {
  OrdenPublicaciones,
  Publicacion,
} from '../../models/publicacion.model';
import { Boton } from '../boton/boton';

const LIMIT = 5; // publicaciones por página

@Component({
  selector: 'app-publicaciones-lista',
  imports: [PublicacionCard, PublicacionForm, Boton],
  templateUrl: './publicaciones-lista.html',
  styleUrl: './publicaciones-lista.scss',
})
export class PublicacionesLista implements OnInit {
  private pubService = inject(PublicacionesService);
  private auth = inject(AuthService);

  publicaciones: Publicacion[] = [];
  total = 0;
  orden: OrdenPublicaciones = 'fecha';
  offset = 0;
  readonly limit = LIMIT;
  loading = false;
  error = '';

  usuarioActualId = this.auth.getUsuario()?._id ?? '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = '';
    this.pubService
      .listar({ orden: this.orden, offset: this.offset, limit: this.limit })
      .subscribe({
        next: (res) => {
          this.publicaciones = res.publicaciones;
          this.total = res.total;
          this.loading = false;
        },
        error: () => {
          this.error = 'No se pudieron cargar las publicaciones.';
          this.loading = false;
        },
      });
  }

  // Tras crear una publicación: volvemos a la primera página por fecha
  onCreada(): void {
    this.orden = 'fecha';
    this.offset = 0;
    this.cargar();
  }

  cambiarOrden(orden: OrdenPublicaciones): void {
    if (this.orden === orden) return;
    this.orden = orden;
    this.offset = 0; // volvemos a la primera página
    this.cargar();
  }

  // ── Paginación ──────────────────────────────────────
  get paginaActual(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  get totalPaginas(): number {
    return Math.max(1, Math.ceil(this.total / this.limit));
  }

  get hayAnterior(): boolean {
    return this.offset > 0;
  }

  get haySiguiente(): boolean {
    return this.offset + this.limit < this.total;
  }

  anterior(): void {
    if (!this.hayAnterior) return;
    this.offset = Math.max(0, this.offset - this.limit);
    this.cargar();
  }

  siguiente(): void {
    if (!this.haySiguiente) return;
    this.offset += this.limit;
    this.cargar();
  }

  // ── Me gusta ────────────────────────────────────────
  onToggleLike(pub: Publicacion): void {
    if (!this.usuarioActualId) return;
    const yaDioLike = pub.likes.includes(this.usuarioActualId);
    const accion = yaDioLike
      ? this.pubService.quitarLike(pub._id, this.usuarioActualId)
      : this.pubService.darLike(pub._id, this.usuarioActualId);

    accion.subscribe({
      next: (actualizada) => this.reemplazar(actualizada),
      error: () => (this.error = 'No se pudo actualizar el me gusta.'),
    });
  }

  // ── Eliminar (baja lógica) ──────────────────────────
  onEliminar(pub: Publicacion): void {
    if (!this.usuarioActualId) return;
    this.pubService.eliminar(pub._id, this.usuarioActualId).subscribe({
      next: () => {
        // Si la página queda vacía y no es la primera, retrocedemos una
        if (this.publicaciones.length === 1 && this.offset >= this.limit) {
          this.offset -= this.limit;
        }
        this.cargar();
      },
      error: () => (this.error = 'No se pudo eliminar la publicación.'),
    });
  }

  private reemplazar(actualizada: Publicacion): void {
    const i = this.publicaciones.findIndex((p) => p._id === actualizada._id);
    if (i !== -1) this.publicaciones[i] = actualizada;
  }
}
