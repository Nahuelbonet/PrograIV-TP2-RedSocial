import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Publicacion } from '../../models/publicacion.model';
import { Boton } from '../boton/boton';
import { Comentario as ComentarioComponent } from '../comentario/comentario';
import { PluralizarPipe } from '../../pipes/pluralizar.pipe';
import { TruncarPipe } from '../../pipes/truncar.pipe';

@Component({
  selector: 'app-publicacion-card',
  imports: [DatePipe, RouterLink, Boton, ComentarioComponent, PluralizarPipe, TruncarPipe],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.scss',
})
export class PublicacionCard {
  @Input() publicacion!: Publicacion;
  @Input() usuarioActualId = '';
  @Input() esAdmin = false; // ¿el usuario logueado es administrador?
  // 'feed'    = tarjeta del listado (con acciones).
  // 'detalle' = vista ampliada sin acciones (página de detalle).
  // 'mini'    = vista compacta para "mis publicaciones" (con preview de comentarios).
  @Input() variante: 'feed' | 'detalle' | 'mini' = 'feed';

  @Output() toggleLike = new EventEmitter<Publicacion>();
  @Output() eliminar = new EventEmitter<Publicacion>();

  // Controla el visor ampliado de la imagen (lightbox)
  imagenAmpliada = false;

  // ¿El usuario actual ya dio me gusta?
  get yaDioLike(): boolean {
    return (
      !!this.usuarioActualId &&
      this.publicacion.likes.includes(this.usuarioActualId)
    );
  }

  // ¿La publicación es del usuario logueado? (para mostrar eliminar)
  get esPropia(): boolean {
    return (
      !!this.usuarioActualId &&
      this.publicacion.usuario?._id === this.usuarioActualId
    );
  }

  // ¿Puede eliminar esta publicación? El autor (la suya) o un admin (cualquiera)
  get puedeEliminar(): boolean {
    return this.esPropia || this.esAdmin;
  }

  // Hay sesión iniciada (para habilitar el me gusta)
  get hayUsuario(): boolean {
    return !!this.usuarioActualId;
  }

  get nombreAutor(): string {
    const u = this.publicacion.usuario;
    return u ? `${u.nombre} ${u.apellido}` : 'Usuario';
  }

  get inicialAutor(): string {
    return this.publicacion.usuario?.nombre?.charAt(0).toUpperCase() ?? '?';
  }

  // Cantidad de comentarios (para mostrar al lado del botón Comentar)
  get cantidadComentarios(): number {
    return this.publicacion.comentarios?.length ?? 0;
  }

  onToggleLike(): void {
    if (!this.hayUsuario) return;
    this.toggleLike.emit(this.publicacion);
  }

  onEliminar(): void {
    this.eliminar.emit(this.publicacion);
  }

  abrirImagen(): void {
    if (this.publicacion.imagen) this.imagenAmpliada = true;
  }

  cerrarImagen(): void {
    this.imagenAmpliada = false;
  }
}
