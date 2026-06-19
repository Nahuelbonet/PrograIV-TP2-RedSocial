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
  @Output() bannerChange = new EventEmitter<File>();

  onBannerChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.bannerChange.emit(input.files[0]);
      input.value = '';
    }
  }
}
