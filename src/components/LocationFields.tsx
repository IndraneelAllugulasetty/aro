'use client';

import { useMemo, useState } from 'react';

const INDIA_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
];

export function LocationFields() {
  const [stateName, setStateName] = useState<string>('Maharashtra');
  const [city, setCity] = useState<string>('');
  const [lat, setLat] = useState<string>('');
  const [lng, setLng] = useState<string>('');
  const [geoStatus, setGeoStatus] = useState<string>('');

  const composedLocation = useMemo(() => {
    const parts = [city.trim(), stateName.trim()].filter(Boolean);
    return parts.join(', ');
  }, [city, stateName]);

  async function useCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation not supported on this browser.');
      return;
    }
    setGeoStatus('Requesting location permission…');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(String(latitude));
        setLng(String(longitude));
        setGeoStatus('Location captured. Fetching address details...');

        try {
          // Reverse geocoding using Nominatim (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await response.json();

          if (data && data.address) {
            const address = data.address;
            const state = address.state || '';
            const district = address.state_district || address.county || address.city || address.town || address.village || '';

            if (state) {
              // Match state with our list if possible
              const matchedState = INDIA_STATES.find(s => s.toLowerCase() === state.toLowerCase());
              if (matchedState) setStateName(matchedState);
              else setStateName(state);
            }
            if (district) setCity(district.replace(' District', ''));

            setGeoStatus(`Auto-filled: ${district}, ${state}`);
          } else {
            setGeoStatus('Location captured, but address lookup failed.');
          }
        } catch (error) {
          console.error('Reverse Geocoding Error:', error);
          setGeoStatus('Location captured. Manual address entry required.');
        }
      },
      (err) => {
        setGeoStatus(err.message || 'Could not get current location.');
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-gray-400 mb-1">State (India)</label>
          <select
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            {INDIA_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">City / Village</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
            placeholder="e.g. Nashik"
          />
        </div>
      </div>

      <input type="hidden" name="location" value={composedLocation || stateName} />
      <input type="hidden" name="latitude" value={lat} />
      <input type="hidden" name="longitude" value={lng} />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-black/30 border border-white/10 rounded-xl p-3">
        <div className="text-sm">
          <p className="text-gray-300 font-semibold">Use current location (recommended)</p>
          <p className="text-xs text-gray-500 mt-1">
            This improves soil + climate accuracy. You can still list land without it.
          </p>
          {geoStatus && <p className="text-xs text-emerald-300 mt-2">{geoStatus}</p>}
          {(lat && lng) && (
            <p className="text-xs text-gray-400 mt-1">
              Lat/Lng: {Number(lat).toFixed(5)}, {Number(lng).toFixed(5)}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={useCurrentLocation}
          className="px-4 py-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/20 transition-colors text-sm font-semibold"
        >
          Use my current location
        </button>
      </div>
    </div>
  );
}

