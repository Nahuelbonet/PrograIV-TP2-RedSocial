import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

// Protege las rutas del dashboard: solo entran los administradores logueados.
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Si no está logueado, al login
  if (!auth.estaLogueado()) {
    return router.createUrlTree(['/login']);
  }
  // Si está logueado pero no es admin, lo mandamos a publicaciones
  if (auth.getUsuario()?.perfil !== 'administrador') {
    return router.createUrlTree(['/publicaciones']);
  }
  return true;
};
