/**
 * Weather utilities for Randolph County, NC (Asheboro area)
 * Lat: 35.71°N  Lon: -79.81°W  Zone: 7b
 *
 * In production this would call OpenWeatherMap or similar API.
 * For now we generate realistic mock data based on typical NC climate.
 */

const CONDITIONS = [
  { label: 'Sunny', icon: '☀️', precipChance: 0 },
  { label: 'Mostly Sunny', icon: '🌤️', precipChance: 5 },
  { label: 'Partly Cloudy', icon: '⛅', precipChance: 20 },
  { label: 'Mostly Cloudy', icon: '🌥️', precipChance: 30 },
  { label: 'Cloudy', icon: '☁️', precipChance: 40 },
  { label: 'Chance of Rain', icon: '🌦️', precipChance: 50 },
  { label: 'Showers', icon: '🌧️', precipChance: 80 },
  { label: 'Thunderstorms', icon: '⛈️', precipChance: 90 },
];

// Average high/low temps by month (°F) for Asheboro, NC
const MONTHLY_TEMPS = [
  { high: 50, low: 28 },  // Jan
  { high: 54, low: 30 },  // Feb
  { high: 63, low: 37 },  // Mar
  { high: 72, low: 45 },  // Apr
  { high: 80, low: 54 },  // May
  { high: 87, low: 62 },  // Jun
  { high: 90, low: 66 },  // Jul
  { high: 89, low: 65 },  // Aug
  { high: 83, low: 58 },  // Sep
  { high: 73, low: 46 },  // Oct
  { high: 63, low: 37 },  // Nov
  { high: 53, low: 29 },  // Dec
];

// Average wind speeds by month (mph)
const MONTHLY_WIND = [9, 10, 11, 10, 8, 7, 6, 6, 7, 8, 9, 9];

// Seeded pseudo-random (deterministic per day)
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function getDaySeed(date) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

export function generateWeekForecast() {
  const forecast = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const month = date.getMonth();
    const rand = seededRand(getDaySeed(date) + 7777);
    const r = rand;

    const avgHigh = MONTHLY_TEMPS[month].high;
    const avgLow = MONTHLY_TEMPS[month].low;

    const highTemp = Math.round(avgHigh + (r() - 0.5) * 18);
    const lowTemp = Math.round(avgLow + (r() - 0.5) * 12);
    const windSpeed = Math.max(2, Math.round(MONTHLY_WIND[month] + (r() - 0.5) * 8));

    // Weight conditions toward less rain on most days
    const condRoll = r();
    let condition;
    if (condRoll < 0.25) condition = CONDITIONS[0];       // Sunny
    else if (condRoll < 0.45) condition = CONDITIONS[1];  // Mostly Sunny
    else if (condRoll < 0.60) condition = CONDITIONS[2];  // Partly Cloudy
    else if (condRoll < 0.70) condition = CONDITIONS[3];  // Mostly Cloudy
    else if (condRoll < 0.78) condition = CONDITIONS[4];  // Cloudy
    else if (condRoll < 0.87) condition = CONDITIONS[5];  // Chance Rain
    else if (condRoll < 0.94) condition = CONDITIONS[6];  // Showers
    else condition = CONDITIONS[7];                        // Thunderstorms

    const humidity = Math.round(40 + condition.precipChance * 0.4 + r() * 20);

    forecast.push({
      date,
      dayLabel: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      highTemp,
      lowTemp,
      windSpeed,
      humidity: Math.min(100, humidity),
      condition: condition.label,
      conditionIcon: condition.icon,
      precipChance: condition.precipChance,
      inspectionRating: rateInspectionDay({ highTemp, windSpeed, precipChance: condition.precipChance }),
    });
  }

  return forecast;
}

export function rateInspectionDay({ highTemp, windSpeed, precipChance }) {
  let score = 0;

  // Temperature scoring (bees are best inspected 65-85°F)
  if (highTemp >= 65 && highTemp <= 85) score += 40;
  else if (highTemp >= 58 && highTemp < 65) score += 28;
  else if (highTemp > 85 && highTemp <= 92) score += 28;
  else if (highTemp >= 50 && highTemp < 58) score += 12;
  else if (highTemp > 92) score += 12;
  else score += 0; // below 50 or extreme

  // Wind scoring
  if (windSpeed <= 10) score += 30;
  else if (windSpeed <= 15) score += 20;
  else if (windSpeed <= 20) score += 10;
  else score += 0;

  // Rain scoring
  if (precipChance === 0) score += 30;
  else if (precipChance <= 10) score += 22;
  else if (precipChance <= 30) score += 14;
  else if (precipChance <= 50) score += 5;
  else score += 0;

  if (score >= 88) return { label: 'Excellent', color: '#3A8C3F', emoji: '✅', tip: 'Perfect day to open hives' };
  if (score >= 70) return { label: 'Good', color: '#7BB83A', emoji: '👍', tip: 'Good day to inspect' };
  if (score >= 50) return { label: 'Fair', color: '#E8A020', emoji: '⚠️', tip: 'Inspect with caution' };
  if (score >= 30) return { label: 'Poor', color: '#E07020', emoji: '👎', tip: 'Avoid inspecting if possible' };
  return { label: 'Don\'t Inspect', color: '#C0392B', emoji: '🚫', tip: 'Keep hives closed today' };
}

export function getCurrentWeatherSummary(forecast) {
  if (!forecast || forecast.length === 0) return null;
  return forecast[0];
}
