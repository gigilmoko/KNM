import { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";
import Subtitle from '../Layout/components/Typography/Subtitle';
import { useNavigate } from "react-router-dom";
import { quantum } from 'ldrs';

quantum.register();

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    // Fetch profile data on component mount
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
            setLoading(false);
        } catch (error) {
            console.log(error);
            setError('Failed to load profile.');
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <l-quantum size="45" speed="1.75" color="black"></l-quantum>
        </div>
    ); // Show loading spinner

    if (error) return <p>{error}</p>;

    const handleEditClick = () => {
        navigate('/profile/edit'); // Redirect to settings profile
    };

    const handleApplyMemberClick = () => {
        navigate('/profile/apply'); // Redirect to apply member
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="card w-3/4 md:w-1/2 p-4 bg-base-100 shadow-md rounded-lg">
                {/* Title for Card */}
                <Subtitle styleClass="">
                    Profile Information
                </Subtitle>

                <div className="divider mt-2"></div>

                {/* Card Body */}
                <div className='h-full w-full pb-4 bg-base-100'>
                    {/* Avatar */}
                    <div className="flex items-center justify-center mb-4">
                        {user.avatar && (
                            <img
                                src={user.avatar}
                                alt="User Avatar"
                                className="rounded-full h-24 w-24 object-cover"
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                            <label className="font-semibold">Name:</label>
                            <p>
                                {user.fname} {user.middlei && `${user.middlei} `}{user.lname}
                            </p>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="font-semibold">Email:</label>
                            <p>{user.email}</p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="font-semibold">Phone:</label>
                            <p>{user.phone}</p>
                        </div>

                        {/* Member ID */}
                        <div>
                            <label className="font-semibold">Member ID:</label>
                            <p>{user.memberId ? user.memberId : 'Not a member'}</p>
                        </div>

                        {/* Address */}
                        <div className="md:col-span-1">
                            <label className="font-semibold">Address:</label>
                            <p>{user.address}</p>
                        </div>

                        {/* Date of Birth */}
                        <div className="md:col-span-1">
                            <label className="font-semibold">Date of Birth:</label>
                            <p>{user.dateOfBirth ? moment(user.dateOfBirth).format('YYYY-MM-DD') : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="divider mt-4"></div>
                    <div className="flex justify-end gap-4">
                        {/* {user.role === 'user' && (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleApplyMemberClick} // Attach the click handler
                            >
                                Apply as Member
                            </button>
                        )} */}

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleEditClick} // Attach the click handler
                        >
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
