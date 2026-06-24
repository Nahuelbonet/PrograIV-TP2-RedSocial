import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../models/user.model';
import { Boton } from '../boton/boton';

@Component({
  selector: 'app-perfil-header',
  imports: [Boton],
  templateUrl: './perfil-header.html',
  styleUrl: './perfil-header.scss',
})
export class PerfilHeader {
  @Input() usuario!: User;
  @Output() editar = new EventEmitter<void>();
}
