import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Publicacion, PublicacionDocument } from './schemas/publicacion.schema';
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { UsersService } from '../users/users.service';

// Campos del usuario que devolvemos al popular (nunca la contraseña)
const USER_FIELDS = 'nombre apellido nombreUsuario fotoPerfil perfil';

interface ListarOpciones {
  orden?: string; // 'fecha' (default) | 'likes'
  usuarioId?: string; // filtrar por autor
  offset?: number;
  limit?: number;
}

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private pubModel: Model<PublicacionDocument>,
    private usersService: UsersService,
  ) {}

  // ── ALTA ────────────────────────────────────────────
  async create(dto: CreatePublicacionDto, imagenUrl: string) {
    const pub = new this.pubModel({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      imagen: imagenUrl,
      usuario: dto.usuarioId,
    });
    const guardada = await pub.save();
    return guardada.populate('usuario', USER_FIELDS);
  }

  // ── LISTADO ─────────────────────────────────────────
  async findAll(opts: ListarOpciones) {
    const limit = opts.limit && opts.limit > 0 ? opts.limit : 10;
    const offset = opts.offset && opts.offset > 0 ? opts.offset : 0;

    // Solo publicaciones activas (no dadas de baja)
    const filtro: Record<string, unknown> = { eliminada: false };
    if (opts.usuarioId && isValidObjectId(opts.usuarioId)) {
      filtro.usuario = opts.usuarioId;
    }

    // Ordenamiento: por cantidad de me gusta o por fecha (default)
    const sort: Record<string, 1 | -1> =
      opts.orden === 'likes'
        ? { likesCount: -1, createdAt: -1 }
        : { createdAt: -1 };

    const [publicaciones, total] = await Promise.all([
      this.pubModel
        .find(filtro)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .populate('usuario', USER_FIELDS)
        .populate('comentarios.usuario', USER_FIELDS)
        .exec(),
      this.pubModel.countDocuments(filtro),
    ]);

    return { total, publicaciones };
  }

  // ── BAJA LÓGICA ─────────────────────────────────────
  // Solo el autor o un administrador pueden eliminarla.
  async softDelete(id: string, usuarioId: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Publicación no encontrada');
    }
    const pub = await this.pubModel.findById(id);
    if (!pub || pub.eliminada) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const esPropietario = pub.usuario.toString() === usuarioId;
    let esAdmin = false;
    if (!esPropietario && usuarioId && isValidObjectId(usuarioId)) {
      const user = await this.usersService.findById(usuarioId);
      esAdmin = user?.perfil === 'administrador';
    }
    if (!esPropietario && !esAdmin) {
      throw new ForbiddenException(
        'No tenés permiso para eliminar esta publicación',
      );
    }

    pub.eliminada = true;
    await pub.save();
    return { ok: true, id };
  }

  // ── DAR ME GUSTA ────────────────────────────────────
  // Un usuario puede dar un solo me gusta por publicación (idempotente).
  async like(id: string, usuarioId: string) {
    this.validarIds(id, usuarioId);
    const objUserId = new Types.ObjectId(usuarioId);

    // Solo incrementa si el usuario no había dado like todavía
    const actualizada = await this.pubModel
      .findOneAndUpdate(
        { _id: id, eliminada: false, likes: { $ne: objUserId } },
        { $addToSet: { likes: objUserId }, $inc: { likesCount: 1 } },
        { new: true },
      )
      .populate('usuario', USER_FIELDS)
      .populate('comentarios.usuario', USER_FIELDS);

    if (actualizada) return actualizada;

    // No matcheó: o no existe, o el usuario ya tenía like (no se duplica)
    return this.obtenerActivaOError(id);
  }

  // ── QUITAR ME GUSTA ─────────────────────────────────
  // Solo si el usuario lo había dado previamente.
  async unlike(id: string, usuarioId: string) {
    this.validarIds(id, usuarioId);
    const objUserId = new Types.ObjectId(usuarioId);

    const actualizada = await this.pubModel
      .findOneAndUpdate(
        { _id: id, eliminada: false, likes: objUserId },
        { $pull: { likes: objUserId }, $inc: { likesCount: -1 } },
        { new: true },
      )
      .populate('usuario', USER_FIELDS)
      .populate('comentarios.usuario', USER_FIELDS);

    if (actualizada) return actualizada;

    // No matcheó: o no existe, o el usuario no había dado like
    return this.obtenerActivaOError(id);
  }

  // ── UNA PUBLICACIÓN ─────────────────────────────────
  async findOne(id: string) {
    if (!isValidObjectId(id)) throw new NotFoundException('Publicación no encontrada');
    const pub = await this.pubModel
      .findOne({ _id: id, eliminada: false })
      .populate('usuario', USER_FIELDS)
      .populate('comentarios.usuario', USER_FIELDS);
    if (!pub) throw new NotFoundException('Publicación no encontrada');
    return pub;
  }

  // ── COMENTARIOS (paginados, más recientes primero) ──
  async getComentarios(id: string, offset: number, limit: number) {
    if (!isValidObjectId(id)) throw new NotFoundException('Publicación no encontrada');
    const pub = await this.pubModel
      .findOne({ _id: id, eliminada: false })
      .populate('comentarios.usuario', USER_FIELDS);
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    const todos = [...pub.comentarios].reverse(); // más recientes primero
    const total = todos.length;
    const comentarios = todos.slice(offset, offset + limit);
    return { total, comentarios };
  }

  // ── AGREGAR COMENTARIO ───────────────────────────────
  async addComentario(id: string, dto: CreateComentarioDto) {
    if (!isValidObjectId(id) || !isValidObjectId(dto.usuarioId)) {
      throw new BadRequestException('IDs inválidos');
    }
    const pub = await this.pubModel
      .findOneAndUpdate(
        { _id: id, eliminada: false },
        { $push: { comentarios: { usuario: new Types.ObjectId(dto.usuarioId), texto: dto.texto } } },
        { new: true },
      )
      .populate('usuario', USER_FIELDS)
      .populate('comentarios.usuario', USER_FIELDS);
    if (!pub) throw new NotFoundException('Publicación no encontrada');
    return pub;
  }

  // ── EDITAR COMENTARIO ────────────────────────────────
  async updateComentario(pubId: string, comentarioId: string, dto: UpdateComentarioDto) {
    if (!isValidObjectId(pubId) || !isValidObjectId(comentarioId)) {
      throw new BadRequestException('IDs inválidos');
    }
    const pub = await this.pubModel.findOne({ _id: pubId, eliminada: false });
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    const comentario = pub.comentarios.find(
      (c: any) => c._id?.toString() === comentarioId,
    );
    if (!comentario) throw new NotFoundException('Comentario no encontrado');
    if (comentario.usuario.toString() !== dto.usuarioId) {
      throw new ForbiddenException('No podés editar este comentario');
    }

    await this.pubModel.updateOne(
      { _id: pubId, 'comentarios._id': comentarioId },
      { $set: { 'comentarios.$.texto': dto.texto, 'comentarios.$.modificado': true } },
    );

    return this.findOne(pubId);
  }

  // ── Helpers ─────────────────────────────────────────
  private validarIds(id: string, usuarioId: string) {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Publicación no encontrada');
    }
    if (!isValidObjectId(usuarioId)) {
      throw new BadRequestException('Usuario no válido');
    }
  }

  private async obtenerActivaOError(id: string) {
    const actual = await this.pubModel
      .findOne({ _id: id, eliminada: false })
      .populate('usuario', USER_FIELDS)
      .populate('comentarios.usuario', USER_FIELDS);
    if (!actual) {
      throw new NotFoundException('Publicación no encontrada');
    }
    return actual;
  }
}
