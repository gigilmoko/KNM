import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';
import "react-toastify/dist/ReactToastify.css";
import { authenticate } from '../utils/helpers';

function Verify() {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [countdown, setCountdown] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get userId from location state (passed from registration)
    if (location.state?.userId) {
      setUserId(location.state.userId);
    } else {
      // If no userId, redirect back to register
      toast.error('No verification session found. Please register again.');
      navigate('/register');
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

  useEffect(() => {
    // Check email verification status
    const checkVerificationStatus = async () => {
      if (!userId) return;
      
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API}/api/check-email-verification/${userId}`
        );
        
        if (response.data.isEmailVerified) {
          toast.info('Email already verified. Redirecting to login...');
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setUserEmail(response.data.email);
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };

    checkVerificationStatus();
  }, [userId, navigate]);

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
        `${process.env.REACT_APP_API}/api/verify-email`,
        {
          userId: userId,
          verificationCode: verificationCode.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        toast.success('Email verified successfully! Logging you in...');
        
        // Auto-login after verification
        authenticate(response.data, () => {
          setTimeout(() => {
            if (response.data.user.role === 'admin') {
              navigate('/admin/dashboard');
            } else {
              navigate('/');
            }
          }, 2000);
        });
      }
    } catch (error) {
      console.error('Verification failed:', error);
      
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
        `${process.env.REACT_APP_API}/api/resend-email-verification`,
        {
          userId: userId
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

  const handleBackToRegister = () => {
    navigate('/register');
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2 text-[#df1f47]">Verify Your Email</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              We've sent a 6-digit verification code to:
            </p>
            <p className="font-semibold text-[#df1f47] mt-1">{userEmail}</p>
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
              {loading ? "Verifying..." : "Verify Email"}
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

          {/* Back to Register */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Wrong email address?{' '}
              <button
                onClick={handleBackToRegister}
                className="text-[#df1f47] hover:underline font-medium transition duration-200"
              >
                Back to Register
              </button>
            </p>
          </div>
        </div>
      </div>
      <FooterPublic />
    </div>
  );
}

export default Verify;