import { WeatherData } from "./WeatherService";

// Simple analysis: more sunshine hours and less cloud cover = better solar potential
export function analyzeSolarPotential(data: WeatherData) {
  // Score: 0-100, weighted by sunshine hours and cloud cover
  // Assume max 14h sunshine/day, cloud cover 0-100%
  const sunshineScore = Math.min(data.sunshineHours / 14, 1) * 70; // up to 70 points
  const cloudScore = (1 - data.cloudCover / 100) * 30; // up to 30 points
  const total = Math.round(sunshineScore + cloudScore);

  let label = "Low";
  if (total > 70) label = "Excellent";
  else if (total > 50) label = "Good";
  else if (total > 30) label = "Moderate";

  return { score: total, label };
}
