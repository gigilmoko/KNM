import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import moment from "moment";
import { showNotification } from '../Layout/common/headerSlice';
import TitleCard from "../Layout/components/Cards/TitleCard"; 
import Subtitle from '../Layout/components/Typography/Subtitle';
import { useNavigate } from 'react-router-dom';

function ProfileUpdate() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [user, setUser] = useState({
        fname: '',
        lname: '',
        middlei: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        avatar: '',
        googleLogin: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    const nameRegex = /^[A-Za-z\s]+$/;
    const middleInitialRegex = /^[A-Z]$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{11}$/;

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
            setUser(data.user || {});
            setLoading(false);
        } catch (error) {
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

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'ml_default'); // Replace with your Cloudinary upload preset

            try {
                const response = await axios.post(
                    'https://api.cloudinary.com/v1_1/dglawxazg/image/upload', // Replace with your Cloudinary URL
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                const imageUrl = response.data.secure_url;
                setUser((prevUser) => ({ ...prevUser, avatar: imageUrl })); // Update avatar image preview
            } catch (error) {
                console.error('Failed to upload avatar', error);
                setError('Failed to upload avatar. Please try again.');
            }
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!nameRegex.test(user.fname)) {
            errors.fname = "First name must contain only letters and spaces.";
        }
        if (!nameRegex.test(user.lname)) {
            errors.lname = "Last name must contain only letters and spaces.";
        }
        if (user.middlei && !middleInitialRegex.test(user.middlei)) {
            errors.middlei = "Middle initial must be a single uppercase letter.";
        }
        if (!emailRegex.test(user.email)) {
            errors.email = "Please enter a valid email address.";
        }
        if (!phoneRegex.test(user.phone)) {
            errors.phone = "Phone number must be an 11-digit number.";
        }

        return errors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        const profileData = { 
            fname: user.fname, 
            lname: user.lname, 
            middlei: user.middlei, 
            dateOfBirth: user.dateOfBirth, 
            email: user.email, 
            phone: user.phone, 
            address: user.address, 
            avatar: user.avatar
        };

        try {
            await axios.put(`${process.env.REACT_APP_API}/api/me/update`, profileData, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            dispatch(showNotification({ message: "Profile Updated", status: 1 }));
            navigate('/profile');
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="card w-3/4 md:w-1/2 p-4 bg-base-100 shadow-md rounded-lg">
                <Subtitle>
                    Profile Information
                </Subtitle>

                <div className="divider mt-2"></div>

                <div className='h-full w-full pb-4 bg-base-100'>
                    <div className="flex items-center justify-center mb-4">
                        <label htmlFor="avatar-upload" className="cursor-pointer">
                            {user.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt="User Avatar"
                                    className="rounded-full h-24 w-24 object-cover"
                                />
                            ) : (
                                <div className="rounded-full h-24 w-24 bg-gray-200 flex items-center justify-center">
                                    <span>No Image</span>
                                </div>
                            )}
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold">First Name:</label>
                                <input
                                    type="text"
                                    name="fname"
                                    value={user.fname}
                                    onChange={updateFormValue}
                                    className="input input-bordered w-full"
                                />
                                {validationErrors.fname && <p className="text-red-500 text-sm">{validationErrors.fname}</p>}
                            </div>

                            <div>
                                <label className="font-semibold">Last Name:</label>
                                <input
                                    type="text"
                                    name="lname"
                                    value={user.lname}
                                    onChange={updateFormValue}
                                    className="input input-bordered w-full"
                                />
                                {validationErrors.lname && <p className="text-red-500 text-sm">{validationErrors.lname}</p>}
                            </div>

                            <div>
                                <label className="font-semibold">Middle Initial:</label>
                                <input
                                    type="text"
                                    name="middlei"
                                    value={user.middlei}
                                    onChange={updateFormValue}
                                    className="input input-bordered w-full"
                                />
                                {validationErrors.middlei && <p className="text-red-500 text-sm">{validationErrors.middlei}</p>}
                            </div>

                            <div>
                                <label className="font-semibold">Email:</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={user.email}
                                    onChange={updateFormValue}
                                    className="input input-bordered w-full"
                                    readOnly={user.googleLogin}
                                />
                                {validationErrors.email && <p className="text-red-500 text-sm">{validationErrors.email}</p>}
                            </div>

                            <div>
                                <label className="font-semibold">Phone:</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={user.phone}
                                    onChange={updateFormValue}
                                    className="input input-bordered w-full"
                                />
                                {validationErrors.phone && <p className="text-red-500 text-sm">{validationErrors.phone}</p>}
                            </div>

                            <div>
                                <label className="font-semibold">Date of Birth:</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={user.dateOfBirth ? moment(user.dateOfBirth).format('YYYY-MM-DD') : ''}
                                    onChange={updateFormValue}
                                    className="input input-bordered w-full"
                                />
                            </div>

                            <div className="w-full">
                                <label className="font-semibold">Address:</label>
                                <textarea
                                    name="address"
                                    value={user.address}
                                    onChange={updateFormValue}
                                    className="textarea textarea-bordered w-full"
                                ></textarea>
                            </div>
                        </div>

                        <div className="divider mt-4"></div>

                       
                           


                        <div className="flex justify-end gap-4">
                            <button type="submit" className="btn btn-primary">
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ProfileUpdate;
