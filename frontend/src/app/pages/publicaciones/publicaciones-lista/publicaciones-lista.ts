import { Component } from '@angular/core';
import { PublicacionCard } from '../publicacion-card/publicacion-card';

export interface Publicacion {
  id: number;
  autor: string;
  contenido: string;
  fecha: string;
}

@Component({
  selector: 'app-publicaciones-lista',
  imports: [PublicacionCard],
  templateUrl: './publicaciones-lista.html',
  styleUrl: './publicaciones-lista.scss',
})
export class PublicacionesLista {
  publicaciones: Publicacion[] = [
    {
      id: 1,
      autor: 'María García',
      contenido: '¡Bienvenidos a la red social de UTN! Este es el primer post de prueba.',
      fecha: '2025-06-01',
    },
    {
      id: 2,
      autor: 'Juan Pérez',
      contenido: 'Hola a todos, soy nuevo por acá. ¿Cómo están?',
      fecha: '2025-06-02',
    },
    {
      id: 3,
      autor: 'Ana López',
      contenido: 'Terminé el TP de Programación 2. Fue un trabajo muy interesante con NestJS y Angular.',
      fecha: '2025-06-03',
    },
  ];
}
