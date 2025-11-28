import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LocationPicker.css';

// Fix para los iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

export default function LocationPicker({ onLocationChange, initialPosition = [41.3874, 2.1686] }) {
  const [position, setPosition] = useState(initialPosition);
  const [cityName, setCityName] = useState('');
  const [showMap, setShowMap] = useState(false);

  const handleMapClick = async (latlng) => {
    setPosition([latlng.lat, latlng.lng]);
    
    // Obtener nombre de la ciudad usando reverse geocoding (Nominatim)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await response.json();
      const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
      setCityName(city);
      
      // Notificar al componente padre
      onLocationChange({
        ciudad: city,
        latitud: latlng.lat,
        longitud: latlng.lng
      });
    } catch (error) {
      console.error('Error obteniendo nombre de ciudad:', error);
      setCityName('');
      onLocationChange({
        ciudad: '',
        latitud: latlng.lat,
        longitud: latlng.lng
      });
    }
  };

  const handleCityInputChange = (e) => {
    const newCity = e.target.value;
    setCityName(newCity);
    onLocationChange({
      ciudad: newCity,
      latitud: position[0],
      longitud: position[1]
    });
  };

  return (
    <div className="location-picker">
      <div className="location-input-group">
        <input
          type="text"
          value={cityName}
          onChange={handleCityInputChange}
          placeholder="Escribe el nombre de la ciudad o selecciona en el mapa"
          className="location-input"
        />
        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="map-toggle-btn"
        >
          {showMap ? '📍 Ocultar mapa' : '🗺️ Mostrar mapa'}
        </button>
      </div>

      {showMap && (
        <div className="map-container">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={handleMapClick} />
            {position && <Marker position={position} />}
          </MapContainer>
          <p className="map-hint">Haz clic en el mapa para seleccionar la ubicación</p>
        </div>
      )}
    </div>
  );
}
