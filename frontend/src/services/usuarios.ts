import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private http = inject(HttpClient);

  // GET /users → listado de todos los usuarios (solo admin)
  listar(): Observable<User[]> {
    return this.http.get<User[]>(`${API}/users`);
  }

  // POST /users → alta de un usuario nuevo (FormData, mismos datos que el registro)
  crear(formData: FormData): Observable<User> {
    return this.http.post<User>(`${API}/users`, formData);
  }

  // DELETE /users/:id → baja lógica (deshabilitar)
  deshabilitar(id: string): Observable<User> {
    return this.http.delete<User>(`${API}/users/${id}`);
  }

  // POST /users/:id/habilitar → alta lógica (rehabilitar)
  habilitar(id: string): Observable<User> {
    return this.http.post<User>(`${API}/users/${id}/habilitar`, {});
  }
}
