import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async register(registerDto: RegisterDto, fotoPerfilUrl: string) {
    // Verificamos que el correo no esté en uso
    const existingEmail = await this.usersService.findByEmail(registerDto.correo);
    if (existingEmail) {
      throw new BadRequestException('El correo ya está registrado');
    }

    // Verificamos que el nombre de usuario no esté en uso
    const existingUsername = await this.usersService.findByUsername(registerDto.nombreUsuario);
    if (existingUsername) {
      throw new BadRequestException('El nombre de usuario ya está en uso');
    }

    // Encriptamos la contraseña con bcrypt (10 = nivel de complejidad del hash)
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Creamos el usuario con la contraseña encriptada y la URL de la foto
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      fotoPerfil: fotoPerfilUrl,
      fechaNacimiento: new Date(registerDto.fechaNacimiento),
    });

    // Devolvemos el usuario sin la contraseña
    const { password, ...result } = user.toObject();
    return result;
  }

  async login(loginDto: LoginDto) {
    // Busca por correo o nombre de usuario
    const user = await this.usersService.findByIdentifier(loginDto.nombreUsuario);
    if (!user) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    // Compara la contraseña recibida con el hash guardado
    const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    // Devuelve todos los datos del usuario (sin la contraseña)
    const { password, ...result } = user.toObject();
    return result;
  }
}
