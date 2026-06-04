import { Injectable } from '@nestjs/common';
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

  // Crea y guarda el usuario en la BD
  async create(data: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(data);
    return user.save();
  }
}
