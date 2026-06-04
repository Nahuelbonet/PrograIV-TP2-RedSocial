import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from '../models/user.model';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  register(formData: FormData): Observable<User> {
    return this.http.post<User>(`${API}/auth/register`, formData).pipe(
      tap(user => localStorage.setItem('usuario', JSON.stringify(user)))
    );
  }

  login(nombreUsuario: string, password: string): Observable<User> {
    return this.http.post<User>(`${API}/auth/login`, { nombreUsuario, password }).pipe(
      tap(user => localStorage.setItem('usuario', JSON.stringify(user)))
    );
  }

  getUsuario(): User | null {
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw) : null;
  }

  estaLogueado(): boolean {
    return !!this.getUsuario();
  }

  logout(): void {
    localStorage.removeItem('usuario');
  }
}
