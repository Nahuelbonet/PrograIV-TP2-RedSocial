import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-sesion-modal',
  imports: [],
  templateUrl: './sesion-modal.html',
  styleUrl: './sesion-modal.scss',
})
export class SesionModal {
  @Output() extender = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();
}
