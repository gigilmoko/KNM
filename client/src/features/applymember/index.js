import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import TitleCard from "../../components/Cards/TitleCard";
import { showNotification } from "../common/headerSlice";

function ApplyMember() {
    const dispatch = useDispatch();
    const [user, setUser] = useState({ memberId: '', id: '' });
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
                setUser({ memberId: data.user?.memberId || '', id: data.user?._id || '' });
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
            const response = await axios.put(url, { memberId: user.memberId }, { // Include memberId in request body
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

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <TitleCard title="Apply as a Member" topMargin="mt-2">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6">
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

                    <div className="divider"></div>

                    <div className="mt-16">
                        <button type="submit" className="btn btn-primary float-right">Apply</button>
                    </div>
                </form>
            </TitleCard>
        </>
    );
}

export default ApplyMember;
