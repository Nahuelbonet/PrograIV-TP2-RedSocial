import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PublicacionesController } from './publicaciones.controller';
import { PublicacionesService } from './publicaciones.service';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { Publicacion, PublicacionSchema } from './schemas/publicacion.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    // Registra el modelo Publicacion con su schema
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
    ]),
    // Importamos UsersModule para validar el rol (admin) al eliminar y en estadísticas
    UsersModule,
  ],
  controllers: [PublicacionesController, EstadisticasController],
  providers: [PublicacionesService, EstadisticasService],
})
export class PublicacionesModule {}
