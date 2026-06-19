import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicacionesService } from '../../../services/publicaciones';
import { AuthService } from '../../../services/auth';
import { Publicacion, Comentario } from '../../../models/publicacion.model';

const LIMIT = 5;

@Component({
  selector: 'app-publicacion-detalle-page',
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './publicacion-detalle-page.html',
  styleUrl: './publicacion-detalle-page.scss',
})
export class PublicacionDetallePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pubService = inject(PublicacionesService);
  private auth = inject(AuthService);

  publicacion: Publicacion | null = null;
  comentarios: Comentario[] = [];
  totalComentarios = 0;
  offset = 0;
  cargandoMas = false;
  loadingPub = true;

  nuevoComentario = '';
  enviando = false;

  editandoId: string | null = null;
  textoEditado = '';

  get usuarioActual() { return this.auth.getUsuario(); }
  get hayMas(): boolean { return this.comentarios.length < this.totalComentarios; }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/publicaciones']); return; }
    this.cargarPublicacion(id);
    this.cargarComentarios(id, true);
  }

  private cargarPublicacion(id: string): void {
    this.pubService.obtener(id).subscribe({
      next: (pub) => { this.publicacion = pub; this.loadingPub = false; },
      error: () => this.router.navigate(['/publicaciones']),
    });
  }

  private cargarComentarios(id: string, reset = false): void {
    if (reset) { this.offset = 0; this.comentarios = []; }
    this.cargandoMas = true;
    this.pubService.getComentarios(id, this.offset, LIMIT).subscribe({
      next: ({ total, comentarios }) => {
        this.totalComentarios = total;
        this.comentarios = [...this.comentarios, ...comentarios];
        this.offset += comentarios.length;
        this.cargandoMas = false;
      },
      error: () => { this.cargandoMas = false; },
    });
  }

  cargarMas(): void {
    if (!this.publicacion) return;
    this.cargarComentarios(this.publicacion._id);
  }

  enviarComentario(): void {
    const usuario = this.usuarioActual;
    if (!usuario || !this.publicacion || !this.nuevoComentario.trim()) return;
    this.enviando = true;
    this.pubService
      .agregarComentario(this.publicacion._id, this.nuevoComentario.trim(), usuario._id)
      .subscribe({
        next: () => {
          this.nuevoComentario = '';
          this.enviando = false;
          this.cargarComentarios(this.publicacion!._id, true);
        },
        error: () => { this.enviando = false; },
      });
  }

  iniciarEdicion(comentario: Comentario): void {
    this.editandoId = comentario._id ?? null;
    this.textoEditado = comentario.texto;
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.textoEditado = '';
  }

  guardarEdicion(comentario: Comentario): void {
    const usuario = this.usuarioActual;
    if (!usuario || !this.publicacion || !this.textoEditado.trim()) return;
    this.pubService
      .editarComentario(
        this.publicacion._id,
        comentario._id!,
        this.textoEditado.trim(),
        usuario._id,
      )
      .subscribe({
        next: () => {
          this.cancelarEdicion();
          this.cargarComentarios(this.publicacion!._id, true);
        },
      });
  }

  esMiComentario(comentario: Comentario): boolean {
    return !!this.usuarioActual && comentario.usuario._id === this.usuarioActual._id;
  }
}
