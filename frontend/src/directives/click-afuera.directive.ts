import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
  inject,
} from '@angular/core';

// Emite un evento cuando el usuario hace clic FUERA del elemento.
// Sirve para cerrar menús, formularios o paneles al clickear afuera.
// Uso:  <div (appClickAfuera)="cerrar()">...</div>
@Directive({ selector: '[appClickAfuera]' })
export class ClickAfueraDirective {
  private el = inject(ElementRef);

  @Output() appClickAfuera = new EventEmitter<void>();

  // Escucha TODOS los clics del documento. Si el clic no fue adentro
  // de nuestro elemento, avisa con el evento.
  @HostListener('document:click', ['$event.target'])
  alClickEnDocumento(target: EventTarget | null): void {
    const clicAdentro = this.el.nativeElement.contains(target as Node | null);
    if (!clicAdentro) {
      this.appClickAfuera.emit();
    }
  }
}
