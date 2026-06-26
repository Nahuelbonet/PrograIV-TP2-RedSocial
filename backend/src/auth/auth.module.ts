import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    // Configura el manejo de tokens JWT (global: disponible en TODA la app,
    // así no hace falta volver a registrarlo en otros módulos como Users).
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET ?? 'jwt_secret_cambiar_en_produccion', // clave secreta para firmar/verificar
        signOptions: { expiresIn: '15m' }, // el token vence a los 15 minutos
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
