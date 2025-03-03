import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import moment from "moment";
import { showNotification } from '../Layout/common/headerSlice';
import Subtitle from '../Layout/components/Typography/Subtitle';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify"; 
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';
import InputText from "../Layout/components/Input/InputText";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');


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
    <div className="relative w-full mt-4">
    <div className={`bg-${theme === 'dark' ? 'gray-800' : 'white'} p-3 rounded-lg shadow-lg`}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search location..."
        className="w-full px-3 py-2 border rounded-md shadow-sm focus:ring focus:ring-blue-300"
      />
  
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {results.length > 0 && (
        <ul
          className={`absolute left-0 right-0 border rounded-md shadow-lg mt-1 max-h-40 overflow-auto z-20 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
        >
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

function ProfileUpdate() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [position, setPosition] = useState({ lat: 14.50956367111596, lng: 121.03467166995625 });
    const [user, setUser] = useState({
        fname: '',
        lname: '',
        middlei: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        avatar: '',
        googleLogin: false,
    });
    

    const nameRegex = /^[A-Za-z\s]+$/;
    const middleInitialRegex = /^[A-Z]$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{11}$/;
    
      
    
      useEffect(() => {
        if (!localStorage.getItem('theme')) {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setTheme(prefersDark ? 'dark' : 'light');
        }
      }, []);

    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        const config = {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        };
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
            setUser(data.user || {}); // Ensure user state is updated
            const userLat = data.user?.deliveryAddress?.[0]?.latitude || 14.50956367111596; // default if not available
            const userLng = data.user?.deliveryAddress?.[0]?.longitude || 121.03467166995625; // default if not available
            setPosition({ lat: userLat, lng: userLng });
        } catch (error) {
            console.log(error);
        }
    };

    const updateFormValue = (updateType, value) => {
        setUser((prevUser) => ({
            ...prevUser,
            [updateType]: value
        }));
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

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'ml_default'); 
    
            try {
                const response = await axios.post(
                    'https://api.cloudinary.com/v1_1/dglawxazg/image/upload',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                const imageUrl = response.data.secure_url;
                setUser((prevUser) => ({ ...prevUser, avatar: imageUrl })); 
                toast.success("Avatar uploaded successfully!"); 
            } catch (error) {
                console.error('Failed to upload avatar', error);
                toast.error('Failed to upload avatar. Please try again.'); 
            }
        }
    };

    const validateForm = () => {
        const errors = {};
    
        if (!user.fname.trim()) {
            errors.fname = "First name is required.";
        } else if (!nameRegex.test(user.fname)) {
            errors.fname = "First name must contain only letters and spaces.";
        }
    
        if (!user.lname.trim()) {
            errors.lname = "Last name is required."; 
        } else if (!nameRegex.test(user.lname)) {
            errors.lname = "Last name must contain only letters and spaces.";
        }
    
        if (user.middlei && !user.middlei.trim()) {
            errors.middlei = "Middle initial is required."; 
        } else if (user.middlei && !middleInitialRegex.test(user.middlei)) {
            errors.middlei = "Middle initial must be a single uppercase letter.";
        }
    
        if (!user.email.trim()) {
            errors.email = "Email is required."; 
        } else if (!emailRegex.test(user.email)) {
            errors.email = "Please enter a valid email address.";
        }
        if (!user.phone.trim()) {
            errors.phone = "Phone number is required.";
        } else if (!phoneRegex.test(user.phone)) {
            errors.phone = "Phone number must be an 11-digit number.";
        }
    
        return errors;
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();
    
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            Object.values(errors).forEach((error) => {
                toast.error(error); 
            });
            return; 
        }
    
        const profileData = { 
            fname: user.fname, 
            lname: user.lname, 
            middlei: user.middlei, 
            dateOfBirth: user.dateOfBirth, 
            email: user.email, 
            phone: user.phone, 
            avatar: user.avatar
        };
    
        try {
            await axios.put(`${process.env.REACT_APP_API}/api/me/update`, profileData, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            toast.success("Profile updated successfully!"); 
            dispatch(showNotification({ message: "Profile Updated", status: 1 })); 
            navigate('/profile'); 
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error("An error occurred while updating the profile.");
        }
    };

    return (
        <div className={`min-h-screen bg-base-200 flex flex-col`}>
            <HeaderPublic />
            <div className="flex items-center justify-center flex-grow">
                <ToastContainer/>
                <div className={`mx-auto w-full max-w-2xl shadow-xl p-6 my-12 bg-base-100 rounded-xl border border-gray-300`}>
                    <h2 className="text-3xl font-bold mb-2 text-center text-[#df1f47]">Update Profile</h2>
                    <p className={`text-center mb-6 text-gray-600`}>Edit your personal information</p>

                    <div className='h-full w-full pb-4'>
                        <div className="flex items-center justify-center mb-4">
                            <label htmlFor="avatar-upload" className="cursor-pointer">
                                <img
                                    src={user.avatar && user.avatar.trim() ? user.avatar : "https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png"}
                                    alt="User Avatar"
                                    className="rounded-full h-24 w-24 object-cover"
                                />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputText
                                    type="text"
                                    defaultValue={user.fname}
                                    containerStyle="mt-1"
                                    labelTitle="First Name"
                                    updateFormValue={({ value }) => updateFormValue('fname', value)}
                                />
                                <InputText
                                    type="text"
                                    defaultValue={user.lname}
                                    containerStyle="mt-1"
                                    labelTitle="Last Name"
                                    updateFormValue={({ value }) => updateFormValue('lname', value)}
                                />
                                <InputText
                                    type="text"
                                    defaultValue={user.middlei}
                                    containerStyle="mt-1"
                                    labelTitle="Middle Initial"
                                    updateFormValue={({ value }) => updateFormValue('middlei', value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                                <InputText
                                    type="email"
                                    defaultValue={user.email}
                                    containerStyle="mt-1"
                                    labelTitle="Email"
                                    updateFormValue={({ value }) => updateFormValue('email', value)}
                                />
                                <InputText
                                    type="text"
                                    defaultValue={user.phone}
                                    containerStyle="mt-1"
                                    labelTitle="Phone"
                                    updateFormValue={({ value }) => updateFormValue('phone', value)}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputText
                                    type="text"
                                    defaultValue={user.dateOfBirth ? moment(user.dateOfBirth).format('YYYY-MM-DD') : 'N/A'}
                                    containerStyle="mt-1"
                                    labelTitle="Date of Birth"
                                    updateFormValue={({ value }) => updateFormValue('dateOfBirth', value)}
                                />
                            </div>
                            <div className="flex justify-end gap-4 mt-4">
                                <button
                                    type="submit"
                                    className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200"
                                >
                                    Update Profile
                                </button>
                            </div>
                            <div className="divider mt-4"></div>
                            <p className={`font-bold text-[#df1f47]`}>Address</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
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
                           
                                    
                                  <div className="w-full max-w-4xl mt-4">
                                          <MapContainer
                                            center={position}
                                            zoom={15}
                                            style={{ height: "400px", width: "100%" }}
                                            className="shadow-md rounded-lg"
                                          >
                                            <ChangeView center={position} />
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <LocationMarker position={position} setPosition={setPosition} />
                                          </MapContainer>
                                          <SearchBar setPosition={setPosition} />
                                        </div>
                            
                                  <p className="mt-4">Latitude: {position.lat}, Longitude: {position.lng}</p>
                            <div className="flex justify-end gap-4 mt-4">
                                <button
                                    onClick={handleUpdateAddress}
                                    className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200"
                                >
                                    Update Address
                                </button>
                            </div>

                            
                        </form>
                    </div>
                </div>
            </div>
            <FooterPublic />
        </div>
    );
}

export default ProfileUpdate;