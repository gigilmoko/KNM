import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';
import LandingIntro from './LandingIntro';
import ErrorText from '../Layout/components/Typography/ErrorText';
import googlelogo from '../assets/img/googlelogo.png';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

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
   
    googleLogin: false,
    avatar: '',
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registerObj, setRegisterObj] = useState(INITIAL_REGISTER_OBJ);
  const [avatarImage, setAvatarImage] = useState('');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isMember, setIsMember] = useState(null);
  const [memberId, setMemberId] = useState('');
  const navigate = useNavigate(); // useNavigate hook for navigation

  const submitForm = async (e) => {
    e.preventDefault();
  
    // Validation
    const nameRegex = /^[A-Za-z\s]+$/; 
    const middleInitialRegex = /^[A-Z]$/; // Only a single uppercase letter
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email format
    const phoneRegex = /^\d{11}$/; // 11-digit number
  
    const capitalizeFirstLetter = (text) => {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };
    
    // Apply capitalization before validation and submission
    if (registerObj.fname.trim() === '') return toast.error('First Name is required!');
    registerObj.fname = capitalizeFirstLetter(registerObj.fname.trim());
    if (!nameRegex.test(registerObj.fname)) return toast.error('First Name must only contain letters!');
    
    if (registerObj.lname.trim() === '') return toast.error('Last Name is required!');
    registerObj.lname = capitalizeFirstLetter(registerObj.lname.trim());
    if (!nameRegex.test(registerObj.lname)) return toast.error('Last Name must only contain letters!');
    
    if (registerObj.middlei.trim() === '') return toast.error('Middle Initial is required!');
    registerObj.middlei = capitalizeFirstLetter(registerObj.middlei.trim()); // For middle initial
    if (!middleInitialRegex.test(registerObj.middlei)) return toast.error('Middle Initial must be a single letter!');
    
    if (registerObj.email.trim() === '') return toast.error('Email is required!');
    if (!emailRegex.test(registerObj.email.trim())) return toast.error('Email Id must be valid!');
    
    if (registerObj.password.trim() === '' && !registerObj.googleLogin) return toast.error('Password is required!');
    if (registerObj.password.trim().length < 8 && !registerObj.googleLogin) return toast.error('Password must be at least 8 characters long!');
    
    if (registerObj.dateOfBirth.trim() === '') return toast.error('Date of Birth is required!');
    
    if (registerObj.phone.trim() === '') return toast.error('Phone number is required!');
    if (!phoneRegex.test(registerObj.phone.trim())) return toast.error('Phone number must be exactly 11 digits!');
    

    // Open the member modal
    setIsMemberModalOpen(true);
  };

  const handleMemberChoice = async (choice) => {
    setIsMember(choice);
    setIsMemberModalOpen(false);

    if (choice) {
      // Open the member ID modal
      setIsMemberModalOpen(true);
    } else {
      // Proceed with normal registration
      await registerUser();
    }
  };

  const handleMemberIdSubmit = async () => {
    if (memberId.trim() === '') {
      return toast.error('Member ID is required!');
    }

    // Proceed with member registration
    await registerUserMember();
  };

  const registerUser = async () => {
    setLoading(true);
  
    try {
      const updatedRegisterObj = {
        ...registerObj,
        role: 'user', // Default role is 'user'
      };
    
      console.log("Form values:", updatedRegisterObj);
    
      // Send form data to server
      const response = await axios.post(
        `${process.env.REACT_APP_API}api/register`,
        updatedRegisterObj,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    
      console.log("User registered successfully", response.data);
      
      // Display success toast notification
      toast.success("User registered successfully!");
  
      // Add a delay before navigating to the login page
      setTimeout(() => {
        navigate("/login");
      }, 3000); // 3 seconds delay
    } catch (error) {
      console.error("Registration failed", error);
    
      // Handle different error types
      if (error.response) {
        const errorMsg = error.response.data.message || 'Registration failed. Please try again.';
        toast.error(errorMsg); // Display error toast notification
      } else if (error.request) {
        toast.error('Network error. Please try again later.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const registerUserMember = async () => {
    setLoading(true);
  
    try {
      const updatedRegisterObj = {
        ...registerObj,
        memberId, // Include memberId for member registration
      };
    
      console.log("Form values:", updatedRegisterObj);
    
      // Send form data to server
      const response = await axios.post(
        `${process.env.REACT_APP_API}api/register-member`,
        updatedRegisterObj,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    
      console.log("User registered successfully", response.data);
      
      // Display success toast notification
      toast.success("User registered successfully!");
  
      // Add a delay before navigating to the login page
      setTimeout(() => {
        navigate("/login");
      }, 3000); // 3 seconds delay
    } catch (error) {
      console.error("Registration failed", error);
    
      // Handle different error types
      if (error.response) {
        const errorMsg = error.response.data.message || 'Registration failed. Please try again.';
        toast.error(errorMsg); // Display error toast notification
      } else if (error.request) {
        toast.error('Network error. Please try again later.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
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

            toast.success("Avatar uploaded successfully!"); // Success notification
        } catch (error) {
            console.error('Failed to upload avatar', error);
            setErrorMessage('Failed to upload avatar. Please try again.');
            toast.error('Failed to upload avatar. Please try again.'); // Error notification
        }
    }
};

  return (
    <div className="min-h-screen bg-base-200 flex items-center">
     <ToastContainer/>
      <div className="card mx-auto w-full max-w-5xl shadow-xl">
        <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
          <div>
            <LandingIntro />
          </div>
          <div className="py-10 px-10">
            <h2 className="text-2xl font-semibold mb-2 text-center">Register as User</h2>
            <form onSubmit={submitForm}>
              <div className="mb-4">
                {/* Avatar Upload and Preview */}
                <div className="flex justify-center items-center mb-4">
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

                <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>

                <button type="submit" className="btn mt-2 w-full btn-primary">
                  Register
                </button>


                {/* Google Registration Button - styled like the one in the login form */}
                <div className="container-login100-form-btn p-t-13">
                  <div className="wrap-login100-form-btn">
                    <div className="login100-form-bgbtn1" />
                    <GoogleLogin
                      clientId={clientId}
                      buttonText="Login with Google"
                      onSuccess={handleGoogleSuccess}
                      onFailure={handleGoogleFailure}
                      cookiePolicy={'single_host_origin'}
                      render={renderProps => (
                        <button
                          onClick={renderProps.onClick}
                          disabled={renderProps.disabled}
                          className="btn w-full flex items-center justify-center border mt-4"
                        >
                          <img src={googlelogo} alt="Google logo" className="w-5 h-5 mr-2" />
                          Register with Google
                        </button>
                      )}
                    />
                  </div>
                </div>
              </div>
            </form>
            <div className="text-center mt-4">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="text-primary">
                  Login Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Member Modal */}
      {isMemberModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-semibold">Are you a member of KNM?</h3>
            <div className="modal-action">
              <button className="btn btn-primary" onClick={() => handleMemberChoice(true)}>Yes</button>
              <button className="btn" onClick={() => handleMemberChoice(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Member ID Modal */}
      {isMember && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="text-lg font-semibold">Enter your Member ID</h3>
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="input input-bordered w-full mt-4"
              placeholder="Member ID"
            />
            <div className="modal-action">
              <button className="btn btn-primary" onClick={handleMemberIdSubmit}>Submit</button>
              <button className="btn" onClick={() => setIsMember(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;
