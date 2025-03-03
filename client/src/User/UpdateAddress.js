import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import InputText from "../Layout/components/Input/InputText";
import axios from "axios";
import { toast } from "react-toastify";

// Custom marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(event) {
      setPosition(event.latlng);
    },
  });
  return position ? <Marker position={position} icon={markerIcon} /> : null;
};

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

const SearchBar = ({ setPosition }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const provider = new OpenStreetMapProvider();

  useEffect(() => {
    if (!query) {
      setResults([]);
      setError("");
      return;
    }

    const timeoutId = setTimeout(async () => {
      const searchResults = await provider.search({ query });
      if (searchResults.length === 0) {
        setError("No address found.");
        setResults([]);
      } else {
        setError("");
        setResults(searchResults);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectLocation = (lat, lng, name) => {
    setPosition({ lat, lng });
    setQuery(name);
    setResults([]);
    setError("");
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="bg-white p-3 rounded-lg shadow-lg">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search location..."
          className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300 bg-white"
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {results.length > 0 && (
          <ul className="absolute left-0 right-0 bg-white border rounded-md shadow-lg mt-1 max-h-40 overflow-auto z-20">
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
    </div>
  );
};

const ChangePassword = () => {
    const [position, setPosition] = useState({ lat: 14.50956367111596, lng: 121.03467166995625 });
    const [user, setUser] = useState({});
  
    useEffect(() => {
      getProfile();
    }, []);
  
    const getProfile = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      };
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
        setUser(data.user || {});
        
        // Set the position to user's lat and lng
        const userLat = data.user?.deliveryAddress?.[0]?.latitude || 14.50956367111596; // default if not available
        const userLng = data.user?.deliveryAddress?.[0]?.longitude || 121.03467166995625; // default if not available
        setPosition({ lat: userLat, lng: userLng });
  
      } catch (error) {
        console.log("Error fetching profile:", error);
      }
    };
  
    const handleUpdateAddress = async () => {
      if (!user._id) {
        toast.error("User ID is missing");
        return;
      }
    
      const updatedAddress = [
        {
          houseNo: user.deliveryAddress?.[0]?.houseNo || "N/A",
          streetName: user.deliveryAddress?.[0]?.streetName || "N/A",
          barangay: user.deliveryAddress?.[0]?.barangay || "N/A",
          city: user.deliveryAddress?.[0]?.city || "N/A",
          latitude: position.lat,
          longitude: position.lng,
        },
      ];
    
      // Log the updatedAddress data
      console.log("Data being sent:", {
        userId: user._id,
        deliveryAddress: updatedAddress,
      });
    
      try {
        await axios.put(
          `${process.env.REACT_APP_API}/api/me/update/address`,
          { userId: user._id, deliveryAddress: updatedAddress },
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        toast.success("Address updated successfully!");
      } catch (error) {
        console.error("Error updating address:", error);
        toast.error("Failed to update address.");
      }
    };
  
    return (
      <div className="h-screen flex flex-col items-center justify-center relative">
        <h2 className="text-xl font-bold mb-4">Select Location</h2>
        <SearchBar setPosition={setPosition} />
  
        <div className="w-full max-w-4xl mt-20">
          <MapContainer center={position} zoom={13} style={{ height: "400px", width: "100%" }} className="shadow-md rounded-lg">
            <ChangeView center={position} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>
  
        <p className="mt-4">Latitude: {position.lat}, Longitude: {position.lng}</p>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 w-full max-w-md">
          <InputText
            type="text"
            defaultValue={user.deliveryAddress?.[0]?.houseNo || ""}
            containerStyle="mt-1"
            labelTitle="House No."
            updateFormValue={({ value }) => setUser((prev) => ({ ...prev, deliveryAddress: [{ ...prev.deliveryAddress[0], houseNo: value }] }))} 
          />
          <InputText
            type="text"
            defaultValue={user.deliveryAddress?.[0]?.streetName || ""}
            containerStyle="mt-1"
            labelTitle="Street Name"
            updateFormValue={({ value }) => setUser((prev) => ({ ...prev, deliveryAddress: [{ ...prev.deliveryAddress[0], streetName: value }] }))} 
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
  <InputText
    type="text"
    defaultValue={user.deliveryAddress?.[0]?.barangay || 'N/A'}
    containerStyle="mt-1"
    labelTitle="Barangay"
    updateFormValue={({ value }) => setUser((prev) => ({
      ...prev,
      deliveryAddress: [{ ...prev.deliveryAddress[0], barangay: value }],
    }))}
  />
  <InputText
    type="text"
    defaultValue={user.deliveryAddress?.[0]?.city || 'N/A'}
    containerStyle="mt-1"
    labelTitle="City"
    updateFormValue={({ value }) => setUser((prev) => ({
      ...prev,
      deliveryAddress: [{ ...prev.deliveryAddress[0], city: value }],
    }))}
  />
</div>
  
        <button onClick={handleUpdateAddress} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Save Address
        </button>
      </div>
    );
  };
  

export default ChangePassword;
