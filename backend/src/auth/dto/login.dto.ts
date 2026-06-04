import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  // Puede ser correo o nombre de usuario
  @IsString()
  @IsNotEmpty({ message: 'El usuario o correo es obligatorio' })
  nombreUsuario: string;

  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;
}
