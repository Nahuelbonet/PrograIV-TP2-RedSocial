import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth';
import { SesionService } from '../../services/sesion.service';
import { Boton } from '../boton/boton';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, AsyncPipe, Boton],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  auth = inject(AuthService);
  private sesion = inject(SesionService);
  private router = inject(Router);

  // Contador visual: tiempo restante de la sesión (token), en mm:ss
  sesionInfo$ = this.sesion.restante$.pipe(
    map((seg) => ({
      texto: this.formatear(seg),
      visible: seg > 0,
      urgente: seg > 0 && seg <= 30, // menos de 30 seg
    })),
  );

  private formatear(seg: number): string {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  logout(): void {
    this.auth.logout();
    this.sesion.limpiar();
    this.router.navigate(['/login']);
  }
}
