import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import axios from 'axios';
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';

function SetNewPassword() {
  const { token } = useParams();
  const INITIAL_USER_OBJ = {
    newPassword: "",
    confirmPassword: ""
  };

  const [loading, setLoading] = useState(false);
  const [userObj, setUserObj] = useState(INITIAL_USER_OBJ);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const resetPassword = async (token, passwords) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };

      console.log('Reset Password Endpoint:', `${process.env.REACT_APP_API}/api/password/reset/${token}`);
      console.log('Data Sent:', passwords);

      const { data } = await axios.put(
        `${process.env.REACT_APP_API}/api/password/reset/${token}`,
        passwords,
        config
      );

      toast.success(data.success);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'An error occurred while resetting password.');
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();

    console.log('Submitted Passwords:', userObj.newPassword, userObj.confirmPassword);

    if (userObj.newPassword.trim() === "" || userObj.confirmPassword.trim() === "") {
      return toast.error("Both password fields are required!");
    }

    if (userObj.newPassword !== userObj.confirmPassword) {
      return toast.error("Passwords do not match!");
    }

    if (userObj.newPassword.length < 8) {
      return toast.error("Password must be at least 8 characters long!");
    }

    setLoading(true);
    await resetPassword(token, {
      password: userObj.newPassword,
      confirmPassword: userObj.confirmPassword
    });
    setLoading(false);
  };

  const updateFormValue = (e) => {
    setUserObj({ ...userObj, [e.target.name]: e.target.value });
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-base-200 text-black'} flex flex-col justify-between`}>
      <HeaderPublic />
      <ToastContainer />
      <div className={`mx-auto w-full max-w-2xl shadow-xl p-6 my-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-base-100'} rounded-xl border border-gray-300`}>
        <h2 className="text-3xl font-bold mb-2 text-center text-[#df1f47]">Set New Password</h2>

        {userObj.success && (
          <>
            <div className="text-center mt-8">
              <CheckCircleIcon className="inline-block w-32 text-success" />
            </div>
            <p className="my-4 text-xl font-bold text-center">{userObj.success}</p>
            <div className="text-center mt-4">
              <Link to="/login">
                <button className="btn btn-block bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200">Login</button>
              </Link>
            </div>
          </>
        )}

        {!userObj.success && (
          <>
            <form onSubmit={submitForm}>
              <div className="mb-4">
                <label htmlFor="newPassword" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={userObj.newPassword}
                  onChange={updateFormValue}
                  className="mt-4 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter new password"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={userObj.confirmPassword}
                  onChange={updateFormValue}
                  className="mt-4 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                type="submit"
                className={`btn mt-2 w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200 `}
              >
                Reset Password
              </button>

              <div className="text-center mt-4">
                <Link to="/login">
                  <button className="inline-block text-[#df1f47] hover:underline hover:cursor-pointer transition duration-200">
                    Back to Login
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

export default SetNewPassword;

