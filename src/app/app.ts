import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { IndicadoresService } from './services/indicadores';
import { ValorPorFecha } from './valor-por-fecha/valor-por-fecha';
import { ValorPorRango } from './valor-por-rango/valor-por-rango';
import { GraficoIndicador } from './grafico-indicador/grafico-indicador';
import { RespuestaIndicadoresHoy } from './services/indicadores';
import { ValoresHoy } from './valores-hoy/valores-hoy';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DatePipe, ValorPorFecha, ValorPorRango, GraficoIndicador, ValoresHoy],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private apiService = inject(IndicadoresService);
  datos = signal<RespuestaIndicadoresHoy | null>(null);

  ngOnInit() {
    this.apiService.getIndicadores().subscribe({
      next: (res) => this.datos.set(res),
      error: (err) => console.error('Error al cargar', err),
    });
  }
}
