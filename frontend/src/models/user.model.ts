export interface User {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  fotoPerfil: string;
  perfil: 'usuario' | 'administrador';
  createdAt: string;
  updatedAt: string;
}
