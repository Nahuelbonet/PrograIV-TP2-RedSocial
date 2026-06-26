import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

// Pone el foco automáticamente en el elemento apenas aparece en pantalla.
// Uso:  <input appAutofocus />
@Directive({ selector: '[appAutofocus]' })
export class AutofocusDirective implements AfterViewInit {
  private el = inject(ElementRef);

  ngAfterViewInit(): void {
    // El elemento ya existe en el DOM, así que podemos enfocarlo
    this.el.nativeElement.focus();
  }
}
