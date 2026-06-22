import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

// Campos editables del perfil. Todos opcionales: se actualiza solo lo enviado.
// (correo y nombreUsuario son identificadores únicos; la contraseña se maneja aparte)
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El nombre no puede superar los 20 caracteres' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/, {
    message: 'El nombre solo puede contener letras',
  })
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'El apellido no puede superar los 20 caracteres' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/, {
    message: 'El apellido solo puede contener letras',
  })
  apellido?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  fotoBannerPos?: string;
}
