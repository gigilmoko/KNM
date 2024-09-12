import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/user.css';
import axios from 'axios';
import bg from '../../assets/img/bg-01.jpg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { getToken } from '../../utils/helpers';
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Initialize useNavigate

    const getProfile = async () => {
        const config = {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        };
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
            console.log(data); // Log the fetched data
            setUser(data.user);
            setLoading(false);
        } catch (error) {
            console.log(error);
            setError('Failed to load profile.');
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    return (
        <div className="limiter">
            <div
                className="container-login100"
                style={{ backgroundImage: `url(${bg})` }}
            >
                <div className="wrap-login100 p-l-55 p-r-55 p-t-65 p-b-54">
                    <form className="login100-form validate-form">
                        <span className="login100-form-title p-b-5">
                            Profile
                        </span>

                        <div className="register-input-container p-t-12">
                            <div className="avatar-container text-center p-b-10">
                                <img 
                                    src={user.avatar} 
                                    alt="Avatar Preview" 
                                    className="default-avatar" 
                                />
                            </div>
                            <span className="login200-form-title p-b-10">{user.fname} {user.middlei}. {user.lname}</span>

                            <div className="register-input-row dob-row p-t-30">
                                <div className="register-input-group dob">
                                    <span className="register-label-input">Date of Birth</span>
                                    <input
                                        className="register-input-field dob-field"
                                        type="date"
                                        value={user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="register-input-row email-row">
                                <div className="register-input-group email">
                                    <span className="register-label-input">Email</span>
                                    <input
                                        className="register-input-field email-field"
                                        type="email"
                                        value={user.email || ''}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="register-input-row phone-row  ">
                                <div className="register-input-group phone">
                                    <span className="register-label-input">Phone Number</span>
                                    <input
                                        className="register-input-field email-field"
                                        type="text"
                                        value={user.phone || ''}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="register-input-row address-row  p-t-25">
                                <div className="register-input-group address">
                                    <span className="register-label-input">Address</span>
                                    <input
                                        className="register-input-field email-field"
                                        type="text"
                                        value={user.address || ''}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="register-input-row memberId-row  p-t-25" >
                                <div className="register-input-group memberId">
                                    <span className="register-label-input">Member ID</span>
                                    <input
                                        className="register-input-field email-field"
                                        type="text"
                                        value={user.memberId || ''}
                                        readOnly
                                    />
                                </div>
                            </div>

                        </div>

                        <div className="container-login100-form-btn p-b-20">
                            <div className="wrap-login100-form-btn">
                                <div className="login100-form-bgbtn" />
                                  <button
                                    className="login100-form-btn"
                                    onClick={() => navigate('/profile/update')} // Redirect on click
                                >
                                    Edit Profile Info
                                </button>
                            </div>
                        </div>
                        <div className="container-login100-form-btn">
                            <div className="wrap-login100-form-btn">
                                <div className="login100-form-bgbtn" />
                                  <button
                                    className="login100-form-btn"
                                    onClick={() => navigate('/password/update')} // Redirect on click
                                >
                                   Change Password
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
