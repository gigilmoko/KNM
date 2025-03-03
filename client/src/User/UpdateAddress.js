import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

// Custom marker icon
const markerIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Component to handle map clicks for placing the marker
const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(event) {
      setPosition(event.latlng); // Update marker position on map click
    },
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
};

// Helper component to update map center dynamically
const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, map.getZoom()); // Keeps the current zoom level
  return null;
};

// Search input with results only on submit
const SearchBar = ({ setPosition }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(""); // New state for error message
  const provider = new OpenStreetMapProvider();

  const handleSearch = async (event) => {
    event.preventDefault();
    setError(""); // Reset error message
    if (!query) return;

    const searchResults = await provider.search({ query });

    if (searchResults.length === 0) {
      setError("No address found."); // Show error if no results
    }

    setResults(searchResults);
  };

  const handleSelectLocation = (lat, lng, name) => {
    setPosition({ lat, lng }); // Move marker & center to searched location
    setQuery(name);
    setResults([]);
    setError(""); // Clear error when a location is selected
  };

  return (
    <div className="relative w-full max-w-md z-50">
      <form onSubmit={handleSearch} className="flex">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location..."
          className="w-full px-3 py-2 border rounded-l-md shadow-sm focus:ring focus:ring-blue-300 bg-white"
        />
        <button 
          type="submit" 
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
        >
          Search
        </button>
      </form>
      
      {error && <p className="text-red-500 mt-2">{error}</p>}

      {results.length > 0 && (
        <ul className="absolute left-0 right-0 bg-white border rounded-md shadow-lg mt-1 z-50">
          {results.map((place, index) => (
            <li
              key={index}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => handleSelectLocation(place.y, place.x, place.label)}
            >
              {place.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ChangePassword = () => {
  const [position, setPosition] = useState({ lat: 14.50956367111596, lng: 121.03467166995625 });

  return (
    <div className="h-screen flex flex-col items-center justify-center relative">
      <h2 className="text-xl font-bold mb-4">Select Location</h2>

      <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-full max-w-md">
        <SearchBar setPosition={setPosition} />
      </div>

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        className="shadow-md rounded-lg mt-12"
      >
        <ChangeView center={position} />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>

      <p className="mt-4">Latitude: {position.lat}, Longitude: {position.lng}</p>
    </div>
  );
};

export default ChangePassword;
