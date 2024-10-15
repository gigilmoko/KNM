import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';
import LandingIntro from './LandingIntro';
import ErrorText from '../Layout/components/Typography/ErrorText';
import googlelogo from '../assets/img/googlelogo.png';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify'; // Importing toast

const clientId = "503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com";

function RegisterMember() {
  const INITIAL_REGISTER_OBJ = {
    fname: '',
    lname: '',
    middlei: '',
    email: '',
    password: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    googleLogin: false,
    avatar: '',
    memberId: '',
    imageMember: '', // Additional image field
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [registerObj, setRegisterObj] = useState(INITIAL_REGISTER_OBJ);
  const [avatarImage, setAvatarImage] = useState('');
  const [imageMember, setImageMember] = useState('');
  const navigate = useNavigate(); // useNavigate hook for navigation

  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    const capitalizeFirstLetter = (text) => {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };
    
    const nameRegex = /^[A-Za-z\s]+$/; 
    const middleInitialRegex = /^[A-Z]$/; // Only a single uppercase letter
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email format
    const phoneRegex = /^\d{11}$/; // 11-digit number
    
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
    
    if (registerObj.address.trim() === '') return toast.error('Address is required!');
    registerObj.address = capitalizeFirstLetter(registerObj.address.trim());

    setLoading(true);

    try {
        const updatedRegisterObj = {
            ...registerObj,
            role: 'user', // Default role is 'user'
        };

        console.log("Form values:", updatedRegisterObj);

        // Send form data to server
        const response = await axios.post(
            `${process.env.REACT_APP_API}/api/register-member`,
            updatedRegisterObj,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("User registered successfully", response.data);
        toast.success("Registration successful!"); // Success notification
        navigate("/login");
    } catch (error) {
        console.error("Registration failed", error);

        // Handle different error types
        if (error.response) {
            const errorMsg = error.response.data.message || 'Registration failed. Please try again.';
            setErrorMessage(errorMsg);
            toast.error(errorMsg); // Error notification
        } else if (error.request) {
            setErrorMessage('Network error. Please try again later.');
            toast.error('Network error. Please try again later.'); // Error notification
        } else {
            setErrorMessage('An unexpected error occurred. Please try again.');
            toast.error('An unexpected error occurred. Please try again.'); // Error notification
        }
    } finally {
        setLoading(false);
    }
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
    toast.success("Google login successful!"); // Success notification
};

const handleGoogleFailure = (res) => {
    console.log("Google Login Failed! ", res);
    toast.error("Google login failed. Please try again."); // Error notification
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

const handleImageMemberChange = async (e) => {
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
            setImageMember(imageUrl); // Update member image preview
            setRegisterObj(prev => ({ ...prev, imageMember: imageUrl }));
            toast.success("Member image uploaded successfully!"); // Success notification
        } catch (error) {
            console.error('Failed to upload member image', error);
            setErrorMessage('Failed to upload member image. Please try again.');
            toast.error('Failed to upload member image. Please try again.'); // Error notification
        }
    }
};

  const updateFormValue = (e) => {
    const { name, value } = e.target;
    setErrorMessage('');
    setRegisterObj({ ...registerObj, [name]: value });
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
            <h2 className="text-2xl font-semibold mb-2 text-center">Register as Member</h2>
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

                {/* Member Image Upload and Preview */}
                


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

                {/* Member ID */}
                <div className="grid grid-cols-2 gap-4 mt-4">
  <input
    type="text"
    name="memberId"
    value={registerObj.memberId}
    onChange={updateFormValue}
    placeholder="Member ID"
    className="input input-bordered w-full"
  />
  
  <input
    type="date"
    name="dateOfBirth"
    value={registerObj.dateOfBirth}
    onChange={updateFormValue}
    placeholder="Date of Birth"
    className="input input-bordered w-full"
  />
</div>

                {/* Email */}
                <div className="grid grid-cols-2 gap-4 mt-4">
  <input
    type="email"
    name="email"
    value={registerObj.email}
    onChange={updateFormValue}
    placeholder="Email"
    className="input input-bordered w-full"
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

                {/* Phone */}
                <div className="grid grid-cols-2 gap-4 mt-4 mb-4">
  <input
    type="tel"
    name="phone"
    value={registerObj.phone}
    onChange={updateFormValue}
    placeholder="Phone Number"
    className="input input-bordered w-full"
  />
  
  <input
    name="address"
    value={registerObj.address}
    onChange={updateFormValue}
    placeholder="Address"
    className="textarea textarea-bordered w-full"
  />
</div>

<h2 className="text-xl font-semibold  text-center">Input here your ID</h2>
<div className="flex justify-center items-center mt-4">
  <label htmlFor="image-member-upload" className="cursor-pointer">
    <img
      src={imageMember || 'https://via.placeholder.com/150'} // Default placeholder image
      alt="Member Image"
      className="w-48 h-32 object-cover" // Rectangle shape
    />
    <input
      id="image-member-upload"
      type="file"
      accept="image/*"
      onChange={handleImageMemberChange}
      className="hidden"
    />
  </label>
</div>
                <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>

                <button type="submit" className={"btn mt-2 w-full btn-primary" + (loading ? " loading" : "")}>
                  Register
                </button>

                {/* Google Login Button */}
                <div className="container-login100-form-btn p-t-13">
                  <div className="wrap-login100-form-btn">
                    <div className="login100-form-bgbtn1" />
                  <GoogleLogin
                    clientId={clientId}
                    buttonText="Sign in with Google"
                    onSuccess={handleGoogleSuccess}
                    onFailure={handleGoogleFailure}
                    cookiePolicy="single_host_origin"
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
      </div>
   
  );
}

export default RegisterMember;
