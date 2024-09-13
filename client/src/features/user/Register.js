import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';
import LandingIntro from './LandingIntro';
import ErrorText from '../../components/Typography/ErrorText';
import googlelogo from '../../assets/img/googlelogo.png';
import axios from 'axios';

const clientId = "503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com";

function Register() {
  const INITIAL_REGISTER_OBJ = {
    fname: '',
    lname: '',
    middlei: '',
    email: '',
    password: '',
    dateOfBirth: '',
    phone: '',
    memberId: '',
    address: '',
    googleLogin: false,
    avatar: '',
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registerObj, setRegisterObj] = useState(INITIAL_REGISTER_OBJ);
  const [avatarImage, setAvatarImage] = useState('');
  const navigate = useNavigate(); // useNavigate hook for navigation

  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMessage('');
  
    // Validation
    if (registerObj.fname.trim() === '') return setErrorMessage('First Name is required!');
    if (registerObj.lname.trim() === '') return setErrorMessage('Last Name is required!');
    if (registerObj.middlei.trim() === '') return setErrorMessage('Middle Initial is required!');
    if (registerObj.email.trim() === '') return setErrorMessage('Email Id is required!');
    if (registerObj.password.trim() === '' && !registerObj.googleLogin) return setErrorMessage('Password is required!');
    if (registerObj.dateOfBirth.trim() === '') return setErrorMessage('Date of Birth is required!');
    if (registerObj.phone.trim() === '') return setErrorMessage('Phone number is required!');
    if (registerObj.address.trim() === '') return setErrorMessage('Address is required!');
  
    setLoading(true);
  
    try {
      // Determine user role based on memberId
      const userRole = registerObj.memberId.trim() === '' ? 'user' : 'member';
  
      // Update the registerObj with the role
      const updatedRegisterObj = {
        ...registerObj,
        role: userRole,
      };
  
      console.log("Form values:", updatedRegisterObj);
  
      // Send form data to server
      const response = await axios.post("http://localhost:4001/api/register", updatedRegisterObj, {
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      console.log("User registered successfully", response.data);
      navigate("/login");
    } catch (error) {
      console.error("Registration failed", error);
  
      // Handle different error types
      if (error.response) {
        const errorMsg = error.response.data.message || 'Registration failed. Please try again.';
        setErrorMessage(errorMsg);
      } else if (error.request) {
        setErrorMessage('Network error. Please try again later.');
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  

  const updateFormValue = (e) => {
    const { name, value } = e.target;
    setErrorMessage('');
    setRegisterObj({ ...registerObj, [name]: value });
  };

  const handleGoogleSuccess = (res) => {
    const { profileObj } = res;

    console.log("Google Login Success! User: ", profileObj);

    // Update form values with Google login data
    setRegisterObj(prev => ({
      ...prev,
      fname: profileObj.givenName,
      lname: profileObj.familyName,
      email: profileObj.email,
      googleLogin: true,
      avatar: profileObj.imageUrl
    }));

    // Update avatar preview
    setAvatarImage(profileObj.imageUrl);
  };

  const handleGoogleFailure = (res) => {
    console.log("Google Login Failed! ", res);
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
        setAvatarImage(imageUrl); // Update avatar image preview
        setRegisterObj(prev => ({ ...prev, avatar: imageUrl }));
      } catch (error) {
        console.error('Failed to upload avatar', error);
        setErrorMessage('Failed to upload avatar. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-5xl shadow-xl">
        <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
          <div>
            <LandingIntro />
          </div>
          <div className="py-10 px-10">
            <h2 className="text-2xl font-semibold mb-2 text-center">Register</h2>
            <form onSubmit={submitForm}>
              <div className="mb-4">
                {/* Avatar Upload and Preview */}
<<<<<<< Updated upstream
                <div className="flex justify-center items-center mb-4">
  <label htmlFor="avatar-upload" className="cursor-pointer flex justify-center items-center">
    <img
      src={avatarImage || 'https://via.placeholder.com/150'} // Default placeholder image
      alt="Avatar"
      className="w-32 h-32 rounded-full object-cover"
    />
    <input
      id="avatar-upload"
      type="file"
      accept="image/*"
      onChange={handleAvatarChange}
      className="hidden"
    />
  </label>
</div>

=======
                <div className="flex items-center mb-4">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <img
                      src={avatarImage || 'https://via.placeholder.com/150'} // Default placeholder image
                      alt="Avatar"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
>>>>>>> Stashed changes

                {/* Name and Middle Initial */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="fname"
                    value={registerObj.fname}
                    onChange={updateFormValue}
                    placeholder="First Name"
                    className="input input-bordered w-full"
                  />
                  <input
                    type="text"
                    name="lname"
                    value={registerObj.lname}
                    onChange={updateFormValue}
                    placeholder="Last Name"
                    className="input input-bordered w-full"
                  />
                  <input
                    type="text"
                    name="middlei"
                    value={registerObj.middlei}
                    onChange={updateFormValue}
                    placeholder="Middle Initial"
                    className="input input-bordered w-full"
                  />
                </div>

                {/* Email and Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <input
                    type="email"
                    name="email"
                    value={registerObj.email}
                    onChange={updateFormValue}
                    placeholder="Email Id"
                    className="input input-bordered w-full"
                    readOnly={registerObj.googleLogin} // Make email readonly if registered with Google
                  />
                  <input
                    type="password"
                    name="password"
                    value={registerObj.password}
                    onChange={updateFormValue}
                    placeholder="Password"
                    className="input input-bordered w-full"
                    // disabled={registerObj.googleLogin} // Disable password field if registered with Google
                  />
                </div>

                {/* Date of Birth and Phone Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={registerObj.dateOfBirth}
                    onChange={updateFormValue}
                    className="input input-bordered w-full"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={registerObj.phone}
                    onChange={updateFormValue}
                    placeholder="Phone Number"
                    className="input input-bordered w-full"
                  />
                </div>

                {/* Member ID and Address */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <input
                    type="text"
                    name="memberId"
                    value={registerObj.memberId}
                    onChange={updateFormValue}
                    placeholder="Member ID"
                    className="input input-bordered w-full"
                  />
                  <input
                    type="text"
                    name="address"
                    value={registerObj.address}
                    onChange={updateFormValue}
                    placeholder="Address"
                    className="input input-bordered w-full"
                  />
                </div>

                <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>

                <button type="submit" className={"btn mt-2 w-full btn-primary" + (loading ? " loading" : "")}>
                  Register
                </button>

                {/* Google Registration Button - styled like the one in the login form */}
                <div className="container-login100-form-btn p-t-13">
                  <div className="wrap-login100-form-btn">
                    <div className="login100-form-bgbtn1" />
                    <GoogleLogin
                      clientId={clientId}
                      buttonText="Register with Google"
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
                          <span className="social-text">Register with Google</span>
                        </button>
                      )}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  Already have an account? <Link to="/login" className="text-primary">Login</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
