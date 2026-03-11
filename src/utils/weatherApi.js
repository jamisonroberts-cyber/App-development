import AsyncStorage from '@react-native-async-storage/async-storage';
import { WEATHER_LAT, WEATHER_LON, WEATHER_CACHE_DURATION } from './config';

// WMO Weather Codes: https://open-meteo.com/en/docs
const CLEAR_CODES = [0, 1];
const PARTLY_CLOUDY_CODES = [2, 3];
const FOG_CODES = [45, 48];
const DRIZZLE_CODES = [51, 53, 55, 56, 57];
const RAIN_CODES = [61, 63, 65, 66, 67, 80, 81, 82];
const SNOW_CODES = [71, 73, 75, 77, 85, 86];
const STORM_CODES = [95, 96, 99];

function getWeatherDescription(code) {
  if (CLEAR_CODES.includes(code)) return 'Clear';
  if (PARTLY_CLOUDY_CODES.includes(code)) return code === 2 ? 'Partly Cloudy' : 'Overcast';
  if (FOG_CODES.includes(code)) return 'Foggy';
  if (DRIZZLE_CODES.includes(code)) return 'Drizzle';
  if (RAIN_CODES.includes(code)) return 'Rainy';
  if (SNOW_CODES.includes(code)) return 'Snow';
  if (STORM_CODES.includes(code)) return 'Thunderstorm';
  return 'Unknown';
}

function getWeatherIcon(code) {
  if (CLEAR_CODES.includes(code)) return 'sunny';
  if (code === 2) return 'partly-sunny';
  if (code === 3) return 'cloudy';
  if (FOG_CODES.includes(code)) return 'cloud';
  if (DRIZZLE_CODES.includes(code)) return 'rainy';
  if (RAIN_CODES.includes(code)) return 'rainy';
  if (SNOW_CODES.includes(code)) return 'snow';
  if (STORM_CODES.includes(code)) return 'thunderstorm';
  return 'cloud';
}

function rateDay(maxTemp, minTemp, code) {
  const isBadWeather = [...DRIZZLE_CODES, ...RAIN_CODES, ...SNOW_CODES, ...STORM_CODES].includes(code);
  const isHeavyCloud = code === 3;

  if (maxTemp < 55 || isBadWeather) return 'Bad';
  if (maxTemp >= 60 && !isHeavyCloud) return 'Good';
  return 'Marginal';
}

function getDayName(dateStr, index) {
  if (index === 0) return 'Today';
  if (index === 1) return 'Tomorrow';
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export async function fetchWeatherForecast() {
  // Check cache
  try {
    const cached = await AsyncStorage.getItem('weatherCache');
    const cachedAt = await AsyncStorage.getItem('weatherCachedAt');
    if (cached && cachedAt) {
      const age = Date.now() - parseInt(cachedAt, 10);
      if (age < WEATHER_CACHE_DURATION) {
        return JSON.parse(cached);
      }
    }
  } catch (_) {}

  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${WEATHER_LAT}&longitude=${WEATHER_LON}` +
    `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
    `&temperature_unit=fahrenheit&forecast_days=7&timezone=America%2FNew_York`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Weather fetch failed: ${response.status}`);
  const data = await response.json();

  const { time, temperature_2m_max, temperature_2m_min, weathercode } = data.daily;

  const forecast = time.map((date, i) => ({
    date,
    dayName: getDayName(date, i),
    tempMax: Math.round(temperature_2m_max[i]),
    tempMin: Math.round(temperature_2m_min[i]),
    code: weathercode[i],
    description: getWeatherDescription(weathercode[i]),
    icon: getWeatherIcon(weathercode[i]),
    rating: rateDay(temperature_2m_max[i], temperature_2m_min[i], weathercode[i]),
  }));

  // Save to cache
  try {
    await AsyncStorage.setItem('weatherCache', JSON.stringify(forecast));
    await AsyncStorage.setItem('weatherCachedAt', Date.now().toString());
  } catch (_) {}

  return forecast;
}
