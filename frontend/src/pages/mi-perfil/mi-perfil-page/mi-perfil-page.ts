import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { User } from '../../../models/user.model';
import { PerfilHeader } from '../perfil-header/perfil-header';
import { PerfilDatos } from '../perfil-datos/perfil-datos';
import { MisPublicaciones } from '../mis-publicaciones/mis-publicaciones';
import { EditarPerfil } from '../editar-perfil/editar-perfil';

@Component({
  selector: 'app-mi-perfil-page',
  imports: [RouterLink, PerfilHeader, PerfilDatos, MisPublicaciones, EditarPerfil],
  templateUrl: './mi-perfil-page.html',
  styleUrl: './mi-perfil-page.scss',
})
export class MiPerfilPage implements OnInit {
  private auth = inject(AuthService);
  usuario: User | null = null;
  editando = false;

  ngOnInit(): void {
    this.usuario = this.auth.getUsuario();
  }

  abrirEdicion(): void {
    this.editando = true;
  }

  onGuardado(usuario: User): void {
    this.usuario = usuario; // refresca los datos mostrados
    this.editando = false;
  }

  cerrarEdicion(): void {
    this.editando = false;
  }
}
