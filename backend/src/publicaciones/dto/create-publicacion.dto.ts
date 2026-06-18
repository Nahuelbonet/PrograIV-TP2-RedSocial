import { IsMongoId, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePublicacionDto {
  @IsString()
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @MaxLength(35, { message: 'El título no puede superar los 35 caracteres' })
  titulo: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MaxLength(150, { message: 'La descripción no puede superar los 150 caracteres' })
  descripcion: string;

  // ID del usuario que crea la publicación (no hay JWT, llega desde el front)
  @IsMongoId({ message: 'El usuario no es válido' })
  usuarioId: string;
}
