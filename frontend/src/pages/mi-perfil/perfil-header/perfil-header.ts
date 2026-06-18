import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-perfil-header',
  imports: [],
  templateUrl: './perfil-header.html',
  styleUrl: './perfil-header.scss',
})
export class PerfilHeader {
  @Input() usuario!: User;
  @Output() editar = new EventEmitter<void>();
}
