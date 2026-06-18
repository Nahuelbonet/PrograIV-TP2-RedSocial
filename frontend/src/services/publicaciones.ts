import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ListaPublicaciones,
  OrdenPublicaciones,
  Publicacion,
} from '../models/publicacion.model';
import { environment } from '../environments/environment';

const API = environment.apiUrl;

interface ListarOpciones {
  orden?: OrdenPublicaciones;
  usuarioId?: string;
  offset?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class PublicacionesService {
  private http = inject(HttpClient);

  // GET /publicaciones con ordenamiento, filtro por autor y paginación
  listar(opts: ListarOpciones = {}): Observable<ListaPublicaciones> {
    let params = new HttpParams();
    if (opts.orden) params = params.set('orden', opts.orden);
    if (opts.usuarioId) params = params.set('usuarioId', opts.usuarioId);
    if (opts.offset != null) params = params.set('offset', String(opts.offset));
    if (opts.limit != null) params = params.set('limit', String(opts.limit));
    return this.http.get<ListaPublicaciones>(`${API}/publicaciones`, { params });
  }

  // POST /publicaciones → alta (FormData: titulo, descripcion, usuarioId, imagen?)
  crear(formData: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${API}/publicaciones`, formData);
  }

  // DELETE /publicaciones/:id → baja lógica (autor o admin)
  eliminar(id: string, usuarioId: string): Observable<{ ok: boolean; id: string }> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.delete<{ ok: boolean; id: string }>(
      `${API}/publicaciones/${id}`,
      { params },
    );
  }

  // POST /publicaciones/:id/like → dar me gusta
  darLike(id: string, usuarioId: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(`${API}/publicaciones/${id}/like`, {
      usuarioId,
    });
  }

  // DELETE /publicaciones/:id/like → quitar me gusta
  quitarLike(id: string, usuarioId: string): Observable<Publicacion> {
    const params = new HttpParams().set('usuarioId', usuarioId);
    return this.http.delete<Publicacion>(`${API}/publicaciones/${id}/like`, {
      params,
    });
  }
}
