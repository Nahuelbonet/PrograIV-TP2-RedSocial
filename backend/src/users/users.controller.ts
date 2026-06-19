import {
  Body,
  Controller,
  Param,
  Patch,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { subirImagen } from '../common/supabase-storage';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'fotoPerfil', maxCount: 1 }, { name: 'fotoBanner', maxCount: 1 }],
      {
        storage: memoryStorage(),
        fileFilter: (req, file, cb) => {
          if (!file.mimetype.match(/^image\//)) {
            return cb(new Error('Solo se permiten imágenes'), false);
          }
          cb(null, true);
        },
      },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @UploadedFiles() files: { fotoPerfil?: Express.Multer.File[]; fotoBanner?: Express.Multer.File[] },
  ) {
    const data: Record<string, unknown> = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre;
    if (dto.apellido !== undefined) data.apellido = dto.apellido;
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion;
    if (dto.fechaNacimiento) data.fechaNacimiento = new Date(dto.fechaNacimiento);
    if (files?.fotoPerfil?.[0]) data.fotoPerfil = await subirImagen(files.fotoPerfil[0], 'perfiles');
    if (files?.fotoBanner?.[0]) data.fotoBanner = await subirImagen(files.fotoBanner[0], 'banners');
    if (dto.fotoBannerPos !== undefined) data.fotoBannerPos = dto.fotoBannerPos;

    return this.usersService.update(id, data);
  }
}
