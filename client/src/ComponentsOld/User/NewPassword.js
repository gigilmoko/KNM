import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/user.css';
import bg from '../../assets/img/bg-01.jpg';
import { Link } from 'react-router-dom';

const NewPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { token } = useParams();

  const resetPassword = async (token, passwords) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      const { data } = await axios.put(
        `${process.env.REACT_APP_API}/api/password/reset/${token}`,
        passwords,
        config
      );
      setSuccess(data.success);
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error.response?.data?.message || 'An error occurred while resetting password.');
    }
  };

  useEffect(() => {
    if (success) {
      // Optional: display a success message (e.g., using toast)
      navigate('/login');
    }
  }, [success, navigate]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    resetPassword(token, { password, confirmPassword });
  };

  return (
    <div className="limiter">
      <div
        className="container-login100"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="wrap-login100 p-l-55 p-r-55 p-t-65 p-b-54">
          <form
            className="login100-form validate-form"
            onSubmit={submitHandler}
          >
            <span className="login100-form-title p-b-5">
              Retrieve your account!
            </span>
            <span className="login200-form-title p-b-50">
              Enter your new passwords
            </span>

            <div className="register-input-container p-t-12">
              <div className="register-input-row email-row">
                <div className="register-input-group email">
                  <span className="register-label-input">New Password</span>
                  <input
                    className="register-input-field email-field"
                    type="password"
                    placeholder="Input new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="register-input-container p-t-12">
              <div className="register-input-row email-row">
                <div className="register-input-group email">
                  <span className="register-label-input">Confirm Password</span>
                  <input
                    className="register-input-field email-field"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message" style={{ color: 'red', marginTop: '20px' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="success-message" style={{ color: 'green', marginTop: '20px' }}>
                {success}
              </div>
            )}

            <div className="container-login100-form-btn m-t-20">
              <div className="wrap-login100-form-btn">
                <div className="login100-form-bgbtn" />
                <button
                  className="login100-form-btn"
                  type="submit"
                >
                  Reset Password
                </button>
              </div>
            </div>

            <div className="flex-col-c p-t-40">
              <span className="txt1 p-b-17">
                Remembered your password?{' '}
                <Link to="/login" className="txt2">
                  Log In
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPassword;
