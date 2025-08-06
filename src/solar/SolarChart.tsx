import { WeatherData } from "./WeatherService";
import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { analyzeSolarPotential } from "./SolarAnalysis";

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export function SolarChart({ data }: { data: WeatherData[] }) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: "Sunshine Hours",
        data: data.map(d => d.sunshineHours),
        borderColor: "#fbbf24",
        backgroundColor: "#fde68a",
        yAxisID: "y1",
      },
      {
        label: "Solar Potential Score",
        data: data.map(d => analyzeSolarPotential(d).score),
        borderColor: "#22d3ee",
        backgroundColor: "#bae6fd",
        yAxisID: "y2",
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      tooltip: { mode: "index" as const, intersect: false }
    },
    scales: {
      y1: {
        type: "linear" as const,
        position: "left" as const,
        title: { display: true, text: "Sunshine Hours" },
        min: 0,
        max: 14
      },
      y2: {
        type: "linear" as const,
        position: "right" as const,
        title: { display: true, text: "Solar Potential Score" },
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false }
      }
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px #0001" }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
