import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from './auth';

@Injectable({ providedIn: 'root' })
export class SesionService {
  private auth = inject(AuthService);

  private _mostrarModal = new BehaviorSubject<boolean>(false);
  mostrarModal$ = this._mostrarModal.asObservable();

  // Segundos que le quedan de vida al token (para el contador visual)
  private _restante = new BehaviorSubject<number>(0);
  restante$ = this._restante.asObservable();

  // Avisa que el token venció (el usuario no extendió a tiempo) -> hay que desloguear
  private _expirado = new Subject<void>();
  expirado$ = this._expirado.asObservable();

  private handle: ReturnType<typeof setInterval> | null = null;

  // Avisamos cuando faltan 5 minutos o menos para que venza el token
  private readonly AVISO_SEG = 300;
  // Para mostrar el modal de aviso una sola vez por sesión
  private avisoMostrado = false;

  // Arranca el contador apenas el usuario se loguea (o al renovar el token)
  iniciarContador(): void {
    this.limpiar();
    this.avisoMostrado = false;
    this.tick(); // primer cálculo inmediato (no esperamos 1s)
    this.handle = setInterval(() => this.tick(), 1000);
  }

  // Se ejecuta cada segundo: actualiza el restante y dispara el aviso
  private tick(): void {
    const restante = this.segundosRestantes();
    this._restante.next(restante);

    if (restante <= 0) {
      // El token venció: frenamos el contador y avisamos para cerrar la sesión
      this.detener();
      this._expirado.next();
      return;
    }
    // Cuando quedan 5 minutos o menos, mostramos el aviso una sola vez
    if (restante <= this.AVISO_SEG && !this.avisoMostrado) {
      this.avisoMostrado = true;
      this._mostrarModal.next(true);
    }
  }

  // Lee el "exp" del JWT y calcula cuántos segundos faltan para que venza
  private segundosRestantes(): number {
    const token = this.auth.getToken();
    if (!token) return 0;
    try {
      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
      );
      if (!payload.exp) return 0;
      return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
    } catch {
      return 0;
    }
  }

  // Cierra el modal de aviso
  cerrarModal(): void {
    this._mostrarModal.next(false);
  }

  // Frena el contador interno (sin tocar el restante mostrado)
  private detener(): void {
    if (this.handle) {
      clearInterval(this.handle);
      this.handle = null;
    }
  }

  // Frena el contador y oculta el modal (al cerrar sesión o renovar)
  limpiar(): void {
    this.detener();
    this._mostrarModal.next(false);
    this._restante.next(0);
  }
}
