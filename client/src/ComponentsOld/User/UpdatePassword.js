import React, { useState } from "react";
import axios from "axios";
import '../../assets/css/user.css';
import { useNavigate } from "react-router-dom";
import bg from '../../assets/img/bg-01.jpg';
import { getToken } from '../../utils/helpers';

const UpdatePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      console.log('Password mismatch:', { newPassword, confirmPassword });
      return;
    }
  
    try {
      const response = await axios.put(`${process.env.REACT_APP_API}/api/password/update`, {
        oldPassword,
        password: newPassword
      }, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
  
      console.log('Password update response data:', response.data); // Log the response data
      setSuccess('Password updated successfully.');
      setError('');
      // Optionally, navigate to another page or reset the form
      navigate('/profile');
    } catch (error) {
      console.error('Error updating password:', error.response ? error.response.data : error.message); // Log the error data
      setError('Failed to update password.');
    }
  }
  

  return (
    <div className="limiter">
      <div
        className="container-login100"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="wrap-login100 p-l-55 p-r-55 p-t-65 p-b-54">
          <form className="login100-form" onSubmit={handleSubmit}>
            <span className="login100-form-title p-b-5">Change Password</span>
            <span className="login200-form-title p-b-10">Input your credentials</span>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="register-input-container p-t-12">
              <div className="register-input-row password-row p-t-10">
                <div className="register-input-group password">
                  <span className="register-label-input">Old Password</span>
                  <input
                    className="register-input-field password-field"
                    type="password"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="register-input-row password-row p-t-10">
                <div className="register-input-group password">
                  <span className="register-label-input">New Password</span>
                  <input
                    className="register-input-field password-field"
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="register-input-row password-row p-t-10">
                <div className="register-input-group password">
                  <span className="register-label-input">Confirm Password</span>
                  <input
                    className="register-input-field password-field"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

export default UpdatePassword;
