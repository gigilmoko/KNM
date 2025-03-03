import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ErrorText from '../Layout/components/Typography/ErrorText';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';

function ForgotPassword() {
  const INITIAL_USER_OBJ = {
    emailId: ""
  };

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
      return toast.error("Email Id is required!");
    }

    setLoading(true);
    try {
      console.log('Submitting values:', userObj);
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/password/forgot`,
        { email: userObj.emailId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log('Response:', response.data);
      setLinkSent(true);
    } catch (err) {
      console.error('Error:', err);
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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-base-200 text-black'} flex flex-col justify-between`}>
      <HeaderPublic />
      <ToastContainer />
      <div className={`mx-auto w-full max-w-2xl shadow-xl p-6 my-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-base-100'} rounded-xl border border-gray-300`}>
        <h2 className="text-3xl font-bold mb-2 text-center text-[#df1f47]">Forgot Password</h2>

        {linkSent && (
          <>
            <div className="text-center mt-8">
              <CheckCircleIcon className="inline-block w-32 text-success" />
            </div>
            <p className="my-4 text-xl font-bold text-center">Link Sent</p>
            <p className="mt-4 mb-8 font-semibold text-center">Check your email to reset password</p>
            <div className="text-center mt-4">
              <Link to="/login">
                <button className="btn btn-block bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200">Login</button>
              </Link>
            </div>
          </>
        )}

        {!linkSent && (
          <>
            <p className="my-8 font-semibold text-center">We will send a password reset link to your email Id</p>
            <form onSubmit={submitForm}>
              <div className="mb-4">
                <label htmlFor="emailId" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Id
                </label>
                <input
                  type="email"
                  id="emailId"
                  name="emailId"
                  value={userObj.emailId}
                  onChange={updateFormValue}
                  className="mt-4 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <ErrorText styleClass="mt-4">{errorMessage}</ErrorText>
              <button
                type="submit"
                className={`btn mt-2 w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200 `}
              >
                Send Reset Link
              </button>

              <div className="text-center mt-4">
                Don't have an account yet?{" "}
                <Link to="/register">
                  <button className="inline-block text-[#df1f47] hover:underline hover:cursor-pointer transition duration-200">
                    Register
                  </button>
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
      <FooterPublic />
    </div>
  );
}

export default ForgotPassword;
