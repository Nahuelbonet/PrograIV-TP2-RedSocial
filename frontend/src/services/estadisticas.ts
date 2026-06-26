import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PuntoEstadistica } from '../models/estadistica.model';
import { environment } from '../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private http = inject(HttpClient);

  // Arma los query params ?desde=&hasta= solo si tienen valor
  private params(desde?: string, hasta?: string): HttpParams {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return params;
  }

  // GET /estadisticas/publicaciones-por-usuario (gráfico de barras)
  publicacionesPorUsuario(desde?: string, hasta?: string): Observable<PuntoEstadistica[]> {
    return this.http.get<PuntoEstadistica[]>(
      `${API}/estadisticas/publicaciones-por-usuario`,
      { params: this.params(desde, hasta) },
    );
  }

  // GET /estadisticas/comentarios-por-dia (gráfico de líneas)
  comentariosPorDia(desde?: string, hasta?: string): Observable<PuntoEstadistica[]> {
    return this.http.get<PuntoEstadistica[]>(
      `${API}/estadisticas/comentarios-por-dia`,
      { params: this.params(desde, hasta) },
    );
  }

  // GET /estadisticas/comentarios-por-publicacion (gráfico de torta)
  comentariosPorPublicacion(desde?: string, hasta?: string): Observable<PuntoEstadistica[]> {
    return this.http.get<PuntoEstadistica[]>(
      `${API}/estadisticas/comentarios-por-publicacion`,
      { params: this.params(desde, hasta) },
    );
  }
}
