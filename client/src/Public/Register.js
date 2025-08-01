import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import { GoogleLogin } from 'react-google-login';
import ErrorText from '../Layout/components/Typography/ErrorText';
import InputText from '../Layout/components/Input/InputText';
import googlelogo from '../assets/img/googlelogo.png';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';
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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const submitForm = async (e) => {
    e.preventDefault();

    const nameRegex = /^[A-Za-z\s]+$/; 
    const middleInitialRegex = /^[A-Z]$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{11}$/;

    const capitalizeFirstLetter = (text) => {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };
    
    if (registerObj.fname.trim() === '') return toast.error('First Name is required!');
    registerObj.fname = capitalizeFirstLetter(registerObj.fname.trim());
    if (!nameRegex.test(registerObj.fname)) return toast.error('First Name must only contain letters!');
    
    if (registerObj.lname.trim() === '') return toast.error('Last Name is required!');
    registerObj.lname = capitalizeFirstLetter(registerObj.lname.trim());
    if (!nameRegex.test(registerObj.lname)) return toast.error('Last Name must only contain letters!');
    
    if (registerObj.middlei.trim() === '') return toast.error('Middle Initial is required!');
    registerObj.middlei = capitalizeFirstLetter(registerObj.middlei.trim());
    if (!middleInitialRegex.test(registerObj.middlei)) return toast.error('Middle Initial must be a single letter!');
    
    if (registerObj.email.trim() === '') return toast.error('Email is required!');
    if (!emailRegex.test(registerObj.email.trim())) return toast.error('Email Id must be valid!');
    
    if (registerObj.password.trim() === '' && !registerObj.googleLogin) return toast.error('Password is required!');
    if (registerObj.password.trim().length < 8 && !registerObj.googleLogin) return toast.error('Password must be at least 8 characters long!');
    
    if (registerObj.dateOfBirth.trim() === '') return toast.error('Date of Birth is required!');
    
    if (registerObj.phone.trim() === '') return toast.error('Phone number is required!');
    if (!phoneRegex.test(registerObj.phone.trim())) return toast.error('Phone number must be exactly 11 digits!');
    
    setIsMemberModalOpen(true);
  };

  const handleMemberChoice = async (choice) => {
    setIsMember(choice);
    setIsMemberModalOpen(false);

    if (choice) {
      setIsMemberModalOpen(true);
    } else {
      await registerUser();
    }
  };

  const handleMemberIdSubmit = async () => {
    if (memberId.trim() === '') {
      return toast.error('Member ID is required!');
    }
    await registerUserMember();
  };

