import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

// Registramos solo lo que usamos (en Angular hacías registerables: más pesado).
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export interface SerieGrafico {
  label: string;
  data: (number | null)[];
  color: string;
}

/** Wrapper de Chart.js: recibe etiquetas + series y dibuja líneas sobre fondo oscuro. */
export function GraficoLinea({ labels, series }: { labels: string[]; series: SerieGrafico[] }) {
  return (
    <div className="relative h-72 w-full sm:h-96">
      <Line
        data={{
          labels,
          datasets: series.map((s) => ({
            label: s.label,
            data: s.data,
            borderColor: s.color,
            backgroundColor: s.color + '33',
            fill: series.length === 1,
            tension: 0.3,
            spanGaps: true,
            pointRadius: labels.length > 60 ? 0 : 3,
          })),
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#ffffff', font: { size: 14 } } } },
          scales: {
            y: { ticks: { color: '#e7e3e3' }, grid: { color: '#ffffff1a' } },
            x: { ticks: { color: '#cacaca', maxTicksLimit: 12 }, grid: { color: '#ffffff0d' } },
          },
        }}
      />
    </div>
  );
}
