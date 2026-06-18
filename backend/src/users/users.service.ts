import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

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
}
