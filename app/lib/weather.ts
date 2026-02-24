const WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=25.7617&longitude=-80.1918&current=temperature_2m,wind_speed_10m,wind_direction_10m,relative_humidity_2m,weather_code,surface_pressure&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America/New_York';

export interface WeatherData {
  temperature: number; // °F
  windSpeed: number; // mph
  windDirection: number; // degrees 0-360
  humidity: number; // %
  weatherCode: number; // WMO code
  pressure: number; // hPa
  time: string;
}

const WMO_CONDITIONS: Record<number, string> = {
  0: 'CLEAR',
  1: 'MOSTLY CLEAR',
  2: 'PARTLY CLOUDY',
  3: 'OVERCAST',
  45: 'FOG',
  48: 'RIME FOG',
  51: 'LIGHT DRIZZLE',
  53: 'DRIZZLE',
  55: 'HEAVY DRIZZLE',
  61: 'LIGHT RAIN',
  63: 'RAIN',
  65: 'HEAVY RAIN',
  67: 'FREEZING RAIN',
  71: 'LIGHT SNOW',
  73: 'SNOW',
  75: 'HEAVY SNOW',
  77: 'SNOW GRAINS',
  80: 'LIGHT SHOWERS',
  81: 'SHOWERS',
  82: 'HEAVY SHOWERS',
  85: 'SNOW SHOWERS',
  86: 'HEAVY SNOW SHOWERS',
  95: 'THUNDERSTORM',
  96: 'TSTORM W/ HAIL',
  99: 'SEVERE TSTORM',
};

export function getConditionLabel(code: number): string {
  return WMO_CONDITIONS[code] || `CODE ${code}`;
}

export function getWindCardinal(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

export async function fetchWeather(): Promise<WeatherData> {
  const res = await fetch(WEATHER_URL);
  if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
  const json = await res.json();
  const c = json.current;
  return {
    temperature: c.temperature_2m,
    windSpeed: c.wind_speed_10m,
    windDirection: c.wind_direction_10m,
    humidity: c.relative_humidity_2m,
    weatherCode: c.weather_code,
    pressure: c.surface_pressure,
    time: c.time,
  };
}
