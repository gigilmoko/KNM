import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../assets/css/user.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import bg from '../../assets/img/bglogin.jpg';
import { authenticate } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import logo from '../../assets/img/logo.png';
import googlelogo from '../../assets/img/googlelogo.png';
import { GoogleLogin } from 'react-google-login';

const clientId = "503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com"; // Replace with your actual client ID

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : '';

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const login = async (email, password) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
  
      console.log('Sending data to API:', { email, password });
  
      const { data } = await axios.post(
        `${process.env.REACT_APP_API}/api/login`,
        { email, password },
        config
      );
  
      console.log('Response data:', data);
  
      if (data.user && data.user.memberId === '1') {
        authenticate(data, () => navigate("/admin/dashboard"));
      } else {
        authenticate(data, () => navigate("/profile"));
      }
    } catch (error) {
      if (error.response) {
        console.log("Error status:", error.response.status);
        console.log("Error data:", error.response.data);
      } else if (error.request) {
        console.log("No response received:", error.request);
      } else {
        console.log("Error:", error.message);
      }
    }
  };
  
  const handleGoogleSuccess = async (response) => {
    try {
      const { profileObj } = response;
      const { email } = profileObj;
  
      const { data } = await axios.post(
        `${process.env.REACT_APP_API}/api/google-login`,
        { email }
      );
  
      if (data.user && data.user.memberId === '1') {
        authenticate(data, () => navigate("/admin/dashboard"));
      } else {
        authenticate(data, () => navigate("/profile"));
      }
    } catch (error) {
      if (error.response) {
        console.log("Error status:", error.response.status);
        console.log("Error data:", error.response.data);
      } else if (error.request) {
        console.log("No response received:", error.request);
      } else {
        console.log("Error:", error.message);
      }
    }
  };
  

  const handleGoogleFailure = (error) => {
    console.error("Google login failed:", error);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    console.log('Form data:', { email, password });
    login(email, password);
  };

  return (
    <>
      <div className="limiter">
        <div className="container-login100" style={{ backgroundImage: `url(${bg})` }}>
          <div className="wrap-login100 p-l-55 p-r-55 p-t-65 p-b-54">
            <form className="login100-form validate-form" onSubmit={submitHandler}>
              <div className="form-image-container">
                <img src={logo} alt="Logo" className="form-image" />
              </div>
              <span className="login100-form-title p-b-30">Log In to KBituin</span>
              
              <div className="wrap-input100 validate-input m-b-23">
                <span className="label-input100">Email</span>
                <input
                  className="input100"
                  type="email"
                  name="username"
                  placeholder="Input your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <FontAwesomeIcon icon={faUser} className="input-icon" />
              </div>

              <div className="wrap-input100 validate-input p-t-15">
                <span className="label-input1001">Password</span>
                <input
                  className="input100"
                  type="password"
                  name="pass"
                  placeholder="Input your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <FontAwesomeIcon icon={faLock} className="input-icon" />
              </div>

              <div className="text-right p-t-5 p-b-31">
                <Link to="/forgotpassword">Forgot password?</Link>
              </div>

              <div className="container-login100-form-btn">
                <div className="wrap-login100-form-btn">
                  <div className="login100-form-bgbtn" />
                  <button className="login100-form-btn">Login</button>
                </div>
              </div>

              <div className="container-login100-form-btn p-t-13">
                <div className="wrap-login100-form-btn">
                  <div className="login100-form-bgbtn1" />
                  <GoogleLogin
  clientId={clientId}
  buttonText="Login with Google"
  onSuccess={handleGoogleSuccess}
  onFailure={handleGoogleFailure}
  cookiePolicy={'single_host_origin'}
  render={(renderProps) => (
    <button
      className="login100-form-btn1"
      onClick={renderProps.onClick}
      disabled={renderProps.disabled}
    >
      <img src={googlelogo} alt="Google Logo" className="form-image1" />
      <span className="social-text">Login with Google</span>
    </button>
  )}
/>

                </div>
              </div>

              <div className="flex-col-c p-t-20">
                <span className="txt1 p-b-17">
                  Don't have an account yet?{" "}
                  <Link to="/register" className="txt2">Sign Up</Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
