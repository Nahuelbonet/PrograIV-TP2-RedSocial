import { IsNotEmpty, IsString } from 'class-validator';

export class CreateComentarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El texto del comentario es obligatorio' })
  texto: string;

  @IsString()
  @IsNotEmpty({ message: 'El usuarioId es obligatorio' })
  usuarioId: string;
}
