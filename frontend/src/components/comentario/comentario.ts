import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Boton } from '../boton/boton';
import { TiempoTranscurridoPipe } from '../../pipes/tiempo-transcurrido.pipe';
import { Comentario as ComentarioModel } from '../../models/publicacion.model';

/**
 * Muestra un comentario. Tiene dos modos:
 *  - completo (por defecto): avatar, autor, fecha, acciones de editar/eliminar
 *    y formulario de edición. Lo usa el detalle de la publicación.
 *  - compacto: solo autor + texto en una línea. Lo usa "mis publicaciones".
 *
 * El estado de edición (qué comentario se edita y el texto) lo maneja el
 * componente padre; este componente solo emite los eventos.
 */
@Component({
  selector: 'app-comentario',
  imports: [FormsModule, Boton, TiempoTranscurridoPipe],
  templateUrl: './comentario.html',
  styleUrl: './comentario.scss',
  host: { '[class.compacto]': 'compacto' },
})
export class Comentario {
  @Input() comentario!: ComentarioModel;
  @Input() esMio = false; // ¿es del usuario logueado? (muestra editar/eliminar)
  @Input() editando = false; // ¿está en modo edición?
  @Input() textoEditado = ''; // texto del textarea de edición (two-way)
  @Input() maxComentario = 150;
  @Input() compacto = false; // vista reducida para "mis publicaciones"

  @Output() textoEditadoChange = new EventEmitter<string>();
  @Output() iniciarEdicion = new EventEmitter<void>();
  @Output() eliminar = new EventEmitter<void>();
  @Output() guardar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  get nombreAutor(): string {
    const u = this.comentario.usuario;
    return u ? `${u.nombre} ${u.apellido}` : 'Usuario';
  }

  get inicialAutor(): string {
    return this.comentario.usuario?.nombre?.charAt(0).toUpperCase() ?? '?';
  }
}
