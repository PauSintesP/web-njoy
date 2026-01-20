import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
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

// Componente para manejar clics en el mapa
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

// Componente para mover el mapa a una nueva posición
function MapMover({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15);
    }
  }, [position, map]);
  return null;
}

export default function LocationPicker({ onLocationChange, initialPosition = [41.3874, 2.1686] }) {
  const [position, setPosition] = useState(initialPosition);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const searchTimeout = useRef(null);

  // Buscar sugerencias mientras el usuario escribe
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setDisplayName(query);

    // Debounce para evitar muchas peticiones
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (query.length > 2) {
      searchTimeout.current = setTimeout(() => {
        searchLocation(query);
      }, 500);
    } else {
      setSuggestions([]);
    }
  };

  // Buscar ubicación por texto (geocoding directo)
  const searchLocation = async (query) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error buscando ubicación:', error);
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Seleccionar una sugerencia
  const handleSuggestionClick = (suggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    const name = suggestion.display_name.split(',')[0]; // Nombre corto
    const city = suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || name;

    setPosition([lat, lon]);
    setDisplayName(suggestion.display_name);
    setSearchQuery(suggestion.display_name);
    setSuggestions([]);
    setShowMap(true); // Mostrar mapa automáticamente

    onLocationChange({
      ciudad: city,
      direccion: suggestion.display_name,
      latitud: lat,
      longitud: lon
    });
  };

  // Manejar clic en el mapa (reverse geocoding)
  const handleMapClick = async (latlng) => {
    setPosition([latlng.lat, latlng.lng]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`
      );
      const data = await response.json();
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
      const fullAddress = data.display_name || '';

      setDisplayName(fullAddress);
      setSearchQuery(fullAddress);

      onLocationChange({
        ciudad: city,
        direccion: fullAddress,
        latitud: latlng.lat,
        longitud: latlng.lng
      });
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      onLocationChange({
        ciudad: '',
        direccion: '',
        latitud: latlng.lat,
        longitud: latlng.lng
      });
    }
  };

  // Buscar al presionar Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.length > 2) {
      e.preventDefault();
      searchLocation(searchQuery);
    }
  };

  return (
    <div className="location-picker">
      <div className="location-search-wrapper">
        <div className="location-input-group">
          <i className="fa-solid fa-location-dot location-icon"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder="Busca una dirección, ciudad o lugar..."
            className="location-input"
          />
          {isSearching && <i className="fa-solid fa-spinner fa-spin search-spinner"></i>}
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="map-toggle-btn"
            title={showMap ? 'Ocultar mapa' : 'Mostrar mapa'}
          >
            <i className={`fa-solid ${showMap ? 'fa-chevron-up' : 'fa-map'}`}></i>
          </button>
        </div>

        {/* Sugerencias de búsqueda */}
        {suggestions.length > 0 && (
          <ul className="location-suggestions">
            {suggestions.map((s, idx) => (
              <li key={idx} onClick={() => handleSuggestionClick(s)}>
                <i className="fa-solid fa-location-dot"></i>
                <span>{s.display_name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showMap && (
        <div className="map-container">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: '280px', width: '100%', borderRadius: '12px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={handleMapClick} />
            <MapMover position={position} />
            {position && <Marker position={position} />}
          </MapContainer>
          <p className="map-hint">
            <i className="fa-solid fa-hand-pointer"></i> Haz clic en el mapa para seleccionar la ubicación exacta
          </p>
        </div>
      )}

      {displayName && (
        <div className="selected-location">
          <i className="fa-solid fa-check-circle"></i>
          <span>{displayName.substring(0, 80)}{displayName.length > 80 ? '...' : ''}</span>
        </div>
      )}
    </div>
  );
}
