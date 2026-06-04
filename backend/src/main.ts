import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  // Crea la carpeta de uploads si no existe (multer no la crea sola)
  mkdirSync(join(__dirname, '..', 'uploads', 'perfiles'), { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilita CORS para que el front en Angular pueda hacer peticiones
  app.enableCors({
    origin: '*', // en producción se reemplaza por la URL del front
  });

  // Valida automáticamente los DTOs en todas las rutas
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Sirve la carpeta uploads/ como archivos estáticos (para las fotos de perfil)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
