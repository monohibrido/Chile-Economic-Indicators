import { Component, inject, signal } from '@angular/core';
import { IndicadoresService } from '../services/indicadores';
import { RespuestaIndicadoresHoy } from '../services/indicadores';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-valores-hoy',
  imports: [CommonModule],
  templateUrl: './valores-hoy.html',
  styleUrl: './valores-hoy.css',
})
export class ValoresHoy {
  private apiService = inject(IndicadoresService);
  datos = signal<RespuestaIndicadoresHoy | null>(null);

  ngOnInit() {
    this.apiService.getIndicadores().subscribe({
      next: (res) => this.datos.set(res),
      error: (err) => console.error('Error al cargar', err),
    });
  }
}
