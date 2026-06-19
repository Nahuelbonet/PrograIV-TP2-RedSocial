import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private crearToken(user: {
    _id: any;
    correo: string;
    nombreUsuario: string;
    perfil: string;
  }): string {
    return this.jwtService.sign({
      sub: user._id.toString(),
      correo: user.correo,
      nombreUsuario: user.nombreUsuario,
      perfil: user.perfil,
    });
  }

  async register(registerDto: RegisterDto, fotoPerfilUrl: string) {
    const existingEmail = await this.usersService.findByEmail(registerDto.correo);
    if (existingEmail) throw new BadRequestException('El correo ya está registrado');

    const existingUsername = await this.usersService.findByUsername(registerDto.nombreUsuario);
    if (existingUsername) throw new BadRequestException('El nombre de usuario ya está en uso');

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      fotoPerfil: fotoPerfilUrl,
      fechaNacimiento: new Date(registerDto.fechaNacimiento),
    });

    const { password, ...usuario } = user.toObject();
    return { usuario, token: this.crearToken(usuario) };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByIdentifier(loginDto.nombreUsuario);
    if (!user) throw new UnauthorizedException('Usuario o contraseña incorrectos');

    const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Usuario o contraseña incorrectos');

    const { password, ...usuario } = user.toObject();
    return { usuario, token: this.crearToken(usuario) };
  }

  async autorizar(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException();
      const { password, ...usuario } = user.toObject();
      return usuario;
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }

  async refrescar(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const nuevoToken = this.jwtService.sign({
        sub: payload.sub,
        correo: payload.correo,
        nombreUsuario: payload.nombreUsuario,
        perfil: payload.perfil,
      });
      return { token: nuevoToken };
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }
}
