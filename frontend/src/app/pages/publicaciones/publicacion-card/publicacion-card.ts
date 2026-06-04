import { Component, Input, OnInit } from '@angular/core';
import { Publicacion } from '../publicaciones-lista/publicaciones-lista';

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#14b8a6',
];

@Component({
  selector: 'app-publicacion-card',
  imports: [],
  templateUrl: './publicacion-card.html',
  styleUrl: './publicacion-card.scss',
})
export class PublicacionCard implements OnInit {
  @Input() publicacion!: Publicacion;
  avatarColor = AVATAR_COLORS[0];

  ngOnInit(): void {
    const idx = this.publicacion.autor.charCodeAt(0) % AVATAR_COLORS.length;
    this.avatarColor = AVATAR_COLORS[idx];
  }
}
