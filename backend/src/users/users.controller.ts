import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import { AdminGuard } from '../auth/guards/admin.guard';
import { subirImagen } from '../common/supabase-storage';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ── GET /users → listado de usuarios (solo admin) ──
  @Get()
  @UseGuards(AdminGuard)
  async findAll() {
    return this.usersService.findAll();
  }

  // ── POST /users → alta de un usuario nuevo (solo admin), foto opcional ──
  // Usa el mismo DTO que el registro: "mismos datos que el registro".
  @Post()
  @UseGuards(AdminGuard)
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
  async crear(
    @Body() dto: RegisterDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let fotoPerfilUrl = '';
    if (file) fotoPerfilUrl = await subirImagen(file, 'perfiles');
    return this.usersService.crearPorAdmin(dto, fotoPerfilUrl);
  }

  // ── DELETE /users/:id → baja lógica: deshabilita al usuario (solo admin) ──
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deshabilitar(@Param('id') id: string) {
    return this.usersService.setHabilitado(id, false);
  }

  // ── POST /users/:id/habilitar → alta lógica: rehabilita al usuario (solo admin) ──
  @Post(':id/habilitar')
  @UseGuards(AdminGuard)
  async habilitar(@Param('id') id: string) {
    return this.usersService.setHabilitado(id, true);
  }

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
