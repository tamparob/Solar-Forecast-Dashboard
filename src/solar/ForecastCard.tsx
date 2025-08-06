import type { WeatherData } from "./WeatherService";

// Accepts getCloudCoverFactor as prop for consistent calculation
export function ForecastCard({
  forecast,
  loading,
  kw,
  getCloudCoverFactor = (cloudCover: number, minFactor = 0.15) => Math.max(1 - cloudCover / 100, minFactor)
}: {
  forecast: WeatherData[];
  loading: boolean;
  kw: string;
  getCloudCoverFactor?: (cloudCover: number, minFactor?: number) => number;
}) {
  if (loading) {
    return <div>Loading 5-day forecast...</div>;
  }
  if (!forecast.length) {
    return null;
  }
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      padding: 16,
      marginBottom: 32,
      boxShadow: "0 2px 8px #0001"
    }}>
      <h2 style={{ fontSize: 20, margin: "0 0 12px" }}>5-Day Forecast</h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12
      }}>
        {forecast.map(day => {
          let energyEstimate: number | null = null;
          if (kw && !isNaN(Number(kw))) {
            const cloudFactor = getCloudCoverFactor(day.cloudCover, 0.15);
            energyEstimate = Math.round(
              Number(kw) *
                day.sunshineHours *
                cloudFactor *
                10
            ) / 10;
          }
          return (
            <div key={day.date} style={{
              background: "#f9fafb",
              borderRadius: 8,
              padding: 12,
              boxShadow: "0 1px 4px #0001",
              minWidth: 0
            }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{day.date}</div>
              <div style={{ fontSize: 15, marginBottom: 2 }}>☀️ {day.sunshineHours} h</div>
              <div style={{ fontSize: 15, marginBottom: 2 }}>☁️ {day.cloudCover}%</div>
              <div style={{ fontSize: 15, marginBottom: 2 }}>🌡️ {day.temperature}°C</div>
              {kw && !isNaN(Number(kw)) && (
                <div style={{ fontSize: 15, color: "#f59e42", fontWeight: 500 }}>
                  ⚡ {energyEstimate} kWh
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
