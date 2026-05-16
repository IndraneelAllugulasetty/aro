'use client';

import { useEffect, useState } from 'react';

type Forecast = {
  date: string;
  maxTemp: number;
  minTemp: number;
  rain: number;
  condition: string;
  icon: string;
};

export function WeatherCard({ lat, lon, landName }: { lat: number; lon: number; landName: string }) {
  const [forecast, setForecast] = useState<Forecast[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=auto&forecast_days=7`;
        const res = await fetch(url);
        const data = await res.json();
        
        const mapped = data.daily.time.map((date: string, i: number) => ({
          date,
          maxTemp: data.daily.temperature_2m_max[i],
          minTemp: data.daily.temperature_2m_min[i],
          rain: data.daily.precipitation_sum[i],
          condition: getWeatherCondition(data.daily.weathercode[i]),
          icon: getWeatherIcon(data.daily.weathercode[i]),
        }));
        setForecast(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadWeather();
  }, [lat, lon]);

  if (loading) return (
    <div className="glass-panel p-6 animate-pulse">
      <div className="h-4 w-32 bg-white/10 rounded mb-4" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 w-20 bg-white/5 rounded-2xl flex-shrink-0" />)}
      </div>
    </div>
  );

  if (!forecast) return null;

  return (
    <div className="glass-panel p-6 overflow-hidden relative group">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all" />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-white">Weather Insight</h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-black">{landName}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-blue-400">{forecast[0].maxTemp}°</p>
          <p className="text-[10px] text-gray-500 font-bold uppercase">Current High</p>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
        {forecast.map((day, i) => (
          <div key={day.date} className={`flex-shrink-0 w-24 p-3 rounded-2xl border transition-all ${
            i === 0 ? 'bg-blue-500/20 border-blue-500/30' : 'bg-white/5 border-white/5 hover:bg-white/10'
          }`}>
            <p className="text-[10px] text-gray-400 font-bold text-center mb-2">
              {i === 0 ? 'TODAY' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
            </p>
            <div className="text-2xl text-center mb-2">{day.icon}</div>
            <div className="text-center">
              <span className="text-sm font-black text-white">{Math.round(day.maxTemp)}°</span>
              <span className="text-[10px] text-gray-500 ml-1">{Math.round(day.minTemp)}°</span>
            </div>
            {day.rain > 0 && (
              <p className="text-[9px] text-blue-400 text-center mt-1 font-bold">💧 {day.rain}mm</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getWeatherCondition(code: number) {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 67) return 'Rain';
  return 'Storm';
}

function getWeatherIcon(code: number) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 82) return '🌦️';
  if (code <= 99) return '⛈️';
  return '☁️';
}
