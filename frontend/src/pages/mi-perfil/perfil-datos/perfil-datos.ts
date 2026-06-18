import { Component, Input } from '@angular/core';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-perfil-datos',
  imports: [],
  templateUrl: './perfil-datos.html',
  styleUrl: './perfil-datos.scss',
})
export class PerfilDatos {
  @Input() usuario!: User;

  formatFecha(fecha: string): string {
    return fecha?.slice(0, 10) ?? '';
  }
}
