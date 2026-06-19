import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private _mostrarModal = new BehaviorSubject<boolean>(false);
  mostrarModal$ = this._mostrarModal.asObservable();

  private handle: ReturnType<typeof setTimeout> | null = null;

  iniciarContador(): void {
    this.limpiar();
    // A los 10 minutos muestra el modal (quedan 5 min de token)
    this.handle = setTimeout(() => {
      this._mostrarModal.next(true);
    }, 10 * 60 * 1000);
  }

  cerrarModal(): void {
    this._mostrarModal.next(false);
  }

  limpiar(): void {
    if (this.handle) {
      clearTimeout(this.handle);
      this.handle = null;
    }
    this._mostrarModal.next(false);
  }
}
