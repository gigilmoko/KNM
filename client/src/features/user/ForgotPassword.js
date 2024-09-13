import { useState } from 'react';
import { Link } from 'react-router-dom';
import LandingIntro from './LandingIntro';
import ErrorText from '../../components/Typography/ErrorText';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import axios from 'axios'; // Ensure axios is imported

function ForgotPassword() {
  const INITIAL_USER_OBJ = {
    emailId: ""
  };

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [userObj, setUserObj] = useState(INITIAL_USER_OBJ);

  const submitForm = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (userObj.emailId.trim() === "") {
      return setErrorMessage("Email Id is required!");
    }

    setLoading(true);
    try {
      console.log('Submitting values:', userObj); // Log submitted values
      const response = await axios.post(
        `${process.env.REACT_APP_API}/api/password/forgot`,
        { email: userObj.emailId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log('Response:', response.data); // Log API response
      setLinkSent(true);
    } catch (err) {
      console.error('Error:', err); // Log error
      setErrorMessage(
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
    <div className="min-h-screen bg-base-200 flex items-center">
      <div className="card mx-auto w-full max-w-5xl shadow-xl">
        <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
          <div>
            <LandingIntro />
          </div>
          <div className="py-24 px-10">
            <h2 className="text-2xl font-semibold mb-2 text-center">Forgot Password</h2>

            {linkSent && (
              <>
                <div className="text-center mt-8">
                  <CheckCircleIcon className="inline-block w-32 text-success" />
                </div>
                <p className="my-4 text-xl font-bold text-center">Link Sent</p>
                <p className="mt-4 mb-8 font-semibold text-center">Check your email to reset password</p>
                <div className="text-center mt-4">
                  <Link to="/login">
                    <button className="btn btn-block btn-primary">Login</button>
                  </Link>
                </div>
              </>
            )}

            {!linkSent && (
              <>
                <p className="my-8 font-semibold text-center">We will send a password reset link to your email Id</p>
                <form onSubmit={submitForm}>
                  <div className="mb-4">
                    <label htmlFor="emailId" className="block text-sm font-medium text-gray-700">
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

                  <ErrorText styleClass="mt-12">{errorMessage}</ErrorText>
                  <button
                    type="submit"
                    className={"btn mt-2 w-full btn-primary" + (loading ? " loading" : "")}
                  >
                    Send Reset Link
                  </button>

                  <div className="text-center mt-4">
                    Don't have an account yet? 
                    <Link to="/register">
                      <button className="inline-block hover:text-primary hover:underline hover:cursor-pointer transition duration-200">
                        Register
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

export default ForgotPassword;
