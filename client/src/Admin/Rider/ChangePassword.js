import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';

const passwordRegex = /^[A-Za-z0-9!@#$%^&*]{8,}$/; // Password must be at least 8 characters

function UpdatePassword() {
    const navigate = useNavigate();
    const { riderId } = useParams();
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const validateForm = () => {
        if (!passwordRegex.test(passwordData.newPassword)) {
            toast.error('New password must be at least 8 characters.');
            return false;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New password and confirm password do not match.');
            return false;
        }
        if (!passwordData.oldPassword.trim()) {
            toast.error('Old password is required.');
            return false;
        }
        return true;
    };

    const updatePassword = async () => {
        if (!validateForm()) return;

        try {
            const token = sessionStorage.getItem('token');
            await axios.put(
                `${process.env.REACT_APP_API}/api/rider/update/password/${riderId}`,
                { oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            toast.success('Password updated successfully!');
            setTimeout(() => navigate('/admin/rider/list'), 2000);
        } catch (error) {
            toast.error('Failed to update password.');
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
                                Change Rider Password
                            </h2>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="font-semibold text-[#ed003f]">Old Password</label>
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        value={passwordData.oldPassword}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#ed003f]">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label className="font-semibold text-[#ed003f]">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div className="mt-4">
                                    <button
                                        className="btn w-full"
                                        style={{ backgroundColor: '#ed003f', color: '#fff', border: 'none' }}
                                        onClick={updatePassword}>
                                        Update Password
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

export default UpdatePassword;