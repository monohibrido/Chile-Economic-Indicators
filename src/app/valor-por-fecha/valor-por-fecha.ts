import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndicadoresService, RespuestaHistorica } from '../services/indicadores';

@Component({
  selector: 'app-valor-por-fecha',
  standalone: true,
  imports: [DatePipe, FormsModule, CommonModule],
  templateUrl: './valor-por-fecha.html',
  styleUrl: './valor-por-fecha.css',
})
export class ValorPorFecha {
  private apiService = inject(IndicadoresService);

  indicador: string = '';
  fecha: string = '';

  resultados = signal<RespuestaHistorica | null>(null);
  errorMsg = signal<string | null>(null);
  cargando = signal<boolean>(false);

  consultar() {
    if (!this.indicador || !this.fecha) {
      this.errorMsg.set('Por favor, selecciona un indicador y una fecha.');
      return;
    }

    const fechaSeleccionada = new Date(this.fecha);
    const hoy = new Date();
    if (fechaSeleccionada > hoy) {
      this.errorMsg.set('No puedes consultar una fecha futura.');
      this.resultados.set(null);
      return;
    }

    this.cargando.set(true);
    this.apiService.getIndicadorPorFecha(this.indicador, this.fecha).subscribe({
      next: (data: RespuestaHistorica) => {
        if (data.serie && data.serie.length > 0) {
          this.resultados.set(data);
          this.errorMsg.set(null);
        } else {
          this.resultados.set(null);
          this.errorMsg.set('No hay datos para este indicador en la fecha seleccionada.');
        }
        this.cargando.set(false);
      },
      error: (err) => {
        this.resultados.set(null);
        this.errorMsg.set('Error de conexión con la API.');
        this.cargando.set(false);
        console.error('API Error:', err);
      },
    });
  }

  limpiarCampos() {
    this.indicador = '';
    this.fecha = '';
    this.resultados.set(null);
    this.errorMsg.set(null);
  }
}
