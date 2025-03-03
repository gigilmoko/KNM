import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import Subtitle from '../Layout/components/Typography/Subtitle';
import { useNavigate } from "react-router-dom";
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';
import { quantum } from 'ldrs';
import InputText from "../Layout/components/Input/InputText";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

quantum.register();

const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const LocationMarker = ({ position }) => {
    return position ? <Marker position={position} icon={markerIcon} /> : null;
  };

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

function Profile() {
    const [user, setUser] = useState({
        fname: '',
        lname: '',
        middlei: '',
        email: '',
        phone: '',
        memberId: '',
        dateOfBirth: '',
        address: '',
        avatar: '',
        googleLogin: false,
        role: '' // Add role to user state
    });
    const [position, setPosition] = useState({ lat: 14.50956367111596, lng: 121.03467166995625 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const navigate = useNavigate(); // Initialize useNavigate

    // Fetch profile data on component mount
    useEffect(() => {
        getProfile();
        if (!localStorage.getItem('theme')) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    const getProfile = async () => {
        const config = {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
        };
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
            console.log('Profile:', data);
            setUser(data.user || {}); // Ensure user state is updated
            setLoading(false);
            const userLat = data.user?.deliveryAddress?.[0]?.latitude || 14.50956367111596; // default if not available
            const userLng = data.user?.deliveryAddress?.[0]?.longitude || 121.03467166995625; // default if not available
            setPosition({ lat: userLat, lng: userLng });
        } catch (error) {
            console.log(error);
            setError('Failed to load profile.');
            setLoading(false);
        }
    };

    
    if (error) return <p>{error}</p>;

    const handleEditClick = () => {
        navigate('/profile/edit'); // Redirect to settings profile
    };

    const handleChangePassword = () => {
        navigate('/profile/changepassword'); 
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-base-200 text-black'} flex flex-col`}>
            <HeaderPublic />
            <div className="flex items-center justify-center flex-grow">
                <div className={`mx-auto w-full max-w-2xl shadow-xl p-6 my-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-base-100'} rounded-xl border border-gray-300`}>
                <h2 className="text-3xl font-bold mb-2 text-center text-[#df1f47]">Profile</h2>
                <p className={`text-center mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>View your personal information</p>

                    

                    <div className='h-full w-full pb-4'>
                    <div className="flex items-center justify-center mb-4">
    <img
        src={user.avatar && user.avatar.trim() ? user.avatar : "https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png"}
        alt="User Avatar"
        className="rounded-full h-24 w-24 object-cover"
    />
</div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputText
                                type="text"
                                defaultValue={user.fname}
                                containerStyle="mt-1"
                                labelTitle="First Name"
                                readOnly
                                disabled
                            />
                            <InputText
                                type="text"
                                defaultValue={user.lname}
                                containerStyle="mt-1"
                                labelTitle="Last Name"
                                readOnly
                                disabled
                            />
                            <InputText
                                type="text"
                                defaultValue={user.middlei}
                                containerStyle="mt-1"
                                labelTitle="Middle Initial"
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                            <InputText
                                type="email"
                                defaultValue={user.email}
                                containerStyle="mt-1"
                                labelTitle="Email"
                                readOnly
                                disabled
                            />
                            <InputText
                                type="text"
                                defaultValue={user.phone}
                                containerStyle="mt-1"
                                labelTitle="Phone"
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="md:col-span-2">
                        <InputText
                            type="text"
                            defaultValue={user.dateOfBirth ? moment(user.dateOfBirth).format('YYYY-MM-DD') : 'N/A'}
                            containerStyle="mt-1"
                            labelTitle="Date of Birth"
                            readOnly
                            disabled
                        />
                    </div>
                    <div className="divider mt-4"></div>
                   
                <p className={`font-bold  text-[#df1f47]`}>Address</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                            <InputText
                                type="text"
                                defaultValue={user.deliveryAddress?.[0]?.houseNo || 'N/A'}
                                containerStyle="mt-1"
                                labelTitle="House No."
                                readOnly
                                disabled
                            />
                            <InputText
                                type="text"
                                defaultValue={user.deliveryAddress?.[0]?.streetName || 'N/A'}
                                containerStyle="mt-1"
                                labelTitle="Street Name"
                                readOnly
                                disabled
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                            <InputText
                                type="text"
                                defaultValue={user.deliveryAddress?.[0]?.barangay || 'N/A'}
                                containerStyle="mt-1"
                                labelTitle="Barangay"
                                readOnly
                                disabled
                            />
                            <InputText
                                type="text"
                                defaultValue={user.deliveryAddress?.[0]?.city || 'N/A'}
                                containerStyle="mt-1"
                                labelTitle="City"
                                readOnly
                                disabled
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
                                         
                                        </div>

                       
                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                type="button"
                                className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200"
                                onClick={handleEditClick}
                            >
                                Edit Profile
                            </button>
                            
                        </div>
                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                type="button"
                                className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200"
                                onClick={handleChangePassword}
                            >
                                Change Password
                            </button>
                            
                        </div>
                    </div>
                </div>
            </div>
            <FooterPublic />
        </div>
    );
}

export default Profile;
