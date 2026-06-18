import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PublicacionesService } from './publicaciones.service';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { LikeDto } from './dto/like.dto';
import { subirImagen } from '../common/supabase-storage';

@Controller('publicaciones')
export class PublicacionesController {
  constructor(private publicacionesService: PublicacionesService) {}

  // POST /publicaciones → alta (con imagen opcional, se guarda en Supabase Storage)
  @Post()
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\//)) {
          return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() dto: CreatePublicacionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let imagenUrl = '';
    if (file) {
      imagenUrl = await subirImagen(file, 'publicaciones');
    }
    return this.publicacionesService.create(dto, imagenUrl);
  }

  // GET /publicaciones?orden=fecha|likes&usuarioId=&offset=&limit=
  @Get()
  async findAll(
    @Query('orden') orden?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    return this.publicacionesService.findAll({
      orden,
      usuarioId,
      offset: Number(offset) || 0,
      limit: Number(limit) || 10,
    });
  }

  // DELETE /publicaciones/:id?usuarioId= → baja lógica (autor o admin)
  @Delete(':id')
  async remove(@Param('id') id: string, @Query('usuarioId') usuarioId: string) {
    return this.publicacionesService.softDelete(id, usuarioId);
  }

  // POST /publicaciones/:id/like → dar me gusta
  @Post(':id/like')
  async like(@Param('id') id: string, @Body() dto: LikeDto) {
    return this.publicacionesService.like(id, dto.usuarioId);
  }

  // DELETE /publicaciones/:id/like?usuarioId= → quitar me gusta
  @Delete(':id/like')
  async unlike(
    @Param('id') id: string,
    @Query('usuarioId') usuarioId: string,
  ) {
    return this.publicacionesService.unlike(id, usuarioId);
  }
}
