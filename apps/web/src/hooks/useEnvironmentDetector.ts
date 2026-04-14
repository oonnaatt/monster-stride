import { useState, useEffect, useCallback, useRef } from 'react';
import type { Biome, Weather, TimeOfDay, Season } from '../types';

export interface EnvState {
  biome: Biome;
  weather: Weather;
  timeOfDay: TimeOfDay;
  season: Season;
  detecting: boolean;
  error: string | null;
}

// ─── Local derivations (no network) ─────────────────────────────────────────

function detectTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5  && h < 7)  return 'dawn';
  if (h >= 7  && h < 12) return 'morning';
  if (h >= 12 && h < 14) return 'noon';
  if (h >= 14 && h < 18) return 'afternoon';
  if (h >= 18 && h < 20) return 'dusk';
  if (h >= 20 && h < 23) return 'night';
  return 'midnight';
}

/** lat ≥ 0 → northern hemisphere; lat < 0 → southern. Defaults to north (lat 45). */
function detectSeason(lat = 45): Season {
  const month = new Date().getMonth(); // 0-indexed
  const north: Season[] = [
    'winter', 'winter', 'spring', 'spring', 'spring',
    'summer', 'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter',
  ];
  const south: Season[] = [
    'summer', 'summer', 'autumn', 'autumn', 'autumn',
    'winter', 'winter', 'winter', 'spring', 'spring', 'spring', 'summer',
  ];
  return (lat >= 0 ? north : south)[month];
}

// ─── Weather: Open-Meteo (free, no key) ─────────────────────────────────────

/** Maps WMO weather interpretation code → game weather value. */
function wmoToWeather(code: number): Weather {
  if (code <= 1)                          return 'sunny';
  if (code <= 3)                          return 'cloudy';
  if (code === 45 || code === 48)         return 'fog';
  if (code >= 51 && code <= 67)           return 'rain';
  if (code >= 71 && code <= 77)           return 'snow';
  if (code >= 80 && code <= 82)           return 'rain';
  if (code === 85 || code === 86)         return 'snow';
  if (code === 95)                        return 'thunderstorm';
  if (code >= 96)                         return 'storm';
  return 'cloudy';
}

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWeather(lat: number, lon: number): Promise<Weather> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&current=weather_code&forecast_days=1`;
  const res = await fetchWithTimeout(url, {}, 8_000);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = (await res.json()) as { current?: { weather_code?: number } };
  return wmoToWeather(json.current?.weather_code ?? 0);
}

// ─── Biome: Overpass / OpenStreetMap (free, no key) ──────────────────────────

interface OsmElement {
  type: string;
  tags?: Record<string, string>;
}

function scoreBiome(elements: OsmElement[]): Biome {
  const scores: Record<Biome, number> = {
    coastal: 0, forest: 0, mountain: 0, desert: 0, suburban: 0, urban: 0,
  };
  for (const el of elements) {
    const t   = el.tags ?? {};
    const nat = t.natural  ?? '';
    const lu  = t.landuse  ?? '';
    const lei = t.leisure  ?? '';
    const hw  = t.highway  ?? '';
    const ww  = t.waterway ?? '';

    if (['coastline', 'beach'].includes(nat))                             scores.coastal  += 10;
    if (['water', 'bay'].includes(nat) || ['river', 'canal'].includes(ww)) scores.coastal += 5;
    if (['wood', 'scrub', 'heath'].includes(nat) || lu === 'forest')      scores.forest   += 10;
    if (['peak', 'ridge', 'cliff'].includes(nat))                         scores.mountain += 10;
    if (['sand', 'desert', 'dune'].includes(nat))                         scores.desert   += 10;
    if (['park', 'nature_reserve'].includes(lei))                         scores.suburban += 4;
    if (['residential', 'allotments'].includes(lu))                       scores.suburban += 5;
    if (['commercial', 'retail', 'industrial'].includes(lu))              scores.urban    += 8;
    if (['primary', 'secondary', 'trunk', 'motorway'].includes(hw))       scores.urban    += 3;
  }
  const top = (Object.entries(scores) as [Biome, number][]).reduce((a, b) => (b[1] > a[1] ? b : a));
  return top[1] > 0 ? top[0] : 'urban';
}

async function fetchBiome(lat: number, lon: number): Promise<Biome> {
  // Query nearby OSM features; returns tags only (no geometry) to keep payload small.
  const q = `[out:json][timeout:8];
(
  way["natural"~"^(coastline|beach|water|bay|wood|scrub|heath|sand|desert)$"](around:500,${lat},${lon});
  node["natural"~"^(peak|cliff|ridge)$"](around:2000,${lat},${lon});
  way["waterway"~"^(river|canal)$"](around:300,${lat},${lon});
  way["landuse"~"^(forest|residential|commercial|retail|industrial)$"](around:400,${lat},${lon});
  way["leisure"~"^(park|nature_reserve)$"](around:400,${lat},${lon});
  way["highway"~"^(primary|secondary|trunk|motorway)$"](around:200,${lat},${lon});
);
out tags;`;

  const res = await fetchWithTimeout(
    'https://overpass-api.de/api/interpreter',
    {
      method: 'POST',
      body: `data=${encodeURIComponent(q)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
    12_000,
  );
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const json = (await res.json()) as { elements?: OsmElement[] };
  return scoreBiome(json.elements ?? []);
}

// ─── Hook ────────────────────────────────────────────────────────────────────

const INITIAL: EnvState = {
  biome:     'urban',
  weather:   'sunny',
  timeOfDay: detectTimeOfDay(),
  season:    detectSeason(45),   // northern-hemisphere default; corrected once coords arrive
  detecting: false,
  error:     null,
};

export function useEnvironmentDetector() {
  const [state, setState] = useState<EnvState>(INITIAL);

  const detect = useCallback(async () => {
    setState(s => ({ ...s, detecting: true, error: null }));

    // 1) GPS coordinates
    let lat: number;
    let lon: number;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 10_000,
          maximumAge: 60_000,
          enableHighAccuracy: false,
        }),
      );
      lat = pos.coords.latitude;
      lon = pos.coords.longitude;
    } catch {
      setState(s => ({
        ...s,
        timeOfDay: detectTimeOfDay(),
        detecting: false,
        error: 'Location access denied — set biome & weather manually',
      }));
      return;
    }

    // 2) Derive time-of-day and season locally (no extra API call needed)
    const timeOfDay = detectTimeOfDay();
    const season    = detectSeason(lat);

    // 3) Fetch biome + weather in parallel; either can fail gracefully
    const [biomeResult, weatherResult] = await Promise.allSettled([
      fetchBiome(lat, lon),
      fetchWeather(lat, lon),
    ]);

    setState({
      biome:     biomeResult.status   === 'fulfilled' ? biomeResult.value   : 'urban',
      weather:   weatherResult.status === 'fulfilled' ? weatherResult.value : 'sunny',
      timeOfDay,
      season,
      detecting: false,
      error:     null,
    });
  }, []);

  // Auto-detect on mount
  useEffect(() => { detect(); }, [detect]);

  return { ...state, refresh: detect };
}
