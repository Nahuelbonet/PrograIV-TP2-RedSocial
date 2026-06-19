import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { SesionService } from '../../services/sesion.service';

@Component({
  selector: 'app-cargando-page',
  imports: [],
  templateUrl: './cargando-page.html',
  styleUrl: './cargando-page.scss',
})
export class CargandoPage implements OnInit {
  private auth = inject(AuthService);
  private sesion = inject(SesionService);
  private router = inject(Router);

  ngOnInit(): void {
    const token = this.auth.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }
    this.auth.autorizar(token).subscribe({
      next: (usuario) => {
        localStorage.setItem('usuario', JSON.stringify(usuario));
        this.sesion.iniciarContador();
        this.router.navigate(['/publicaciones']);
      },
      error: () => {
        this.auth.logout();
        this.router.navigate(['/login']);
      },
    });
  }
}
