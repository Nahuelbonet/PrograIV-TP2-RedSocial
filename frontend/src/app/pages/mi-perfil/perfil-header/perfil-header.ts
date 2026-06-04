import { Component, Input } from '@angular/core';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-perfil-header',
  imports: [],
  templateUrl: './perfil-header.html',
  styleUrl: './perfil-header.scss',
})
export class PerfilHeader {
  @Input() usuario!: User;
}
