import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';

// "Portero" que se ejecuta ANTES del controller.
// Solo deja pasar la petición si el token pertenece a un administrador habilitado.
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1) Sacamos el token del header "Authorization: Bearer xxxxx"
    const header: string = request.headers['authorization'] ?? '';
    const [tipo, token] = header.split(' ');
    if (tipo !== 'Bearer' || !token) {
      throw new UnauthorizedException('Falta el token de autenticación');
    }

    // 2) Verificamos firma y vencimiento. Si falla, lanza error -> 401
    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido o vencido');
    }

    // 3) Buscamos al usuario REAL en la base (no confiamos solo en el token,
    //    porque su rol pudo cambiar o pudo ser deshabilitado después del login)
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.habilitado) {
      throw new UnauthorizedException('Usuario no autorizado');
    }
    if (user.perfil !== 'administrador') {
      throw new ForbiddenException('Se requieren permisos de administrador');
    }

    // 4) Dejamos el usuario "pegado" en la request por si el controller lo necesita
    request.user = user;
    return true;
  }
}