const registerUser = async () => {
  setLoading(true);
  try {
    const updatedRegisterObj = {
      ...registerObj,
      role: 'user',
    };
    const response = await axios.post(
      `${process.env.REACT_APP_API}/api/register`,
      updatedRegisterObj,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (response.data.requiresVerification) {
      toast.success("Registration successful! Please check your email for verification code.");
      setTimeout(() => {
        navigate("/verify", { state: { userId: response.data.userId } });
      }, 2000);
    } else {
      toast.success("User registered successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  } catch (error) {
    // ...existing error handling
  } finally {
    setLoading(false);
  }
};

// In the registerUserMember function, replace the success handling:
const registerUserMember = async () => {
  setLoading(true);
  try {
    const updatedRegisterObj = {
      ...registerObj,
      memberId,
    };
    const response = await axios.post(
      `${process.env.REACT_APP_API}/api/register-member`,
      updatedRegisterObj,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (response.data.requiresVerification) {
      toast.success("Registration successful! Please check your email for verification code.");
      setTimeout(() => {
        navigate("/verify", { state: { userId: response.data.userId } });
      }, 2000);
    } else {
      toast.success("User registered successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  } catch (error) {
    // ...existing error handling
  } finally {
    setLoading(false);
  }
};

  const updateFormValue = ({ updateType, value }) => {
    setErrorMessage('');
    setRegisterObj({ ...registerObj, [updateType]: value });
  };

  // const handleGoogleSuccess = (res) => {
  //   const { profileObj } = res;
  //   setRegisterObj(prev => ({
  //     ...prev,
  //     fname: profileObj.givenName,
  //     lname: profileObj.familyName,
  //     email: profileObj.email,
  //     googleLogin: true,
  //     avatar: profileObj.imageUrl
  //   }));
  //   setAvatarImage(profileObj.imageUrl);
  // };

  // const handleGoogleFailure = (res) => {
  //   // Handle Google login failure
  // };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default');
      try {
        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dglawxazg/image/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        const imageUrl = response.data.secure_url;
        setAvatarImage(imageUrl);
        setRegisterObj(prev => ({ ...prev, avatar: imageUrl }));
        toast.success("Avatar uploaded successfully!");
      } catch (error) {
        setErrorMessage('Failed to upload avatar. Please try again.');
        toast.error('Failed to upload avatar. Please try again.');
      }
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-base-200 text-black'} flex flex-col`}>
      <HeaderPublic />
      <ToastContainer />
      <div className="flex flex-1 items-center justify-center py-8 px-2">
        <div className={`w-full max-w-2xl rounded-2xl shadow-2xl p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200`}>
          <h2 className="text-3xl font-bold mb-2 text-center text-[#df1f47]">Create an Account</h2>
          <p className={`text-center mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Enter your information to create an account</p>
          <form onSubmit={submitForm}>
            <div className="mb-4">
              <div className="flex justify-center items-center mb-6">
                <label htmlFor="avatar-upload" className="cursor-pointer group relative">
                  <img
                    src={avatarImage || 'https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png'}
                    alt="Avatar"
                    className="w-28 h-28 rounded-full object-cover border-4 border-[#df1f47] shadow-lg group-hover:opacity-80 transition"
                  />
                  <div className="absolute bottom-2 right-2 bg-[#df1f47] text-white px-2 py-1 rounded text-xs opacity-90 group-hover:opacity-100 transition">
                    Change
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputText
                  type="text"
                  defaultValue={registerObj.fname}
                  updateType="fname"
                  containerStyle="mt-1"
                  labelTitle="First Name"
                  updateFormValue={updateFormValue}
                />
                <InputText
                  type="text"
                  defaultValue={registerObj.lname}
                  updateType="lname"
                  containerStyle="mt-1"
                  labelTitle="Last Name"
                  updateFormValue={updateFormValue}
                />
                <InputText
                  type="text"
                  defaultValue={registerObj.middlei}
                  updateType="middlei"
                  containerStyle="mt-1"
                  labelTitle="Middle Initial"
                  updateFormValue={updateFormValue}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InputText
                  type="email"
                  defaultValue={registerObj.email}
                  updateType="email"
                  containerStyle="mt-1"
                  labelTitle="Email Id"
                  updateFormValue={updateFormValue}
                  readOnly={registerObj.googleLogin}
                />
                <InputText
                  type="password"
                  defaultValue={registerObj.password}
                  updateType="password"
                  containerStyle="mt-1"
                  labelTitle="Password"
                  updateFormValue={updateFormValue}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <InputText
                  type="date"
                  defaultValue={registerObj.dateOfBirth}
                  updateType="dateOfBirth"
                  containerStyle="mt-1"
                  labelTitle="Date of Birth"
                  updateFormValue={updateFormValue}
                />
                <InputText
                  type="text"
                  defaultValue={registerObj.phone}
                  updateType="phone"
                  containerStyle="mt-1"
                  labelTitle="Phone Number"
                  updateFormValue={updateFormValue}
                />
              </div>
              <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
              <button
                type="submit"
                className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200 mt-6"
                disabled={loading}
              >
                {loading ? "Registering..." : "Register"}
              </button>
              <div className="relative flex items-center my-6">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500 text-sm">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <div>
              </div>
            </div>
          </form>
          <div className="text-center mt-4">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="text-[#df1f47] hover:underline transition duration-200">
                Login Here
              </Link>
            </p>
          </div>
        </div>
      </div>
      <FooterPublic />
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-center">Are you a member of KNM?</h3>
            <div className="flex justify-center gap-4 mt-6">
              <button
                className="btn bg-[#df1f47] text-white hover:bg-[#c0183d] border-none"
                onClick={() => handleMemberChoice(true)}
              >
                Yes
              </button>
              <button className="btn" onClick={() => handleMemberChoice(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member ID Modal */}
      {isMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-center">Enter your Member ID</h3>
            <input
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="input input-bordered w-full mt-4"
              placeholder="Member ID"
            />
            <div className="flex justify-center gap-4 mt-6">
              <button
                className="btn bg-[#df1f47] text-white hover:bg-[#c0183d] border-none"
                onClick={handleMemberIdSubmit}
              >
                Submit
              </button>
              <button className="btn" onClick={() => setIsMember(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;