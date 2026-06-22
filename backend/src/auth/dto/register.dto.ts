import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(20, { message: 'El nombre no puede superar los 20 caracteres' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/, {
    message: 'El nombre solo puede contener letras',
  })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(20, { message: 'El apellido no puede superar los 20 caracteres' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/, {
    message: 'El apellido solo puede contener letras',
  })
  apellido: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  correo: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @MaxLength(20, { message: 'El nombre de usuario no puede superar los 20 caracteres' })
  nombreUsuario: string;

  // Al menos 8 caracteres, una mayúscula y un número
  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'La fecha de nacimiento es obligatoria' })
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsIn(['usuario', 'administrador'], {
    message: 'El perfil debe ser usuario o administrador',
  })
  perfil?: string;
}
