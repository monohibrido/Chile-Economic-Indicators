import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Indicador {
  codigo: string;
  nombre: string;
  unidad_medida: string;
  fecha: string;
  valor: number;
}

export interface RespuestaIndicadoresHoy {
  version: string;
  autor: string;
  fecha: string;
  uf: Indicador;
  ivp: Indicador;
  dolar: Indicador;
  dolar_intercambio: Indicador;
  euro: Indicador;
  ipc: Indicador;
  utm: Indicador;
  imacec: Indicador;
  tpm: Indicador;
  libra_cobre: Indicador;
  tasa_desempleo: Indicador;
  bitcoin: Indicador;
}

export interface Serie {
  fecha: string;
  valor: number;
}

export interface RespuestaHistorica {
  version: string;
  autor: string;
  codigo: string;
  nombre: string;
  unidad_medida: string;
  serie: Serie[];
}

@Injectable({
  providedIn: 'root',
})
export class IndicadoresService {
  private http = inject(HttpClient);
  private apiUrl = 'https://mindicador.cl';

  getIndicadores(): Observable<RespuestaIndicadoresHoy> {
    return this.http.get<RespuestaIndicadoresHoy>(`${this.apiUrl}/api`);
  }

  getIndicadorPorFecha(tipo_indicador: string, fecha: string): Observable<RespuestaHistorica> {
    const [year, month, day] = fecha.split('-');
    const fechaFormateada = `${day}-${month}-${year}`;

    return this.http.get<RespuestaHistorica>(
      `${this.apiUrl}/api/${tipo_indicador}/${fechaFormateada}`,
    );
  }

  getIndicadorPorAnio(tipo_indicador: string, anio: string): Observable<RespuestaHistorica> {
    return this.http.get<RespuestaHistorica>(`${this.apiUrl}/api/${tipo_indicador}/${anio}`);
  }
}
