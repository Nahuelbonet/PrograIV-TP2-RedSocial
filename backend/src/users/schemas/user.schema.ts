import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true }) // agrega createdAt y updatedAt automáticamente
export class User {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true }) // único en la BD
  correo: string;

  @Prop({ required: true, unique: true }) // único en la BD
  nombreUsuario: string;

  @Prop({ required: true })
  password: string; // guardada encriptada

  @Prop({ required: true })
  fechaNacimiento: Date;

  @Prop({ default: '' })
  descripcion: string;

  @Prop({ default: '' })
  fotoPerfil: string;

  @Prop({ default: '' })
  fotoBanner: string;

  @Prop({ default: '50% 50%' })
  fotoBannerPos: string;

  @Prop({ default: 'usuario', enum: ['usuario', 'administrador'] })
  perfil: string; // rol del usuario

  @Prop({ default: true })
  habilitado: boolean; // alta/baja lógica: si está en false no puede ingresar
}

export const UserSchema = SchemaFactory.createForClass(User);
