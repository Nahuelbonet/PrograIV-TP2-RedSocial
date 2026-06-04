import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { User } from '../../../core/models/user.model';
import { PerfilHeader } from '../perfil-header/perfil-header';
import { PerfilDatos } from '../perfil-datos/perfil-datos';

@Component({
  selector: 'app-mi-perfil-page',
  imports: [RouterLink, PerfilHeader, PerfilDatos],
  templateUrl: './mi-perfil-page.html',
  styleUrl: './mi-perfil-page.scss',
})
export class MiPerfilPage implements OnInit {
  private auth = inject(AuthService);
  usuario: User | null = null;

  ngOnInit(): void {
    this.usuario = this.auth.getUsuario();
  }
}
