import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from '../auth/dto/register.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Busca por correo O por nombre de usuario (para el login)
  async findByIdentifier(nombreUsuario: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      $or: [{ correo: nombreUsuario }, { nombreUsuario: nombreUsuario }],
    });
  }

  // Busca solo por correo (para validar unicidad en registro)
  async findByEmail(correo: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ correo });
  }

  // Busca solo por nombre de usuario (para validar unicidad en registro)
  async findByUsername(nombreUsuario: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ nombreUsuario });
  }

  // Busca por id (usado para validar el rol al eliminar publicaciones)
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  // Crea y guarda el usuario en la BD
  async create(data: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }

  // Actualiza los datos del perfil y devuelve el usuario sin la contraseña
  async update(id: string, data: Partial<User>) {
    const user = await this.userModel.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const { password, ...result } = user.toObject();
    return result;
  }

  // ── ADMIN: listar todos los usuarios (sin la contraseña) ──
  async findAll() {
    return this.userModel
      .find()
      .select('-password') // nunca devolvemos la contraseña
      .sort({ createdAt: -1 }); // los más nuevos primero
  }

  // ── ADMIN: crear un usuario nuevo (puede ser usuario o administrador) ──
  async crearPorAdmin(data: RegisterDto, fotoPerfilUrl: string) {
    // Validamos que el correo y el nombre de usuario no estén repetidos
    if (await this.findByEmail(data.correo)) {
      throw new BadRequestException('El correo ya está registrado');
    }
    if (await this.findByUsername(data.nombreUsuario)) {
      throw new BadRequestException('El nombre de usuario ya está en uso');
    }

    // Encriptamos la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.create({
      ...data,
      password: hashedPassword,
      fotoPerfil: fotoPerfilUrl,
      fechaNacimiento: new Date(data.fechaNacimiento),
    });

    const { password, ...result } = user.toObject();
    return result; // devolvemos el usuario creado sin la contraseña
  }

  // ── ADMIN: alta/baja lógica (habilitar o deshabilitar un usuario) ──
  async setHabilitado(id: string, habilitado: boolean) {
    const user = await this.userModel
      .findByIdAndUpdate(id, { habilitado }, { new: true })
      .select('-password');
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }
}
