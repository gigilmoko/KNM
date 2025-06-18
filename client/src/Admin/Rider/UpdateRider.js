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
    const [avatarImage, setAvatarImage] = useState('default_avatar.png');

    useEffect(() => {
        const fetchRider = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API}/api/rider/${riderId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
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
                    'https://api.cloudinary.com/v1_1/dglawxazg/image/upload',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                const imageUrl = response.data.secure_url;
                setAvatarImage(imageUrl);
                setRiderData((prev) => ({ ...prev, avatar: imageUrl }));
                toast.success('Avatar uploaded successfully!');
            } catch (error) {
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
            setTimeout(() => navigate('/admin/rider/list'), 2000);
        } catch (error) {
            toast.error('Failed to update rider. Please try again.');
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-2 sm:p-6 bg-base-200">
                        <div className="max-w-lg w-full mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-8">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center" style={{ color: '#ed003f' }}>
                                Update Rider
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="font-semibold text-[#ed003f]">First Name</label>
                                    <input
                                        type="text"
                                        name="fname"
                                        value={riderData.fname || ''}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#ed003f]">Last Name</label>
                                    <input
                                        type="text"
                                        name="lname"
                                        value={riderData.lname || ''}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#ed003f]">Middle Initial</label>
                                    <input
                                        type="text"
                                        name="middlei"
                                        value={riderData.middlei || ''}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#ed003f]">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={riderData.email || ''}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#ed003f]">Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={riderData.phone || ''}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#ed003f]">Avatar</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="input input-bordered w-full"
                                    />
                                    <img
                                        src={avatarImage || 'default_avatar.png'}
                                        alt="Avatar Preview"
                                        className="mt-2 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#ed003f] object-cover"
                                    />
                                </div>
                                <div className="mt-4">
                                    <button
                                        className="btn w-full"
                                        style={{ backgroundColor: '#ed003f', color: '#fff', border: 'none' }}
                                        onClick={updateRider}
                                    >
                                        Update Rider
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="h-16"></div>
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