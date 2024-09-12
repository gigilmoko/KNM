import React, { useState, useEffect } from "react";
import axios from "axios";
import '../../assets/css/user.css';
import bg from '../../assets/img/bg-01.jpg';
import { getToken } from '../../utils/helpers';

const UpdateProfile = () => {
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [middlei, setMiddlei] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarImage, setAvatarImage] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [memberId, setMemberId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getProfile = async () => {
    const config = {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    };
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
      setFname(data.user.fname);
      setLname(data.user.lname);
      setMiddlei(data.user.middlei);
      setDateOfBirth(data.user.dateOfBirth.split('T')[0]); // Format date
      setEmail(data.user.email);
      setPassword(''); // Password should not be pre-filled
      setAvatarImage(data.user.avatar); // Set avatar image URL
      setPhone(data.user.phone || ''); // Set phone number
      setAddress(data.user.address || ''); // Set address
      setMemberId(data.user.memberId || ''); // Set memberId
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

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default'); // Replace with your upload preset

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
        console.log('Uploaded image URL:', imageUrl); // Log the uploaded image URL
        setAvatarImage(imageUrl);
      } catch (error) {
        console.error('Failed to upload avatar', error);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const profileData = { 
      fname, 
      lname, 
      middlei, 
      dateOfBirth, 
      email, 
      phone, 
      address, 
      memberId, 
      avatar: avatarImage // Make sure the updated avatarImage is included here
    };
    
    console.log('Profile data to be sent:', profileData); // Logging the data
    
    try {
      const response = await axios.put(`${process.env.REACT_APP_API}/api/me/update`, profileData, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      console.log('Update response:', response.data); // Log the response
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="limiter">
      <div
        className="container-login100"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="wrap-login100 p-l-55 p-r-55 p-t-65 p-b-54">
          <form className="login100-form" onSubmit={handleSubmit}>
            <span className="login100-form-title p-b-5">Update Profile</span>
            <span className="login200-form-title p-b-10">Edit your details below</span>

            <div className="register-input-container p-t-12">
              <div className="avatar-container text-center p-b-20">
                <img src={avatarImage} alt="Avatar Preview" className="default-avatar" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="avatar-input"
                />
              </div>

              <div className="register-input-row name-row">
                <div className="register-input-group first-name">
                  <span className="register-label-input">First Name</span>
                  <input
                    className="register-input-field name-field"
                    type="text"
                    placeholder="First Name"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                  />
                </div>
                <div className="register-input-group last-name">
                  <span className="register-label-input">Last Name</span>
                  <input
                    className="register-input-field name-field"
                    type="text"
                    placeholder="Last Name"
                    value={lname}
                    onChange={(e) => setLname(e.target.value)}
                  />
                </div>
                <div className="register-input-group middle-initial">
                  <span className="register-label-input">Middle Initial</span>
                  <input
                    className="register-input-middle-field"
                    type="text"
                    placeholder="MI"
                    maxLength="1"
                    value={middlei}
                    onChange={(e) => setMiddlei(e.target.value)}
                  />
                </div>
              </div>

              <div className="register-input-row dob-row p-t-30">
                <div className="register-input-group dob">
                  <span className="register-label-input">Date of Birth</span>
                  <input
                    className="register-input-field dob-field"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>

              <div className="register-input-row email-row">
                <div className="register-input-group email">
                  <span className="register-label-input">Email</span>
                  <input
                    className="register-input-field email-field"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="register-input-row email-row">
                <div className="register-input-group phone">
                  <span className="register-label-input">Phone Number</span>
                  <input
                    className="register-input-field email-field"
                    type="text"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="register-input-row email-row">
                <div className="register-input-group address">
                  <span className="register-label-input">Address</span>
                  <input
                    className="register-input-field email-field"
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

              <div className="register-input-row email-row">
                <div className="register-input-group memberId">
                  <span className="register-label-input">Member ID</span>
                  <input
                    className="register-input-field email-field"
                    type="text"
                    placeholder="Member ID"
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="container-login100-form-btn">
              <div className="wrap-login100-form-btn">
                <div className="login100-form-bgbtn" />
                <button className="login100-form-btn" type="submit">Save Changes</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
