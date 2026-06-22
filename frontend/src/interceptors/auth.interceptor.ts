import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

// Se ejecuta en CADA pedido HTTP: le pega el token automáticamente
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  // Si hay token, lo agrega en la cabecera Authorization; si no, manda el pedido tal cual
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend responde 401 (token vencido/inválido) → desloguea y va al login
      if (error.status === 401) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
