import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El texto del comentario es obligatorio' })
  @MaxLength(150, { message: 'El comentario no puede superar los 150 caracteres' })
  texto: string;

  @IsString()
  @IsNotEmpty({ message: 'El usuarioId es obligatorio' })
  usuarioId: string;
}
