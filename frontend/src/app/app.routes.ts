import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login-page/login-page';
import { RegistroPage } from './pages/registro/registro-page/registro-page';
import { PublicacionesPage } from './pages/publicaciones/publicaciones-page/publicaciones-page';
import { MiPerfilPage } from './pages/mi-perfil/mi-perfil-page/mi-perfil-page';

export const routes: Routes = [
  { path: '', redirectTo: '/publicaciones', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
  { path: 'registro', component: RegistroPage },
  { path: 'publicaciones', component: PublicacionesPage },
  { path: 'mi-perfil', component: MiPerfilPage },
  { path: '**', redirectTo: '/publicaciones' }
];
