import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { AdminGuard } from '../auth/guards/admin.guard';

// @UseGuards a nivel de clase => TODAS las rutas requieren token de administrador
@Controller('estadisticas')
@UseGuards(AdminGuard)
export class EstadisticasController {
  constructor(private estadisticasService: EstadisticasService) {}

  // GET /estadisticas/publicaciones-por-usuario?desde=&hasta=
  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.estadisticasService.publicacionesPorUsuario(desde, hasta);
  }

  // GET /estadisticas/comentarios-por-dia?desde=&hasta=
  @Get('comentarios-por-dia')
  comentariosPorDia(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.estadisticasService.comentariosPorDia(desde, hasta);
  }

  // GET /estadisticas/comentarios-por-publicacion?desde=&hasta=
  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return this.estadisticasService.comentariosPorPublicacion(desde, hasta);
  }
}
