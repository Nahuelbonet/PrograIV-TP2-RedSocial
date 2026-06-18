import { IsOptional, IsString } from 'class-validator';

// Campos editables del perfil. Todos opcionales: se actualiza solo lo enviado.
// (correo y nombreUsuario son identificadores únicos; la contraseña se maneja aparte)
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  fechaNacimiento?: string;
}
