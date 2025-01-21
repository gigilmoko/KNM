import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';

const nameRegex = /^[A-Za-z\s]{2,100}$/;
const phoneRegex = /^[0-9]{10,15}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function UpdateRider() {
    const { riderId } = useParams();
    const navigate = useNavigate();
    const [riderData, setRiderData] = useState({
        fname: '',
        lname: '',
        middlei: '',
        email: '',
        phone: '',
        avatar: 'default_avatar.png',
    });
    const [avatarImage, setAvatarImage] = useState('default_avatar.png'); // Avatar preview

    useEffect(() => {
        console.log('Rider ID:', riderId); // Log riderId to make sure it's being passed correctly
        const fetchRider = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API}/api/rider/${riderId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Rider data:', response.data); // Log the response data
                setRiderData({
                    fname: response.data.rider.fname || '',
                    lname: response.data.rider.lname || '',
                    middlei: response.data.rider.middlei || '',
                    email: response.data.rider.email || '',
                    phone: response.data.rider.phone || '',
                    avatar: response.data.rider.avatar || 'default_avatar.png',
                });
                setAvatarImage(response.data.rider.avatar || 'default_avatar.png');
            } catch (error) {
                console.error('Failed to fetch rider data:', error);
                toast.error('Failed to load rider details.');
            }
        };
        fetchRider();
    }, [riderId]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRiderData({ ...riderData, [name]: value });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'ml_default'); // Replace with your Cloudinary preset

            try {
                const response = await axios.post(
                    'https://api.cloudinary.com/v1_1/dglawxazg/image/upload', // Replace with your Cloudinary URL
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                const imageUrl = response.data.secure_url;
                setAvatarImage(imageUrl); // Update avatar image preview
                setRiderData((prev) => ({ ...prev, avatar: imageUrl }));
                toast.success('Avatar uploaded successfully!');
            } catch (error) {
                console.error('Failed to upload avatar', error);
                toast.error('Failed to upload avatar. Please try again.');
            }
        }
    };

    const validateForm = () => {
        if (!nameRegex.test(riderData.fname.trim()) || !nameRegex.test(riderData.lname.trim())) {
            toast.error('First and last names must contain only letters and spaces, 2-100 characters.');
            return false;
        }
        if (!emailRegex.test(riderData.email.trim())) {
            toast.error('Invalid email format.');
            return false;
        }
        if (!phoneRegex.test(riderData.phone.trim())) {
            toast.error('Phone number must be between 10-15 digits.');
            return false;
        }
        return true;
    };

    const updateRider = async () => {
        if (!validateForm()) return;

        try {
            const token = sessionStorage.getItem('token');
            await axios.put(
                `${process.env.REACT_APP_API}/api/rider/update/${riderId}`,
                riderData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            toast.success('Rider updated successfully!');
            setTimeout(() => navigate('/admin/rider/list'), 3000);
        } catch (error) {
            console.error('Failed to update rider:', error);
            toast.error('Failed to update rider. Please try again.');
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6 bg-base-200">
                        <TitleCard title="Update Rider">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label>First Name</label>
                                    <input
                                        type="text"
                                        name="fname"
                                        value={riderData.fname || ''}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label>Last Name</label>
                                    <input
                                        type="text"
                                        name="lname"
                                        value={riderData.lname || ''}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label>Middle Initial</label>
                                    <input
                                        type="text"
                                        name="middlei"
                                        value={riderData.middlei || ''}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={riderData.email || ''}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={riderData.phone || ''}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label>Avatar</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="input input-bordered w-full"
                                    />
                                    <img
                                        src={avatarImage || 'default_avatar.png'}
                                        alt="Avatar Preview"
                                        className="mt-2 w-24 h-24 rounded-full"
                                    />
                                </div>
                                <div className="mt-4">
                                    <button className="btn btn-primary" onClick={updateRider}>
                                        Update Rider
                                    </button>
                                </div>
                            </div>
                        </TitleCard>
                    </main>
                </div>
                <LeftSidebar />
                <RightSidebar />
                <ModalLayout />
            </div>
        </>
    );
}

export default UpdateRider;
