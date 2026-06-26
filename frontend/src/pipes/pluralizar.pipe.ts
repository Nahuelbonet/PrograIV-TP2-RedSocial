import { Pipe, PipeTransform } from '@angular/core';

// Devuelve el número junto a la palabra en singular o plural según corresponda.
// Uso:  {{ cant | pluralizar:'comentario':'comentarios' }}  ->  "3 comentarios"
// Si no se pasa el plural, le agrega una "s":  {{ 2 | pluralizar:'like' }} -> "2 likes"
@Pipe({ name: 'pluralizar' })
export class PluralizarPipe implements PipeTransform {
  transform(cantidad: number, singular: string, plural?: string): string {
    const palabra = cantidad === 1 ? singular : (plural ?? singular + 's');
    return `${cantidad} ${palabra}`;
  }
}
