import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login-page/login-page';
import { RegistroPage } from './pages/registro/registro-page/registro-page';
import { PublicacionesPage } from './pages/publicaciones/publicaciones-page/publicaciones-page';
import { PublicacionDetallePage } from './pages/publicaciones/publicacion-detalle/publicacion-detalle-page';
import { MiPerfilPage } from './pages/mi-perfil/mi-perfil-page/mi-perfil-page';
import { CargandoPage } from './pages/cargando/cargando-page';
import { UsuariosPage } from './pages/dashboard/usuarios/usuarios-page';
import { EstadisticasPage } from './pages/dashboard/estadisticas/estadisticas-page';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/cargando', pathMatch: 'full' },
  { path: 'cargando', component: CargandoPage },
  { path: 'login', component: LoginPage },
  { path: 'registro', component: RegistroPage },
  { path: 'publicaciones', component: PublicacionesPage, canActivate: [authGuard] },
  { path: 'publicaciones/:id', component: PublicacionDetallePage, canActivate: [authGuard] },
  { path: 'mi-perfil', component: MiPerfilPage, canActivate: [authGuard] },
  { path: 'dashboard/usuarios', component: UsuariosPage, canActivate: [adminGuard] },
  { path: 'dashboard/estadisticas', component: EstadisticasPage, canActivate: [adminGuard] },
  { path: '**', redirectTo: '/login' },
];
