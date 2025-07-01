import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';
import "react-toastify/dist/ReactToastify.css";

function AdminVerify() {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      // If no email, redirect back to login
      toast.error('No verification session found. Please login again.');
      navigate('/login');
    }

    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, [location.state, navigate]);

  useEffect(() => {
    // Countdown timer for resend button
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      return toast.error('Please enter the verification code!');
    }

    if (verificationCode.trim().length !== 6) {
      return toast.error('Verification code must be 6 digits!');
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/verify`,
        {
          email: email,
          verificationCode: verificationCode.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        // Store admin token and user data
        sessionStorage.setItem("token", response.data.token);
        sessionStorage.setItem("user", JSON.stringify(response.data.user));
        
        toast.success('Admin verification successful! Redirecting to dashboard...');
        
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Admin verification failed:', error);
      
      if (error.response) {
        const errorMsg = error.response.data.message || 'Verification failed. Please try again.';
        toast.error(errorMsg);
      } else if (error.request) {
        toast.error('Network error. Please try again later.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;

    setResendLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/resend-verification`,
        {
          email: email
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        toast.success('New verification code sent to your email!');
        setCountdown(60); // 60 seconds countdown
        setVerificationCode(''); // Clear the input
      }
    } catch (error) {
      console.error('Resend failed:', error);
      
      if (error.response) {
        const errorMsg = error.response.data.message || 'Failed to resend code. Please try again.';
        toast.error(errorMsg);
      } else {
        toast.error('Network error. Please try again later.');
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-base-200 text-black'} flex flex-col`}>
      <HeaderPublic />
      <ToastContainer />
      <div className="flex flex-1 items-center justify-center py-10 px-2">
        <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200`}>
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#df1f47] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-[#df1f47]">Admin Verification</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              We've sent a 6-digit verification code to:
            </p>
            <p className="font-semibold text-[#df1f47] mt-1">{email}</p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify}>
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={handleCodeChange}
                className="input input-bordered w-full text-center text-2xl font-bold tracking-widest"
                placeholder="000000"
                maxLength={6}
                autoComplete="off"
              />
              <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Enter the 6-digit code sent to your email
              </p>
            </div>

            <button
              type="submit"
              className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200 font-semibold py-3 mb-4"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>

          {/* Resend Section */}
          <div className="text-center mb-6">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={resendLoading || countdown > 0}
              className={`text-[#df1f47] hover:underline text-sm font-medium transition duration-200 ${
                (resendLoading || countdown > 0) ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#c0183d]'
              }`}
            >
              {resendLoading ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
            </button>
          </div>

          {/* Back to Login */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Want to try again?{' '}
              <button
                onClick={handleBackToLogin}
                className="text-[#df1f47] hover:underline font-medium transition duration-200"
              >
                Back to Login
              </button>
            </p>
          </div>
        </div>
      </div>
      <FooterPublic />
    </div>
  );
}

export default AdminVerify;