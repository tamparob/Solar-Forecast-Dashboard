import axios from "axios";
import dayjs from "dayjs";

export interface WeatherData {
  date: string;
  temperature: number; // daily mean temp
  cloudCover: number; // daily mean cloud cover (%)
  sunshineHours: number; // daily sunshine duration (hours)
}

export interface Location {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export const DEFAULT_LOCATION: Location = {
  name: "New York",
  country: "United States",
  admin1: "New York",
  latitude: 40.7128,
  longitude: -74.0060,
};

export async function fetchTodayWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const today = dayjs().format("YYYY-MM-DD");
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_mean,cloudcover_mean,sunshine_duration&timezone=auto&start_date=${today}&end_date=${today}`;
  const { data } = await axios.get(url);

  return {
    date: today,
    temperature: data.daily.temperature_2m_mean[0],
    cloudCover: data.daily.cloudcover_mean[0],
    sunshineHours: Math.round((data.daily.sunshine_duration[0] || 0) / 3600 * 10) / 10,
  };
}

// Fetch 5-day forecast (including today)
export async function fetch5DayForecast(
  lat: number,
  lon: number
): Promise<WeatherData[]> {
  const today = dayjs();
  const start = today.format("YYYY-MM-DD");
  const end = today.add(4, "day").format("YYYY-MM-DD");
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_mean,cloudcover_mean,sunshine_duration&timezone=auto&start_date=${start}&end_date=${end}`;
  const { data } = await axios.get(url);

  const days = data.daily.time.length;
  const result: WeatherData[] = [];
  for (let i = 0; i < days; i++) {
    result.push({
      date: data.daily.time[i],
      temperature: data.daily.temperature_2m_mean[i],
      cloudCover: data.daily.cloudcover_mean[i],
      sunshineHours: Math.round((data.daily.sunshine_duration[i] || 0) / 3600 * 10) / 10,
    });
  }
  return result;
}
