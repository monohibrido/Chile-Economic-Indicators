import { Component, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { IndicadoresService, RespuestaHistorica } from '../services/indicadores';
import { Chart, registerables } from 'chart.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-grafico-indicador',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './grafico-indicador.html',
  styleUrl: './grafico-indicador.css',
})
export class GraficoIndicador {
  private apiService = inject(IndicadoresService);

  @ViewChild('miGrafico') canvasRef!: ElementRef<HTMLCanvasElement>;
  chart: Chart | null = null;

  indicador: string = '';
  anio: string = '';

  resultados = signal<RespuestaHistorica | null>(null);
  errorMsg = signal<string | null>(null);
  cargando = signal<boolean>(false);

  consultarAnio() {
    if (!this.indicador || !this.anio) {
      this.errorMsg.set('Por favor, selecciona un indicador y un año.');
      return;
    }

    const anioActual = new Date().getFullYear();
    if (Number(this.anio) > anioActual) {
      this.errorMsg.set(`No hay datos disponibles para el año ${this.anio}.`);
      this.limpiarGraficoSolo();
      return;
    }

    this.cargando.set(true);
    this.apiService.getIndicadorPorAnio(this.indicador, this.anio).subscribe({
      next: (res: RespuestaHistorica) => {
        if (res.serie && res.serie.length > 0) {
          this.resultados.set(res);
          this.errorMsg.set(null);
          this.renderizarGrafico(res);
        } else {
          this.errorMsg.set('No se encontraron datos para este año.');
          this.limpiarGraficoSolo();
        }
        this.cargando.set(false);
      },
      error: (err) => {
        this.errorMsg.set('Error de conexión con la API.');
        this.limpiarGraficoSolo();
        this.cargando.set(false);
        console.error('API Error:', err);
      },
    });
  }

  renderizarGrafico(datos: RespuestaHistorica) {
    const serieInvertida = [...datos.serie].reverse();
    const etiquetas = serieInvertida.map((s) => s.fecha.split('T')[0]);
    const valores = serieInvertida.map((s) => s.valor);

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: `Valor de ${datos.nombre}`,
            data: valores,
            borderColor: '#ffffff',
            backgroundColor: '#0d98d433',
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        plugins: {
          legend: {
            labels: {
              color: '#ffffff',
              font: { size: 14 },
            },
          },
        },
        scales: {
          y: {
            ticks: { color: '#e7e3e3' },
          },
          x: {
            ticks: { color: '#cacaca' },
          },
        },
      },
    });
  }

  private limpiarGraficoSolo() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    this.resultados.set(null);
  }

  limpiarCampos() {
    this.limpiarGraficoSolo();
    this.indicador = '';
    this.anio = '';
    this.errorMsg.set(null);
  }
}
