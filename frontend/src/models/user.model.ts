export interface User {
  _id: string;
  nombre: string;
  apellido: string;
  correo: string;
  nombreUsuario: string;
  fechaNacimiento: string;
  descripcion: string;
  fotoPerfil: string;
  fotoBanner: string;
  fotoBannerPos: string;
  perfil: 'usuario' | 'administrador';
  habilitado: boolean; // alta/baja lógica (false = no puede ingresar)
  createdAt: string;
  updatedAt: string;
}
