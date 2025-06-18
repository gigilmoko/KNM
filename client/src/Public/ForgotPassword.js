import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ErrorText from '../Layout/components/Typography/ErrorText';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';

function ForgotPassword() {
  const INITIAL_USER_OBJ = { emailId: "" };
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [userObj, setUserObj] = useState(INITIAL_USER_OBJ);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (userObj.emailId.trim() === "") {
      return toast.error("Email is required!");
    }
    setLoading(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API}/api/password/forgot`,
        { email: userObj.emailId },
        { headers: { "Content-Type": "application/json" } }
      );
      setLinkSent(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'An error occurred while sending the password reset link.'
      );
    } finally {
      setLoading(false);
    }
  };

  const updateFormValue = (e) => {
    setErrorMessage("");
    setUserObj({ ...userObj, [e.target.name]: e.target.value });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-base-200 text-black'} flex flex-col`}>
      <HeaderPublic />
      <ToastContainer />
      <div className="flex flex-1 items-center justify-center py-10 px-2">
        <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200`}>
          <h2 className="text-3xl font-bold mb-2 text-center text-[#df1f47]">Forgot Password</h2>
          {linkSent ? (
            <>
              <div className="text-center mt-8">
                <CheckCircleIcon className="inline-block w-24 text-green-500" />
              </div>
              <p className="my-4 text-xl font-bold text-center">Link Sent</p>
              <p className="mt-4 mb-8 font-semibold text-center">Check your email to reset password</p>
              <div className="text-center mt-4">
                <Link to="/login">
                  <button className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200 rounded-lg font-semibold py-2">
                    Login
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="my-8 font-semibold text-center">We will send a password reset link to your email</p>
              <form onSubmit={submitForm}>
                <div className="mb-4">
                  <label htmlFor="emailId" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    id="emailId"
                    name="emailId"
                    value={userObj.emailId}
                    onChange={updateFormValue}
                    className="mt-4 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#df1f47] focus:border-[#df1f47] sm:text-sm bg-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                <ErrorText styleClass="mt-4">{errorMessage}</ErrorText>
                <button
                  type="submit"
                  className="btn mt-2 w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200 rounded-lg font-semibold py-2"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <div className="text-center mt-4">
                  <span className="text-gray-500">Don't have an account yet? </span>
                  <Link to="/register">
                    <span className="inline-block text-[#df1f47] hover:underline hover:cursor-pointer transition duration-200 font-semibold">
                      Register
                    </span>
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
      <FooterPublic />
    </div>
  );
}

export default ForgotPassword;