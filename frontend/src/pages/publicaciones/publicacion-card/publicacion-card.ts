import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Publicacion } from '../../../models/publicacion.model';

@Component({
  selector: 'app-publicacion-card',
  imports: [DatePipe],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.scss',
})
export class PublicacionCard {
  @Input() publicacion!: Publicacion;
  @Input() usuarioActualId = '';

  @Output() toggleLike = new EventEmitter<Publicacion>();
  @Output() eliminar = new EventEmitter<Publicacion>();

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

  onToggleLike(): void {
    if (!this.hayUsuario) return;
    this.toggleLike.emit(this.publicacion);
  }

  onEliminar(): void {
    this.eliminar.emit(this.publicacion);
  }
}
