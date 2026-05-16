export async function getWeatherData(lat: number, lon: number) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days=7`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!res.ok) throw new Error('Weather data fetch failed');
    
    const data = await res.json();
    
    return data.daily.time.map((date: string, i: number) => ({
      date,
      maxTemp: data.daily.temperature_2m_max[i],
      minTemp: data.daily.temperature_2m_min[i],
      rain: data.daily.precipitation_sum[i],
      condition: getWeatherCondition(data.daily.weathercode[i]),
      icon: getWeatherIcon(data.daily.weathercode[i]),
    }));
  } catch (error) {
    console.error('Weather Fetch Error:', error);
    return null;
  }
}

function getWeatherCondition(code: number) {
  if (code === 0) return 'Clear Sky';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Cloudy';
}

function getWeatherIcon(code: number) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '☁️';
}
