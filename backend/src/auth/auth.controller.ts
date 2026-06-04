import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

function uploadToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'perfiles' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result!.secure_url);
      },
    );
    Readable.from(buffer).pipe(stream);
  });
}

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
  async register(@Body() registerDto: RegisterDto, @UploadedFile() file: Express.Multer.File) {
    let fotoPerfilUrl = '';
    if (file) {
      fotoPerfilUrl = await uploadToCloudinary(file.buffer);
    }
    return this.authService.register(registerDto, fotoPerfilUrl);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
