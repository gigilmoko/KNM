import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';

const passwordRegex = /^[A-Za-z0-9!@#$%^&*]{8,}$/; // Password must be at least 6 characters

function UpdatePassword() {
    const navigate = useNavigate();
    const { riderId } = useParams(); // Get riderId from the URL
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
            toast.error('New password must be at least 6 characters.');
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
    
            // Log the data being sent
            console.log('Sending data:', {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword,
            });
    
            await axios.put(
                `${process.env.REACT_APP_API}/api/rider/update/password/${riderId}`,
                { oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword },  // Corrected field name here
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            toast.success('Password updated successfully!');
            setTimeout(() => navigate('/admin/rider/list'), 3000);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update password.');
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
                        <TitleCard title="Update Password">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label>Old Password</label>
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        value={passwordData.oldPassword}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div className="mt-4">
                                    <button className="btn btn-primary" onClick={updatePassword}>
                                        Update Password
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

export default UpdatePassword;
