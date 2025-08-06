import { useState, useEffect } from "react";
import { useWeatherData } from "./useWeatherData";
import { analyzeSolarPotential } from "./SolarAnalysis";
import { SolarChart } from "./SolarChart";
import { LocationInput } from "./LocationInput";
import { ForecastCard } from "./ForecastCard";

const KW_STORAGE_KEY = "solar_kw_capacity";

// Returns a cloud cover adjustment factor (0.0–1.0), never below minFactor
function getCloudCoverFactor(cloudCover: number, minFactor = 0.15) {
  // Linear reduction, but never below minFactor
  const factor = 1 - cloudCover / 100;
  return Math.max(factor, minFactor);
}

export function SolarDashboard() {
  const { data, loading, error, location, setLocation, forecast, forecastLoading } = useWeatherData();

  // kW state and persistence
  const [kw, setKw] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(KW_STORAGE_KEY) || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (kw) {
        localStorage.setItem(KW_STORAGE_KEY, kw);
      } else {
        localStorage.removeItem(KW_STORAGE_KEY);
      }
    }
  }, [kw]);

  const today = data.length ? data[data.length - 1] : null;
  const analysis = today ? analyzeSolarPotential(today) : null;

  // Calculate energy estimate if kW and sunshineHours are available, factoring in cloud cover (with minimum)
  let energyEstimate: number | null = null;
  if (today && kw && !isNaN(Number(kw))) {
    const cloudFactor = getCloudCoverFactor(today.cloudCover, 0.15);
    energyEstimate = Math.round(
      Number(kw) *
        today.sunshineHours *
        cloudFactor *
        10
    ) / 10; // 1 decimal
  }

  return (
    <div style={{
      maxWidth: 700,
      margin: "2rem auto",
      padding: 24,
      background: "#f9fafb",
      borderRadius: 16,
      boxShadow: "0 2px 16px #0002"
    }}>
      <h1 style={{ fontSize: 32, marginBottom: 8, color: "#f59e42" }}>☀️ Solar Energy Dashboard</h1>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        Collects daily weather data and analyzes solar energy potential for your location.
      </p>
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontWeight: 500, fontSize: 16, marginBottom: 6, display: "block" }}>
          Location:
        </label>
        <div style={{
          width: "100%",
          maxWidth: 400,
          margin: "0 auto"
        }}>
          <LocationInput
            value={location}
            onChange={setLocation}
          />
        </div>
        <div style={{ fontSize: 15, color: "#555", marginTop: 6 }}>
          <b>
            {location.name}
            {location.admin1 ? <span>, {location.admin1}</span> : null}
            <span>, {location.country}</span>
          </b>
        </div>
      </div>
      {/* kW input */}
      <div style={{
        marginBottom: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        maxWidth: 400,
        width: "100%",
        marginLeft: "auto",
        marginRight: "auto"
      }}>
        <label htmlFor="solar-kw-input" style={{ fontWeight: 500, fontSize: 16, marginBottom: 6 }}>
          <span>Solar System Size (kW) <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></span>
        </label>
        <input
          id="solar-kw-input"
          type="number"
          min="0"
          step="0.1"
          inputMode="decimal"
          placeholder="e.g. 5"
          value={kw}
          onChange={e => {
            // Only allow numbers and decimals
            const val = e.target.value;
            if (/^\d*\.?\d*$/.test(val)) setKw(val);
          }}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ddd",
            fontSize: 16,
            marginBottom: 0
          }}
          aria-label="Solar system size in kilowatts"
        />
        <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
          Enter your system's total installed capacity to estimate daily energy output.
        </div>
      </div>
      {loading && <div>Loading today's weather data...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      {today && (
        <div style={{ marginBottom: 32, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px #0001" }}>
          <h2 style={{ fontSize: 22, margin: "0 0 8px" }}>Today's Analysis ({today.date})</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: 18 }}>
            <li>🌡️ Mean Temp: <b>{today.temperature}°C</b></li>
            <li>☁️ Cloud Cover: <b>{today.cloudCover}%</b></li>
            <li>☀️ Sunshine: <b>{today.sunshineHours} hours</b></li>
            <li>🔋 Solar Potential: <b style={{ color: "#22d3ee" }}>{analysis?.score}/100 ({analysis?.label})</b></li>
            {kw && !isNaN(Number(kw)) && (
              <li>
                ⚡ Estimated Energy Output:{" "}
                <b style={{ color: "#f59e42" }}>
                  {energyEstimate} kWh
                </b>
              </li>
            )}
          </ul>
        </div>
      )}
      <ForecastCard forecast={forecast} loading={forecastLoading} kw={kw} getCloudCoverFactor={getCloudCoverFactor} />
      {data.length > 1 && (
        <div>
          <h3 style={{ margin: "24px 0 12px" }}>Solar Potential Over Time</h3>
          <SolarChart data={data} />
        </div>
      )}
      <div style={{ marginTop: 32, color: "#94a3b8", fontSize: 14 }}>
        Data source: <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer">Open-Meteo</a>
      </div>
    </div>
  );
}
