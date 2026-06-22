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

  // Crea (firma) el token JWT con los datos del usuario adentro
  private crearToken(user: {
    _id: any;
    correo: string;
    nombreUsuario: string;
    perfil: string;
  }): string {
    return this.jwtService.sign({
      sub: user._id.toString(), // id del usuario
      correo: user.correo,
      nombreUsuario: user.nombreUsuario,
      perfil: user.perfil,
    });
  }

  async register(registerDto: RegisterDto, fotoPerfilUrl: string) {
    // Valida que el correo y el usuario no estén ya registrados
    const existingEmail = await this.usersService.findByEmail(registerDto.correo);
    if (existingEmail) throw new BadRequestException('El correo ya está registrado');

    const existingUsername = await this.usersService.findByUsername(registerDto.nombreUsuario);
    if (existingUsername) throw new BadRequestException('El nombre de usuario ya está en uso');

    // Encripta la contraseña antes de guardarla en la base
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      fotoPerfil: fotoPerfilUrl,
      fechaNacimiento: new Date(registerDto.fechaNacimiento),
    });

    // Devuelve el usuario (sin la password) junto con su token recién creado
    const { password, ...usuario } = user.toObject();
    return { usuario, token: this.crearToken(usuario) };
  }

  async login(loginDto: LoginDto) {
    // Busca el usuario por nombre de usuario o correo
    const user = await this.usersService.findByIdentifier(loginDto.nombreUsuario);
    if (!user) throw new UnauthorizedException('Usuario o contraseña incorrectos');

    // Compara la contraseña ingresada con la encriptada guardada
    const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Usuario o contraseña incorrectos');

    // Si todo OK, devuelve el usuario + un token nuevo
    const { password, ...usuario } = user.toObject();
    return { usuario, token: this.crearToken(usuario) };
  }

  // Verifica si un token es válido y devuelve el usuario dueño del mismo
  async autorizar(token: string) {
    try {
      const payload = this.jwtService.verify(token); // chequea firma y que no esté vencido
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException();
      const { password, ...usuario } = user.toObject();
      return usuario;
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }
  }

  // Renueva el token: si el actual sigue válido, genera uno nuevo con más tiempo
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
