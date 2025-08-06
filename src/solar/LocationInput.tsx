import React, { useState, useEffect, useRef } from "react";

interface Location {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface LocationInputProps {
  value: Location | null;
  onChange: (loc: Location) => void;
}

const RECENT_KEY = "solar_recent_locations";
const MAX_RECENT = 5;

function locationsEqual(a: Location, b: Location) {
  return (
    a.latitude === b.latitude &&
    a.longitude === b.longitude &&
    a.name === b.name &&
    a.country === b.country &&
    a.admin1 === b.admin1
  );
}

function loadRecentLocations(): Location[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveRecentLocations(locs: Location[]) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(locs));
}

export function LocationInput({ value, onChange }: LocationInputProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<Location[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent locations on mount
  useEffect(() => {
    setRecent(loadRecentLocations());
  }, []);

  // Add to recent locations when value changes
  useEffect(() => {
    if (value) {
      setRecent((prev) => {
        // Remove if already present
        const filtered = prev.filter((loc) => !locationsEqual(loc, value));
        const updated = [value, ...filtered].slice(0, MAX_RECENT);
        saveRecentLocations(updated);
        return updated;
      });
    }
  }, [value]);

  async function searchLocations(q: string) {
    setLoading(true);
    setResults([]);
    try {
      const resp = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=en&format=json`
      );
      const data = await resp.json();
      if (data.results) {
        setResults(
          data.results.map((r: any) => ({
            name: r.name,
            country: r.country,
            admin1: r.admin1,
            latitude: r.latitude,
            longitude: r.longitude,
          }))
        );
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    }
    setLoading(false);
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (q.length >= 2) {
      searchLocations(q);
    } else {
      setResults([]);
    }
  }

  function handleSelect(loc: Location) {
    setQuery(
      `${loc.name}${loc.admin1 ? ", " + loc.admin1 : ""}, ${loc.country}`
    );
    setResults([]);
    onChange(loc);
  }

  function handleClear() {
    setQuery("");
    setResults([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  return (
    <div style={{
      position: "relative",
      width: "100%",
      maxWidth: 400,
      margin: "0 auto"
    }}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInput}
        placeholder="Search city, state, country"
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "8px 36px 8px 12px",
          borderRadius: 8,
          border: "1px solid #ddd",
          fontSize: 16,
        }}
        aria-label="Location search"
        autoComplete="off"
      />
      {/* Clear button */}
      {query && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          style={{
            position: "absolute",
            right: loading ? 36 : 12,
            top: 8,
            background: "none",
            border: "none",
            padding: 0,
            margin: 0,
            cursor: "pointer",
            fontSize: 18,
            color: "#bbb",
            width: 24,
            height: 24,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
          }}
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") handleClear();
          }}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
      {loading && (
        <div style={{ position: "absolute", right: 12, top: 10, fontSize: 14 }}>
          <span role="status" aria-live="polite">⏳</span>
        </div>
      )}
      {/* Recent locations dropdown */}
      {recent.length > 0 && !query && (
        <ul
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 38,
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 8,
            zIndex: 11,
            margin: 0,
            padding: 0,
            listStyle: "none",
            boxShadow: "0 2px 8px #0001",
            maxHeight: 180,
            overflowY: "auto",
          }}
        >
          {recent.map((loc, i) => (
            <li
              key={i}
              onClick={() => handleSelect(loc)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom: i < recent.length - 1 ? "1px solid #f1f1f1" : "none",
                background: "#f8fafc",
                fontSize: 15,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "Enter") handleSelect(loc);
              }}
              aria-label={`Select recent location: ${loc.name}, ${loc.admin1 ? loc.admin1 + ", " : ""}${loc.country}`}
            >
              <span style={{ color: "#f59e42", fontSize: 18 }}>🕑</span>
              <span>
                {loc.name}
                {loc.admin1 ? <span style={{ color: "#888" }}>, {loc.admin1}</span> : null}
                <span style={{ color: "#bbb" }}>, {loc.country}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {/* Search results dropdown */}
      {results.length > 0 && (
        <ul
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 38,
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 8,
            zIndex: 12,
            margin: 0,
            padding: 0,
            listStyle: "none",
            boxShadow: "0 2px 8px #0001",
            maxHeight: 180,
            overflowY: "auto",
          }}
        >
          {results.map((loc, i) => (
            <li
              key={i}
              onClick={() => handleSelect(loc)}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                borderBottom: i < results.length - 1 ? "1px solid #f1f1f1" : "none",
                background: "#fff",
                fontSize: 15,
              }}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "Enter") handleSelect(loc);
              }}
              aria-label={`Select ${loc.name}, ${loc.admin1 ? loc.admin1 + ", " : ""}${loc.country}`}
            >
              <span>
                {loc.name}
                {loc.admin1 ? <span style={{ color: "#888" }}>, {loc.admin1}</span> : null}
                <span style={{ color: "#bbb" }}>, {loc.country}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
