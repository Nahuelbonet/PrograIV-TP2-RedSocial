import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './components/footer/footer';
import { SesionModal } from './components/sesion-modal/sesion-modal';
import { SesionService } from './services/sesion.service';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer, SesionModal, AsyncPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private sesion = inject(SesionService);
  private auth = inject(AuthService);

  mostrarModal$ = this.sesion.mostrarModal$;

  ngOnInit(): void {}

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

  onCerrarModal(): void {
    this.sesion.cerrarModal();
  }
}
