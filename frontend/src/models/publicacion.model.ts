import { User } from './user.model';

// Datos del autor que devuelve el backend al popular (sin contraseña)
export interface AutorResumen {
  _id: string;
  nombre: string;
  apellido: string;
  nombreUsuario: string;
  fotoPerfil: string;
  perfil: 'usuario' | 'administrador';
}

export interface Comentario {
  _id?: string;
  usuario: AutorResumen;
  texto: string;
  createdAt?: string;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  usuario: AutorResumen;
  likes: string[]; // ids de los usuarios que dieron me gusta
  likesCount: number;
  comentarios: Comentario[];
  eliminada: boolean;
  createdAt: string;
  updatedAt: string;
}

// Respuesta paginada del listado
export interface ListaPublicaciones {
  total: number;
  publicaciones: Publicacion[];
}

export type OrdenPublicaciones = 'fecha' | 'likes';
