import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ErrorText from '../Layout/components/Typography/ErrorText';
import InputText from '../Layout/components/Input/InputText';
import { toast, ToastContainer } from "react-toastify";
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';

const passwordRegex = /^[A-Za-z0-9!@#$%^&*]{8,}$/; 

function ChangePassword() {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const navigate = useNavigate();
    const location = useLocation();
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const updateFormValue = ({ updateType, value }) => {
        setPasswordData((prevData) => ({
            ...prevData,
            [updateType]: value,
        }));
    };

    useEffect(() => {
        if (!localStorage.getItem('theme')) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    const validateForm = () => {
        if (!passwordRegex.test(passwordData.newPassword)) {
            toast.error('New password must be at least 8 characters.');
            return false;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('New password and confirm password do not match.');
            return false;
        }
        if (!passwordData.oldPassword.trim()) {
            toast.error('Old password is required.');
            return false;
        }
        return true;
    };

    const updatePassword = async (e) => {
      e.preventDefault(); // Prevent default form submission
      if (!validateForm()) return;
  
      try {
          setLoading(true);
          const token = sessionStorage.getItem('token');
  
          const requestData = {
              oldPassword: passwordData.oldPassword,
              newPassword: passwordData.newPassword,
          };
  
          // Log the data being sent
          console.log("Sending password update request:", requestData);
  
          await axios.put(
              `${process.env.REACT_APP_API}/api/password/update`,
              requestData,
              {
                  headers: {
                      Authorization: `Bearer ${token}`,
                      'Content-Type': 'application/json',
                  },
              }
          );
  
          toast.success('Password updated successfully!');
          setTimeout(() => navigate('/profile'), 3000);
      } catch (error) {
          console.error("Error updating password:", error.response ? error.response.data : error);
          toast.error('Failed to update password.');
      } finally {
          setLoading(false);
      }
  };
  

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-base-200 text-black'} flex flex-col`}>
            <HeaderPublic />
            <ToastContainer />
            <div className={`mx-auto w-full max-w-2xl shadow-xl p-6 my-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-base-100'} rounded-xl border border-gray-300`}>
                <h2 className="text-3xl font-bold mb-2 text-center text-[#df1f47]">Change Password</h2>
                <p className={`text-center mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Enter your current password and desired password for your account
                </p>

                <form onSubmit={updatePassword}>
                    <div className="mb-4">
                        <InputText
                            type="password"
                            defaultValue={passwordData.oldPassword}
                            updateFormValue={updateFormValue}
                            updateType="oldPassword"
                            containerStyle="mt-4"
                            labelTitle="Current Password"
                        />
                        <InputText
                            type="password"
                            defaultValue={passwordData.newPassword}
                            updateFormValue={updateFormValue}
                            updateType="newPassword"
                            containerStyle="mt-4"
                            labelTitle="New Password"
                        />
                        <InputText
                            type="password"
                            defaultValue={passwordData.confirmPassword}
                            updateFormValue={updateFormValue}
                            updateType="confirmPassword"
                            containerStyle="mt-4"
                            labelTitle="Confirm Password"
                        />
                    </div>

                    <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
                    
                    <button
                        type="submit"
                        className={`btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
            <FooterPublic />
        </div>
    );
}

export default ChangePassword;
