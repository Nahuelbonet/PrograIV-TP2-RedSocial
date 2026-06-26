import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { EstadisticasService } from '../../../services/estadisticas';
import { Grafico } from '../../../components/grafico/grafico';
import { Boton } from '../../../components/boton/boton';
import { PuntoEstadistica } from '../../../models/estadistica.model';

@Component({
  selector: 'app-estadisticas-page',
  imports: [FormsModule, Grafico, Boton],
  templateUrl: './estadisticas-page.html',
  styleUrl: './estadisticas-page.scss',
})
export class EstadisticasPage implements OnInit {
  private estadisticasService = inject(EstadisticasService);

  // Rango de fechas (lo que escribe el usuario en los <input type="date">)
  desde = '';
  hasta = '';

  // Datos de cada gráfico
  publicacionesPorUsuario: PuntoEstadistica[] = [];
  comentariosPorDia: PuntoEstadistica[] = [];
  comentariosPorPublicacion: PuntoEstadistica[] = [];

  cargando = false;
  error = '';

  ngOnInit(): void {
    // Rango por defecto: los últimos 30 días
    const hoy = new Date();
    const hace30 = new Date();
    hace30.setDate(hoy.getDate() - 30);
    this.hasta = this.formato(hoy);
    this.desde = this.formato(hace30);
    this.cargar();
  }

  // El rango no es válido si "desde" es posterior a "hasta"
  get rangoInvalido(): boolean {
    return !!this.desde && !!this.hasta && this.desde > this.hasta;
  }

  // Convierte una fecha a 'YYYY-MM-DD' (formato del <input type="date">)
  private formato(fecha: Date): string {
    return fecha.toISOString().slice(0, 10);
  }

  cargar(): void {
    if (this.rangoInvalido) return;
    this.cargando = true;
    this.error = '';

    // forkJoin dispara los 3 pedidos a la vez y espera a que terminen TODOS
    forkJoin({
      porUsuario: this.estadisticasService.publicacionesPorUsuario(this.desde, this.hasta),
      porDia: this.estadisticasService.comentariosPorDia(this.desde, this.hasta),
      porPublicacion: this.estadisticasService.comentariosPorPublicacion(this.desde, this.hasta),
    }).subscribe({
      next: (res) => {
        this.publicacionesPorUsuario = res.porUsuario;
        this.comentariosPorDia = res.porDia;
        this.comentariosPorPublicacion = res.porPublicacion;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las estadísticas.';
        this.cargando = false;
      },
    });
  }
}
