"use client";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface BubbleDataPoint {
  lat: number;
  lng: number;
  value: number;
  label: string;
}

interface BubbleMapProps {
  title: string;
  data: BubbleDataPoint[];
  className?: string;
  formatValue?: (value: number) => string;
  color?: string;
}

export function BubbleMap({ 
  title,
  data,
  className = "",
  formatValue = (value) => value.toLocaleString(),
  color = '#3B82F6' 
}: BubbleMapProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className}`}>
        <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
        <div className="flex items-center justify-center h-full text-gray-400">
          No data available for map.
        </div>
      </div>
    );
  }
  
  const maxValue = Math.max(...data.map(d => d.value));
  
  // Scale radius based on value
  const radiusScale = (value: number) => {
    if (maxValue === 0) return 5;
    return 10 + (value / maxValue) * 30; // Min radius 10, max 40
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-6 border border-gray-700 ${className} h-[450px] flex flex-col`}>
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="flex-grow rounded-lg overflow-hidden">
        <MapContainer 
          center={[26.8206, 30.8025]} // Centered on the general region
          zoom={4}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', backgroundColor: '#1F2937' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {data.map((point) => (
            <CircleMarker
              key={point.label}
              center={[point.lat, point.lng]}
              radius={radiusScale(point.value)}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.5,
                weight: 1,
              }}
            >
              <Tooltip>
                <div>
                  <div className="font-bold">{point.label}</div>
                  <div>{formatValue(point.value)}</div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}