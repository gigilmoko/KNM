import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorText from '../Layout/components/Typography/ErrorText';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import axios from 'axios'; // Ensure axios is imported

function SetNewPassword() {
  const { token } = useParams(); // Assuming token is passed as a URL parameter
  const INITIAL_USER_OBJ = {
    newPassword: "",
    confirmPassword: ""
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userObj, setUserObj] = useState(INITIAL_USER_OBJ);

  const resetPassword = async (token, passwords) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
  
      // Log the data sent and the endpoint
      console.log('Reset Password Endpoint:', `${process.env.REACT_APP_API}/api/password/reset/${token}`);
      console.log('Data Sent:', passwords);
  
      const { data } = await axios.put(
        `${process.env.REACT_APP_API}/api/password/reset/${token}`,
        passwords,
        config
      );
  
      setSuccessMessage(data.success);
    } catch (error) {
      console.error('Error resetting password:', error);
      setErrorMessage(error.response?.data?.message || 'An error occurred while resetting password.');
    }
  };
  
  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
  
    console.log('Submitted Passwords:', userObj.newPassword, userObj.confirmPassword);
  
    if (userObj.newPassword.trim() === "" || userObj.confirmPassword.trim() === "") {
      return setErrorMessage("Both password fields are required!");
    }
  
    if (userObj.newPassword !== userObj.confirmPassword) {
      return setErrorMessage("Passwords do not match!");
    }
  
    setLoading(true);
    await resetPassword(token, {
      password: userObj.newPassword,
      confirmPassword: userObj.confirmPassword // Ensure confirmPassword is sent
    });
    setLoading(false);
  };
  
  
  

  const updateFormValue = (e) => {
    setErrorMessage("");
    setUserObj({ ...userObj, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-xl shadow-xl">
        <div className="bg-base-100 rounded-xl">
          <div className="py-24 px-10">
            <h2 className="text-2xl font-semibold mb-2 text-center">Set New Password</h2>

            {successMessage && (
              <>
                <div className="text-center mt-8">
                  <CheckCircleIcon className="inline-block w-32 text-success" />
                </div>
                <p className="my-4 text-xl font-bold text-center">{successMessage}</p>
                <div className="text-center mt-4">
                  <Link to="/login">
                    <button className="btn btn-block btn-primary">Login</button>
                  </Link>
                </div>
              </>
            )}

            {!successMessage && (
              <>
                <form onSubmit={submitForm}>
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
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
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
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

                  <ErrorText styleClass="mt-12">{errorMessage}</ErrorText>
                  <button
                    type="submit"
                    className={"btn mt-2 w-full btn-primary" + (loading ? " loading" : "")}
                  >
                    Reset Password
                  </button>

                  <div className="text-center mt-4">
                    <Link to="/login">
                      <button className="inline-block hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                        Back to Login
                      </button>
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SetNewPassword;
