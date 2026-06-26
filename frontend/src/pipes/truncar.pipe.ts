import { Pipe, PipeTransform } from '@angular/core';

// Corta un texto largo y le agrega un sufijo ("…" por defecto).
// Uso:  {{ publicacion.descripcion | truncar:80 }}
@Pipe({ name: 'truncar' })
export class TruncarPipe implements PipeTransform {
  transform(texto: string | null | undefined, limite = 100, sufijo = '…'): string {
    if (!texto) return '';
    if (texto.length <= limite) return texto;
    return texto.slice(0, limite).trimEnd() + sufijo;
  }
}
