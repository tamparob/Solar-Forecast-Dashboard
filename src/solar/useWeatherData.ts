import { useEffect, useState } from "react";
import { fetchTodayWeather, fetch5DayForecast, WeatherData, Location, DEFAULT_LOCATION } from "./WeatherService";
import dayjs from "dayjs";

const STORAGE_KEY = "solar_weather_data";
const LOCATION_KEY = "solar_weather_location";

function loadStoredData(location: Location): WeatherData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + "_" + location.latitude + "_" + location.longitude);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveStoredData(location: Location, data: WeatherData[]) {
  localStorage.setItem(STORAGE_KEY + "_" + location.latitude + "_" + location.longitude, JSON.stringify(data));
}

function loadStoredLocation(): Location {
  try {
    const raw = localStorage.getItem(LOCATION_KEY);
    if (!raw) return DEFAULT_LOCATION;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_LOCATION;
  }
}

function saveStoredLocation(location: Location) {
  localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
}

export function useWeatherData() {
  const [location, setLocation] = useState<Location>(loadStoredLocation());
  const [data, setData] = useState<WeatherData[]>([]);
  const [forecast, setForecast] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data for location
  useEffect(() => {
    const stored = loadStoredData(location);
    setData(stored);

    const today = dayjs().format("YYYY-MM-DD");
    if (!stored.find(d => d.date === today)) {
      setLoading(true);
      fetchTodayWeather(location.latitude, location.longitude)
        .then((todayData) => {
          const updated = [...stored, todayData].sort((a, b) => a.date.localeCompare(b.date));
          setData(updated);
          saveStoredData(location, updated);
        })
        .catch(() => setError("Failed to fetch weather data"))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line
  }, [location.latitude, location.longitude]);

  // Save location to localStorage when changed
  useEffect(() => {
    saveStoredLocation(location);
  }, [location]);

  // Fetch 5-day forecast
  useEffect(() => {
    setForecastLoading(true);
    fetch5DayForecast(location.latitude, location.longitude)
      .then(setForecast)
      .catch(() => setError("Failed to fetch 5-day forecast"))
      .finally(() => setForecastLoading(false));
  }, [location.latitude, location.longitude]);

  return { data, loading, error, location, setLocation, forecast, forecastLoading };
}
