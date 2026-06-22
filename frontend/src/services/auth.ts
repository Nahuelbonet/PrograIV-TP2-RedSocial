import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../environments/environment';

const API = environment.apiUrl;

interface AuthResponse {
  usuario: User;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  register(formData: FormData): Observable<User> {
    return this.http.post<AuthResponse>(`${API}/auth/register`, formData).pipe(
      // Al registrarse, guarda el usuario y el token en el navegador
      tap(({ usuario, token }) => {
        localStorage.setItem('usuario', JSON.stringify(usuario));
        localStorage.setItem('token', token);
      }),
      map(({ usuario }) => usuario),
    );
  }

  login(nombreUsuario: string, password: string): Observable<User> {
    return this.http
      .post<AuthResponse>(`${API}/auth/login`, { nombreUsuario, password })
      .pipe(
        // Al loguearse, guarda el usuario y el token en el navegador
        tap(({ usuario, token }) => {
          localStorage.setItem('usuario', JSON.stringify(usuario));
          localStorage.setItem('token', token);
        }),
        map(({ usuario }) => usuario),
      );
  }

  actualizarPerfil(id: string, formData: FormData): Observable<User> {
    return this.http.patch<User>(`${API}/users/${id}`, formData).pipe(
      tap((user) => localStorage.setItem('usuario', JSON.stringify(user))),
    );
  }

  // Le pregunta al backend si el token sigue siendo válido
  autorizar(token: string): Observable<User> {
    return this.http.post<User>(`${API}/auth/autorizar`, { token });
  }

  // Pide al backend un token nuevo antes de que venza el actual
  refrescar(token: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${API}/auth/refrescar`, { token });
  }

  // Devuelve el token guardado (o null si no hay)
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsuario(): User | null {
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  }

  // Está logueado si tiene token Y usuario guardados
  estaLogueado(): boolean {
    return !!this.getToken() && !!this.getUsuario();
  }

  // Cierra sesión: borra el token y el usuario del navegador
  logout(): void {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  }
}
