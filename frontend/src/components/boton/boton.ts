import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Botón reutilizable de toda la app.
 *
 * El aspecto se elige con `variante` (cada variante reproduce exactamente
 * el estilo que antes tenía cada botón suelto). El contenido —texto y/o
 * íconos SVG— se proyecta con <ng-content>, así sirve para cualquier caso.
 *
 * Usa `:host { display: contents }` (ver boton.scss) para que el <button>
 * interno se comporte como hijo directo del contenedor y no altere ningún
 * layout flex/grid existente.
 */
@Component({
  selector: 'app-boton',
  imports: [],
  templateUrl: './boton.html',
  styleUrl: './boton.scss',
})
export class Boton {
  // Estilo visual del botón (ver lista de variantes en boton.scss)
  @Input() variante = 'primary';
  // 'button' por defecto; 'submit' para los que envían un formulario
  @Input() tipo: 'button' | 'submit' = 'button';
  @Input() deshabilitado = false;
  @Input() titulo = '';
  @Input() ariaLabel = '';

  // Click del botón (los formularios siguen usando (ngSubmit) por su cuenta)
  @Output() clic = new EventEmitter<MouseEvent>();

  get clases(): string {
    return `boton boton--${this.variante}`;
  }
}
