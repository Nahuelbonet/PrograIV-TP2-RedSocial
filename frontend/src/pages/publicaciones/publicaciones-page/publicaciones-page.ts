import { Component } from '@angular/core';
import { PublicacionesLista } from '../publicaciones-lista/publicaciones-lista';

@Component({
  selector: 'app-publicaciones-page',
  imports: [PublicacionesLista],
  templateUrl: './publicaciones-page.html',
  styleUrl: './publicaciones-page.scss',
})
export class PublicacionesPage {}
