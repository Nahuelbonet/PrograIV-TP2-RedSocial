import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // POST /auth/register
  // Recibe los datos del formulario + un archivo de imagen con el campo 'fotoPerfil'
  @Post('register')
  @UseInterceptors(
    FileInterceptor('fotoPerfil', {
      storage: diskStorage({
        destination: './uploads/perfiles', // carpeta donde se guarda la imagen
        filename: (req, file, cb) => {
          // Nombre único: timestamp + extensión original (ej: 1717000000000.jpg)
          const uniqueName = `${Date.now()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Solo aceptamos imágenes
        if (!file.mimetype.match(/^image\//)) {
          return cb(new Error('Solo se permiten imágenes'), false);
        }
        cb(null, true);
      },
    }),
  )
  async register(@Body() registerDto: RegisterDto, @UploadedFile() file: Express.Multer.File) {
    // Si mandaron imagen, armamos la URL; si no, queda vacío
    const fotoPerfilUrl = file ? `/uploads/perfiles/${file.filename}` : '';
    return this.authService.register(registerDto, fotoPerfilUrl);
  }

  // POST /auth/login
  // Recibe identifier (correo o usuario) y password
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
