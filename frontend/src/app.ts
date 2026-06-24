import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { Boton } from './components/boton/boton';
import { SesionService } from './services/sesion.service';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, Boton, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private sesion = inject(SesionService);
  private auth = inject(AuthService);
  private router = inject(Router);

  mostrarModal$ = this.sesion.mostrarModal$;

  // Cuenta regresiva en vivo para mostrar en el modal (mm:ss)
  restante$ = this.sesion.restante$.pipe(map((seg) => this.formatear(seg)));

  private formatear(seg: number): string {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  ngOnInit(): void {
    // Si la sesión vence y el usuario no extendió a tiempo: cerramos sesión y vamos al login.
    // (Nos suscribimos antes de arrancar el contador por si el token ya está vencido al recargar.)
    this.sesion.expirado$.subscribe(() => this.onCerrarModal());

    // Si se recarga la app con sesión activa (ej. F5 en una ruta interna),
    // arrancamos el contador para que el tiempo restante quede siempre visible.
    if (this.auth.estaLogueado()) {
      this.sesion.iniciarContador();
    }
  }

  onExtender(): void {
    const token = this.auth.getToken();
    if (!token) return;
    this.auth.refrescar(token).subscribe({
      next: ({ token: nuevoToken }) => {
        localStorage.setItem('token', nuevoToken);
        this.sesion.cerrarModal();
        this.sesion.iniciarContador();
      },
      error: () => {
        this.auth.logout();
        this.sesion.limpiar();
      },
    });
  }

  // El usuario eligió NO continuar: cerramos la sesión y lo mandamos al login
  onCerrarModal(): void {
    this.auth.logout();
    this.sesion.limpiar();
    this.router.navigate(['/login']);
  }
}
