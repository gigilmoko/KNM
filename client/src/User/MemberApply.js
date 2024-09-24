import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import Subtitle from '../Layout/components/Typography/Subtitle'; // Import the Subtitle component
import { useNavigate } from "react-router-dom";
import { showNotification } from '../Layout/common/headerSlice';
import moment from 'moment'; // For date formatting if needed

function ApplyMember() {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize useNavigate
    const [user, setUser] = useState({ memberId: '', id: '', fname: '', lname: '', email: '' }); // Add additional fields
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch profile data on component mount
    useEffect(() => {
        const getProfile = async () => {
            const config = {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            };
            try {
                const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
                setUser({ 
                    memberId: data.user?.memberId || '', 
                    id: data.user?._id || '', 
                    fname: data.user?.fname || '', 
                    lname: data.user?.lname || '', 
                    email: data.user?.email || '' 
                });
                setLoading(false);
            } catch (error) {
                setError('Failed to load profile.');
                setLoading(false);
            }
        };

        getProfile();
    }, []);

    const updateFormValue = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({
            ...prevUser,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Construct the URL with the user ID
        const url = `${process.env.REACT_APP_API}/api/users/applying-for-member/${user.id}`;

        try {
            const response = await axios.put(url, { memberId: user.memberId }, { 
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                }
            });
            dispatch(showNotification({ message: "Applied", status: 1 }));
        } catch (error) {
            console.error('Error applying for membership:', error);
            setError('Error applying for membership.');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <l-quantum size="45" speed="1.75" color="black"></l-quantum> {/* Loading spinner */}
        </div>
    );

    if (error) return <p>{error}</p>;

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="card w-3/4 md:w-1/2 p-4 bg-base-100 shadow-md rounded-lg">
                <Subtitle styleClass="">
                    Apply as a Member
                </Subtitle>

                <div className="divider mt-2"></div>

                {/* Form Body */}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
                        {/* Display user info */}
                        <div>
                            <label className="font-semibold">Name:</label>
                            <p>{user.fname} {user.lname}</p>
                        </div>
                        <div>
                            <label className="font-semibold">Email:</label>
                            <p>{user.email}</p>
                        </div>

                        {/* Member ID */}
                        <div>
                            <label>Member ID</label>
                            <input
                                type="text"
                                name="memberId"
                                value={user.memberId}
                                onChange={updateFormValue}
                                className="input input-bordered w-full"
                            />
                        </div>
                    </div>

                    <div className="divider mt-4"></div>

                    <div className="flex justify-end">
                        <button type="submit" className="btn btn-primary">Apply</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ApplyMember;
