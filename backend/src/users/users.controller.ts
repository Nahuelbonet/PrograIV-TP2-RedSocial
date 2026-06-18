import {
  Body,
  Controller,
  Param,
  Patch,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { subirImagen } from '../common/supabase-storage';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // PATCH /users/:id → edita el perfil (con foto opcional)
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('fotoPerfil', {
      storage: memoryStorage(),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\//)) {
          return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const data: Record<string, unknown> = {};
    if (dto.nombre !== undefined) data.nombre = dto.nombre;
    if (dto.apellido !== undefined) data.apellido = dto.apellido;
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion;
    if (dto.fechaNacimiento) data.fechaNacimiento = new Date(dto.fechaNacimiento);
    if (file) data.fotoPerfil = await subirImagen(file, 'perfiles');

    return this.usersService.update(id, data);
  }
}
