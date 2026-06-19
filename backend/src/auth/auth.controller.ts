import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { TokenDto } from './dto/token.dto';
import { subirImagen } from '../common/supabase-storage';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
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
  async register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    let fotoPerfilUrl = '';
    if (file) fotoPerfilUrl = await subirImagen(file, 'perfiles');
    return this.authService.register(registerDto, fotoPerfilUrl);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Valida el token. Devuelve los datos del usuario o 401.
  @Post('autorizar')
  async autorizar(@Body() body: TokenDto) {
    return this.authService.autorizar(body.token);
  }

  // Refresca el token. Devuelve un nuevo token con vencimiento de 15 min.
  @Post('refrescar')
  async refrescar(@Body() body: TokenDto) {
    return this.authService.refrescar(body.token);
  }
}
