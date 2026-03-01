import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { IndicadoresService } from '../services/indicadores';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-valor-por-rango',
  imports: [RouterOutlet, DatePipe, FormsModule, CommonModule],
  templateUrl: './valor-por-rango.html',
  styleUrl: './valor-por-rango.css',
})
export class ValorPorRango {
  private apiService = inject(IndicadoresService);
  datos = signal<any>(null);

  indicador: string = '';
  unidad_medida: string = '';
  fecha_inicio: string = '';

  fecha_termino: string = '';
  resultados: any = null;
  errorMsg: string | null = null;

  constructor(
    private indicadores: IndicadoresService,
    private cd: ChangeDetectorRef,
  ) {}

  consultarRango() {
    const inicio = new Date(this.fecha_inicio);
    const fin = new Date(this.fecha_termino);
    const diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24);

    if (diff > 30) {
      this.errorMsg = 'El rango no puede superar los 30 días';
      this.resultados = null;
      return;
    }

    const anio = inicio.getFullYear().toString();
    this.indicadores.getIndicadorPorAnio(this.indicador, anio).subscribe({
      next: (data: any) => {
        this.resultados = data.serie
          .filter((item: any) => {
            const f = new Date(item.fecha);
            return f >= inicio && f <= fin;
          })
          .map((item: any) => ({
            ...item,
            indicador: data.nombre,
            unidad_medida: data.unidad_medida,
          }));

        this.errorMsg = this.resultados.length ? null : 'No hay datos en el rango seleccionado';
      },
      error: (err) => {
        this.errorMsg = 'Error al consultar la API';
        console.error(err);
      },
    });
  }

  limpiarCampos() {
    this.indicador = '';
    this.fecha_inicio = '';
    this.fecha_termino = '';
    this.resultados = null;
    this.errorMsg = null;
  }

  ngOnInit() {
    this.apiService.getIndicadores().subscribe({
      next: (res) => this.datos.set(res),
      error: (err) => console.error('Error al cargar', err),
    });
  }
}
