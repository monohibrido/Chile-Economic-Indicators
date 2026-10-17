# Guía: lo que hiciste en Angular y cómo quedó en React

## 1. Qué construiste (versión Angular)

Una app que consume la API pública **mindicador.cl** (indicadores económicos de Chile) con 4 secciones, cada una un componente:

| Componente Angular | Qué hace | Endpoint |
|---|---|---|
| `valores-hoy` | Tabla con los valores de hoy | `GET /api` |
| `valor-por-fecha` | Un indicador en una fecha | `GET /api/{indicador}/{dd-mm-yyyy}` |
| `valor-por-rango` | Valores entre dos fechas (máx. 30 días) | `GET /api/{indicador}/{yyyy}` + filtro propio |
| `grafico-indicador` | Gráfico de línea de un año | `GET /api/{indicador}/{yyyy}` |

Y un servicio (`services/indicadores.ts`) que centraliza las llamadas HTTP.

Ideas clave que ya dominabas sin darte cuenta:
- **Consumir una API REST** y tipar la respuesta con `interface`.
- **Validar antes de llamar** (fecha futura, rango > 30 días, año futuro).
- **Estados de UI**: cargando / error / datos / vacío.
- **La API no tiene "rango"**: pedías el año completo y filtrabas en el cliente.

## 2. Traducción Angular → React (lo que cambió)

| Angular | React (este proyecto) |
|---|---|
| `@Component` + `.ts` + `.html` + `.css` | Una función `.tsx` que devuelve JSX |
| `signal()` | `useState()` |
| `[(ngModel)]` | `value={x}` + `onChange={e => setX(e.target.value)}` |
| `(ngSubmit)` | `onSubmit` + `e.preventDefault()` |
| `@if / @else` | `cond ? <A/> : <B/>` o `cond && <A/>` |
| `*ngFor` / `@for` | `lista.map(x => <fila key={...} />)` |
| `ngOnInit` | `useEffect(() => {...}, [])` |
| `inject(Servicio)` + `HttpClient` + Observable | `fetch` + `async/await` (`src/lib/api.ts`) |
| `date` / `number` pipes | `Intl.NumberFormat` y helpers (`formatValor`, `fechaCL`) |
| `imports: [...]` en cada componente | un simple `import` de JS |
| `ng2-charts` / `Chart.js` con `ViewChild` | `react-chartjs-2` (`<Line />`), sin tocar el canvas a mano |

**Bootstrap → Tailwind**: ya no hay clases "de componente" (`btn`, `form-select`, `table`...) sino utilidades pequeñas: `rounded-md bg-sky-600 px-4 py-2 text-white`. Para no repetirlas, las agrupé en `src/components/ui.tsx` (`Tarjeta`, `Boton`, `Campo`, `Tabla`, `Alerta`). Los colores y fuentes propios (`#2b2f34`, Playfair, Roboto Mono) están en `src/index.css` dentro de `@theme`.

Equivalencias de grilla/utilidades: `col-md-8 mx-auto` → `mx-auto max-w-3xl`; `row g-3` → `flex flex-wrap gap-3`; `table-responsive` → `overflow-x-auto`; `alert alert-danger` → `bg-red-100 text-red-800`.

## 3. Mapa del proyecto

```
src/
  lib/api.ts              ← el "servicio": tipos, llamadas a la API, formatos
  hooks/useConsulta.ts    ← cargando/error/datos reutilizable (antes repetido 4 veces)
  components/
    ValoresHoy.tsx  ValorPorFecha.tsx  ValorPorRango.tsx  GraficoAnual.tsx
    Ultimos30Dias.tsx  Comparar.tsx  Conversor.tsx   ← NUEVOS (práctica)
    GraficoLinea.tsx      ← wrapper de Chart.js
    ui.tsx                ← piezas Tailwind reutilizables
  App.tsx  main.tsx  index.css
```

## 4. Qué mejoré de paso (bugs de la versión Angular)

- **Rango que cruza de año** (ej. 20-dic → 10-ene): antes solo pedía el año de inicio y perdía datos. Ahora pide ambos años con `Promise.all`.
- **Inicio > término** no se validaba; ahora sí.
- **Zona horaria**: comparar `new Date(...)` con fechas UTC puede correr un día. Ahora se comparan strings `yyyy-mm-dd`.
- `valor-por-rango` y `app.ts` tenían imports y llamadas a la API que no usaban (`RouterOutlet`, `datos`, un `getIndicadores()` duplicado). Se eliminaron.
- El gráfico de año solo ofrecía 7 indicadores; ahora ofrece los 12.

## 5. Endpoints nuevos para practicar

La API tiene solo 4 formas de consulta y usabas 3. Faltaba:

- **`GET /api/{indicador}`** → serie reciente (~30 días). Está en `Ultimos30Dias.tsx`: calcula último valor, cambio, mínimo, máximo y promedio.
- Además `Comparar.tsx` practica **dos llamadas en paralelo** (`Promise.all`) y normalizar series a **base 100** para comparar cosas con escalas muy distintas (dólar vs bitcoin).

Más cosas agregadas después:

- **Cuadro principal sin navegación por días** (decisión de diseño): ver otro día obligaba a hacer 12 llamadas (una por indicador) y era lento. Para eso ya existe la sección "Busca un valor por fecha", que hace una sola llamada.
- **Conversor** (`Conversor.tsx`): sin llamadas propias; usa los valores de hoy que App pide una sola vez y comparte con `ValoresHoy` ("levantar el estado" al padre). Convierte pasando siempre por pesos: `monto × (CLP por unidad origen) ÷ (CLP por unidad destino)`.

## 6. Ejercicios (para que los hagas tú)

1. **Fácil**: en `ValoresHoy`, muestra una flecha ▲/▼ comparando con el valor de ayer (pista: `/api/{indicador}` te da los últimos días).
2. **Fácil**: en `Ultimos30Dias`, agrega una tabla con los valores día a día debajo del gráfico (usa `Tabla` y `.map`).
3. **Medio**: botón "Hoy" en `ValorPorFecha` que rellene la fecha con `hoyISO()`.
4. **Medio**: en `GraficoAnual`, un selector para cambiar entre línea y barras (`Bar` de `react-chartjs-2`; hay que registrar `BarElement`).
5. **Medio**: guarda el último indicador elegido en `localStorage` (`useEffect` + `useState` con valor inicial perezoso).
6. **Difícil**: extrae un `useIndicadorSelect` o convierte las secciones en pestañas con React Router.
7. **Difícil**: en `Comparar`, permite hasta 3 indicadores y manejar el caso en que uno falla (`Promise.allSettled`).
8. **Reto backend**: crea tu propia API Express que haga de proxy/caché de mindicador.cl (`GET /api/indicadores/:codigo`) y haz que el front la consuma. Calza con tu ruta hacia Node + Express.

## 7. Comandos

```bash
npm install
npm run dev       # desarrollo en http://localhost:5173
npm run build     # compila a dist/
npm run deploy    # build con base /Chile-Economic-Indicators/ + gh-pages
```
