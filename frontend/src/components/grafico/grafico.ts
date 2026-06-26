import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { PuntoEstadistica } from '../../models/estadistica.model';

// Registra todos los tipos de gráfico de Chart.js (barras, líneas, torta, etc.)
// Se ejecuta una sola vez, al importar el componente.
Chart.register(...registerables);

@Component({
  selector: 'app-grafico',
  imports: [],
  templateUrl: './grafico.html',
  styleUrl: './grafico.scss',
})
export class Grafico implements AfterViewInit, OnChanges, OnDestroy {
  @Input() tipo: 'bar' | 'line' | 'pie' = 'bar';
  @Input() datos: PuntoEstadistica[] = [];
  @Input() titulo = '';
  @Input() etiquetaDataset = 'Cantidad';

  // Referencia al <canvas> del HTML donde Chart.js dibuja
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private listo = false; // el canvas existe recién después de AfterViewInit

  // Paleta de colores (la misma del tema de la app)
  private readonly paleta = [
    '#818cf8', '#ec4899', '#22d3ee', '#a78bfa',
    '#4ade80', '#fbbf24', '#fb7185', '#34d399',
  ];

  ngAfterViewInit(): void {
    this.listo = true;
    this.dibujar();
  }

  // Cada vez que cambian los datos (al cambiar el rango de fechas), redibuja
  ngOnChanges(): void {
    if (this.listo) this.dibujar();
  }

  ngOnDestroy(): void {
    this.chart?.destroy(); // libera el gráfico al salir de la página
  }

  get vacio(): boolean {
    return this.datos.length === 0;
  }

  private dibujar(): void {
    this.chart?.destroy(); // borramos el gráfico anterior antes de redibujar
    this.chart = undefined;
    if (this.vacio) return; // sin datos: no dibujamos nada

    const labels = this.datos.map((d) => d.etiqueta);
    const valores = this.datos.map((d) => d.cantidad);

    // 'any' porque la config de Chart.js cambia según el tipo de gráfico
    const config: any = {
      type: this.tipo,
      data: { labels, datasets: [this.dataset(valores)] },
      options: this.opciones(),
    };
    this.chart = new Chart(this.canvas.nativeElement, config);
  }

  // Arma el dataset según el tipo de gráfico
  private dataset(valores: number[]) {
    if (this.tipo === 'line') {
      return {
        label: this.etiquetaDataset,
        data: valores,
        borderColor: this.paleta[0],
        backgroundColor: 'rgba(129, 140, 248, 0.15)',
        borderWidth: 2,
        tension: 0.3, // curva suave
        fill: true,
        pointBackgroundColor: this.paleta[0],
      };
    }
    if (this.tipo === 'pie') {
      return {
        label: this.etiquetaDataset,
        data: valores,
        backgroundColor: valores.map((_, i) => this.paleta[i % this.paleta.length]),
        borderColor: '#0b1020',
        borderWidth: 2,
      };
    }
    // barras
    return {
      label: this.etiquetaDataset,
      data: valores,
      backgroundColor: valores.map((_, i) => this.paleta[i % this.paleta.length]),
      borderRadius: 6,
    };
  }

  // Opciones de presentación (colores de ejes/leyenda acordes al tema oscuro)
  private opciones(): any {
    const ejes = {
      x: { ticks: { color: '#8b97b4' }, grid: { color: 'rgba(255,255,255,0.06)' } },
      y: {
        beginAtZero: true,
        ticks: { color: '#8b97b4', precision: 0 }, // números enteros
        grid: { color: 'rgba(255,255,255,0.06)' },
      },
    };
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        // La leyenda solo tiene sentido en la torta (cada porción es una etiqueta)
        legend: { display: this.tipo === 'pie', labels: { color: '#c4cde0' } },
      },
      scales: this.tipo === 'pie' ? {} : ejes, // la torta no tiene ejes
    };
  }
}
