import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';

// Formato único que devuelven las 3 estadísticas.
// El front usa un solo componente de gráfico para todas.
export interface PuntoEstadistica {
  etiqueta: string; // qué se muestra (nombre de usuario, fecha o título)
  cantidad: number; // el valor numérico de la barra/porción/punto
}

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name)
    private pubModel: Model<PublicacionDocument>,
  ) {}

  // Arma el rango de fechas. Si no se pasan, abarca "desde siempre hasta ahora".
  private rango(desde?: string, hasta?: string) {
    const inicio = desde ? new Date(desde) : new Date(0);
    const fin = hasta ? new Date(hasta) : new Date();
    if (hasta) fin.setHours(23, 59, 59, 999); // incluir todo el día "hasta"
    return { inicio, fin };
  }

  // 1) Cantidad de publicaciones por usuario (gráfico de BARRAS)
  async publicacionesPorUsuario(
    desde?: string,
    hasta?: string,
  ): Promise<PuntoEstadistica[]> {
    const { inicio, fin } = this.rango(desde, hasta);
    return this.pubModel.aggregate<PuntoEstadistica>([
      // 1. Filtramos por el rango de fechas elegido
      { $match: { createdAt: { $gte: inicio, $lte: fin } } },
      // 2. Agrupamos por autor y contamos cuántas hizo cada uno.
      //    Convertimos "usuario" a ObjectId con $toObjectId porque puede estar
      //    guardado como string, y si no, el $lookup no matchea con users._id.
      { $group: { _id: { $toObjectId: '$usuario' }, cantidad: { $sum: 1 } } },
      // 3. Traemos los datos del usuario (join con la colección users)
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'autor',
        },
      },
      { $unwind: '$autor' },
      // 4. Devolvemos nombre completo + cantidad
      {
        $project: {
          _id: 0,
          etiqueta: { $concat: ['$autor.nombre', ' ', '$autor.apellido'] },
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);
  }

  // 2) Cantidad de comentarios por día (gráfico de LÍNEAS)
  async comentariosPorDia(
    desde?: string,
    hasta?: string,
  ): Promise<PuntoEstadistica[]> {
    const { inicio, fin } = this.rango(desde, hasta);
    return this.pubModel.aggregate<PuntoEstadistica>([
      // 1. "Abrimos" el array de comentarios: 1 fila por comentario
      { $unwind: '$comentarios' },
      // 2. Filtramos los comentarios por la fecha en que se hicieron
      { $match: { 'comentarios.createdAt': { $gte: inicio, $lte: fin } } },
      // 3. Agrupamos por día (YYYY-MM-DD) y contamos
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$comentarios.createdAt' },
          },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, etiqueta: '$_id', cantidad: 1 } },
      { $sort: { etiqueta: 1 } }, // orden cronológico
    ]);
  }

  // 3) Cantidad de comentarios en cada publicación (gráfico de TORTA)
  async comentariosPorPublicacion(
    desde?: string,
    hasta?: string,
  ): Promise<PuntoEstadistica[]> {
    const { inicio, fin } = this.rango(desde, hasta);
    return this.pubModel.aggregate<PuntoEstadistica>([
      { $unwind: '$comentarios' },
      { $match: { 'comentarios.createdAt': { $gte: inicio, $lte: fin } } },
      // Agrupamos por publicación, guardando su título
      {
        $group: {
          _id: '$_id',
          titulo: { $first: '$titulo' },
          cantidad: { $sum: 1 },
        },
      },
      { $project: { _id: 0, etiqueta: '$titulo', cantidad: 1 } },
      { $sort: { cantidad: -1 } },
    ]);
  }
}
