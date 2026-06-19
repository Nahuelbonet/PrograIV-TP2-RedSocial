import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PublicacionDocument = Publicacion & Document;

// Comentario embebido dentro de la publicación.
// (No hay endpoint para crearlos en este sprint, pero Mi Perfil debe mostrarlos)
@Schema({ timestamps: true })
export class Comentario {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuario: Types.ObjectId;

  @Prop({ required: true })
  texto: string;

  @Prop({ default: false })
  modificado: boolean;
}
export const ComentarioSchema = SchemaFactory.createForClass(Comentario);

@Schema({ timestamps: true }) // agrega createdAt y updatedAt automáticamente
export class Publicacion {
  @Prop({ required: true })
  titulo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: '' })
  imagen: string; // URL de la imagen guardada (Supabase Storage)

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuario: Types.ObjectId; // autor de la publicación

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  likes: Types.ObjectId[]; // usuarios que dieron me gusta

  @Prop({ default: 0 })
  likesCount: number; // cantidad de me gusta (para ordenar)

  @Prop({ type: [ComentarioSchema], default: [] })
  comentarios: Comentario[];

  @Prop({ default: false })
  eliminada: boolean; // baja lógica
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
