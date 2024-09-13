import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import moment from "moment";
import TitleCard from "../../../components/Cards/TitleCard";
import { showNotification } from '../../common/headerSlice';

function ProfileSettings() {
    const dispatch = useDispatch();
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
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState('');
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Fetch profile data on component mount
    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async () => {
        const config = {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
            setUser(data.user || {});
            setLoading(false);
        } catch (error) {
            console.log(error);
            setError('Failed to load profile.');
            setLoading(false);
        }
    };

    const updateFormValue = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
    };

    const updatePasswordValue = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [name]: value
        }));
    };

   

    const handlePasswordSubmit = async (event) => {
        event.preventDefault();
    
        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('New password and confirm password do not match.');
            return;
        }
    
        try {
            // Log the data being sent
            console.log('Data sent for password update:', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
    
            const response = await axios.put(`${process.env.REACT_APP_API}/api/password/update`, {
                oldPassword: passwords.oldPassword,
                password: passwords.newPassword // Make sure to use 'password' as expected by the backend
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
    
            setSuccess('Password updated successfully.');
            setError('');
            // Optionally, reset form fields or navigate
        } catch (error) {
            console.error('Error updating password:', error.response ? error.response.data : error.message);
            setError('Failed to update password.');
        }
    };
    
    

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <TitleCard title="Password Update" topMargin="mt-2">
                {/* Avatar */}
                <div className="flex items-center justify-center mb-6">
                    {user.avatar && (
                        <img
                            src={user.avatar}
                            alt="User Avatar"
                            className="rounded-full h-32 w-32 object-cover"
                        />
                    )}
                </div>

                {/* Profile Form */}
                

                {/* Password Change Form */}
                
                {/* <h2 className="text-xl mb-4">Change Password</h2> */}
                <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-4">
                        <label>Old Password</label>
                        <input
                            type="password"
                            name="oldPassword"
                            value={passwords.oldPassword}
                            onChange={updatePasswordValue}
                            className="input input-bordered w-full"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label>New Password</label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwords.newPassword}
                            onChange={updatePasswordValue}
                            className="input input-bordered w-full"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={updatePasswordValue}
                            className="input input-bordered w-full"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500">{error}</p>}
                    {success && <p className="text-green-500">{success}</p>}
                    <button type="submit" className="btn btn-primary float-right">Change Password</button>
                </form>
            </TitleCard>
        </>
    );
}

export default ProfileSettings;
