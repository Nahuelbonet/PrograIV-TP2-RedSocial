import { Component, EventEmitter, Output } from '@angular/core';
import { Boton } from '../boton/boton';

@Component({
  selector: 'app-sesion-modal',
  imports: [Boton],
  templateUrl: './sesion-modal.html',
  styleUrl: './sesion-modal.scss',
})
export class SesionModal {
  @Output() extender = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();
}
