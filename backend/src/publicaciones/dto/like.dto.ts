import { IsMongoId } from 'class-validator';

export class LikeDto {
  // ID del usuario que da/quita el me gusta
  @IsMongoId({ message: 'El usuario no es válido' })
  usuarioId: string;
}
