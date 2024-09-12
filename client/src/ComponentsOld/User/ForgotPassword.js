import React, { useState } from 'react';
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as Yup from "yup";
import '../../assets/css/user.css';
import bg from '../../assets/img/bg-01.jpg';
import { Link } from 'react-router-dom';
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Invalid email format")
      .required("Email is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setMessage('');
      setError('');
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API}/api/password/forgot`,
          values,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setMessage(response.data.message || 'Password reset link has been sent to your email.');
      } catch (err) {
        setError(
          err.response?.data?.message ||
          'An error occurred while sending the password reset link.'
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="limiter">
      <div
        className="container-login100"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="wrap-login100 p-l-55 p-r-55 p-t-65 p-b-54">
          <form
            className="login100-form validate-form"
            onSubmit={formik.handleSubmit}
          >
            <span className="login100-form-title p-b-5">
              Forgot your password?
            </span>
            <span className="login200-form-title p-b-50">
              Enter your email to receive a reset link
            </span>

            <div className="register-input-container p-t-12">
              <div className="register-input-row email-row">
                <div className="register-input-group email">
                  <span className="register-label-input">Email</span>
                  <input
                    className="register-input-field email-field"
                    type="email"
                    name="email"
                    placeholder="Input here"
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    value={formik.values.email}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <div className="error" style={{ color: 'red' }}>
                      {formik.errors.email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {message && (
              <div className="success-message" style={{ color: 'green', marginTop: '20px' }}>
                {message}
              </div>
            )}
            {error && (
              <div className="error-message" style={{ color: 'red', marginTop: '20px' }}>
                {error}
              </div>
            )}

            <div className="container-login100-form-btn m-t-20">
              <div className="wrap-login100-form-btn">
                <div className="login100-form-bgbtn" />
                <button
                  className="login100-form-btn"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </div>

            <div className="flex-col-c p-t-40">
              <span className="txt1 p-b-17">
                Remembered your password?{' '}
                <Link to="/login" className="txt2">
                  Log In
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
