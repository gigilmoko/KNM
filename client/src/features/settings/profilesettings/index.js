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
            console.log(data);
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        const profileData = { 
            fname: user.fname, 
            lname: user.lname, 
            middlei: user.middlei, 
            dateOfBirth: user.dateOfBirth, 
            email: user.email, 
            phone: user.phone, 
            address: user.address, 
            memberId: user.memberId, 
            avatar: user.avatar // Include avatar if it's updated
        };
        
        console.log('Profile data to be sent:', profileData); // Logging the data
        
        try {
            const response = await axios.put(`${process.env.REACT_APP_API}/api/me/update`, profileData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Update response:', response.data); // Log the response
            dispatch(showNotification({ message: "Profile Updated", status: 1 }));
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <TitleCard title="Profile Settings" topMargin="mt-2">
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

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div>
                            <label>First Name</label>
                            <input
                                type="text"
                                name="fname"
                                value={user.fname}
                                onChange={updateFormValue}
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* Last Name */}
                        <div>
                            <label>Last Name</label>
                            <input
                                type="text"
                                name="lname"
                                value={user.lname}
                                onChange={updateFormValue}
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* Middle Initial */}
                        <div>
                            <label>Middle Initial</label>
                            <input
                                type="text"
                                name="middlei"
                                value={user.middlei}
                                onChange={updateFormValue}
                                className="input input-bordered w-full"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={user.email}
                                onChange={updateFormValue}
                                className="input input-bordered w-full"
                                readOnly={user.googleLogin}
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label>Phone</label>
                            <input
                                type="text"
                                name="phone"
                                value={user.phone}
                                onChange={updateFormValue}
                                className="input input-bordered w-full"
                            />
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

                        {/* Address and Date of Birth in the same row */}
                        <div className="md:col-span-1">
                            <label>Address</label>
                            <textarea
                                name="address"
                                value={user.address}
                                onChange={updateFormValue}
                                className="textarea textarea-bordered w-full"
                            ></textarea>
                        </div>

                        <div className="md:col-span-1">
                            <label>Date of Birth</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={user.dateOfBirth ? moment(user.dateOfBirth).format('YYYY-MM-DD') : ''}
                                onChange={updateFormValue}
                                className="input input-bordered w-full"
                            />
                        </div>
                    </div>

                    <div className="divider"></div>

                    <div className="mt-16">
                        <button type="submit" className="btn btn-primary float-right">Update</button>
                    </div>
                </form>
            </TitleCard>
        </>
    );
}

export default ProfileSettings;
