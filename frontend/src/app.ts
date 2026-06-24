import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
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

  ngOnInit(): void {
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
