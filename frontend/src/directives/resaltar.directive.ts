import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

// Resalta el elemento con un borde brillante al pasar el mouse por encima.
// Uso:  <app-publicacion-card appResaltar />
//       <div appResaltar="0 0 0 2px var(--primary)">...</div>  (color opcional)
@Directive({ selector: '[appResaltar]' })
export class ResaltarDirective {
  private el = inject(ElementRef);

  // Permite personalizar la sombra desde el HTML (si no, usa una por defecto)
  @Input('appResaltar') sombra = '';

  @HostListener('mouseenter') alEntrar(): void {
    this.el.nativeElement.style.transition = 'box-shadow 0.2s';
    this.el.nativeElement.style.boxShadow =
      this.sombra || '0 0 0 2px var(--primary), var(--glow)';
  }

  @HostListener('mouseleave') alSalir(): void {
    this.el.nativeElement.style.boxShadow = '';
  }
}
