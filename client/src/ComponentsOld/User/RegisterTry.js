import React, { useState } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import * as Yup from "yup";
import '../../assets/css/user.css';
import { GoogleLogin } from 'react-google-login';
import bg from '../../assets/img/bgregister.jpg';
import avatar from '../../assets/img/defaultavatar.png';
import { Link } from 'react-router-dom';
import logo from '../../assets/img/logo.png';
import googlelogo from '../../assets/img/googlelogo.png';

const clientId = "503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com";

const Register = () => {
  const navigate = useNavigate();
  const [avatarImage, setAvatarImage] = useState(avatar); // Default avatar image
  const [avatarUrl, setAvatarUrl] = useState(''); // To store Cloudinary URL
  const [googleData, setGoogleData] = useState(null); // To store Google login data

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default'); // Replace with your Cloudinary upload preset

      try {
        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dglawxazg/image/upload', // Replace with your Cloudinary URL
          formData
        );
        const imageUrl = response.data.secure_url;
        setAvatarImage(imageUrl); // Update avatar image preview
        setAvatarUrl(imageUrl); // Set URL for Formik
        formik.setFieldValue("avatar", imageUrl); // Set URL in Formik
      } catch (error) {
        console.error('Failed to upload avatar', error);
      }
    }
  };

  const validationSchema = Yup.object({
    fname: Yup.string()
      .required("First Name is required")
      .matches(/^[^\d]+$/, "First Name cannot contain numbers"),
    lname: Yup.string()
      .required("Last Name is required")
      .matches(/^[^\d]+$/, "Last Name cannot contain numbers"),
    middlei: Yup.string()
      .max(1, "Middle Initial must be 1 character long")
      .required("Middle Initial is required"),
    email: Yup.string().email("Invalid email format").required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .min(8, "Password must be at least 8 characters long"),
    dateOfBirth: Yup.date()
      .required("Date of Birth is required"),
    phone: Yup.string()
      .required("Phone number is required")
      .matches(/^[0-9]+$/, "Phone number must be numeric"),
    memberId: Yup.string()
      .required("Member ID is required"),
    address: Yup.string()
      .required("Address is required"),
    avatar: Yup.string().url("Invalid URL").required("Avatar URL is required"),
  });

  const formik = useFormik({
    initialValues: {
      fname: googleData ? googleData.givenName : "",
      lname: googleData ? googleData.familyName : "",
      middlei: "",
      email: googleData ? googleData.email : "",
      password: "",
      dateOfBirth: "",
      phone: "",
      memberId: "",
      address: "",
      avatar: googleData ? googleData.imageUrl : avatar, // Initially empty URL
      googleLogin: googleData ? true : false, // Add googleLogin field
    },
    validationSchema: validationSchema,
    validateOnChange: !googleData,
    validateOnBlur: !googleData,
    onSubmit: async (values) => {
      try {
        console.log("Form values:", values);

        // Send form data to server
        await axios.post("http://localhost:4001/api/register", values, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("User registered successfully");
        navigate("/login");
      } catch (error) {
        console.error("Registration failed", error);
      }
    },
  });

  const handleGoogleSuccess = (res) => {
    console.log("Google Login Success! User: ", res.profileObj);
    setGoogleData(res.profileObj); // Set Google data to state
    formik.setFieldValue("fname", res.profileObj.givenName);
    formik.setFieldValue("lname", res.profileObj.familyName);
    formik.setFieldValue("email", res.profileObj.email);
    formik.setFieldValue("avatar", res.profileObj.imageUrl);
    setAvatarImage(res.profileObj.imageUrl); // Update avatar preview
    formik.setFieldValue("googleLogin", true); // Set googleLogin to true
  };

  const handleGoogleFailure = (res) => {
    console.log("Google Login Failed! ", res);
  };

  return (
    <>
      <div className="limiter">
        <div
          className="container-login100"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <div className="wrap-login100 p-l-55 p-r-55 p-t-65 p-b-54">
            <form className="login100-form validate-form" onSubmit={formik.handleSubmit}>
              <div className="form-image-container">
                <img src={logo} alt="Logo" className="form-image" />
              </div>
              <span className="login100-form-title p-b-5">Register to KBituin</span>

              <div className="register-input-container p-t-12">
                <div className="avatar-container text-center p-b-20">
                  <img src={avatarImage} alt="Avatar Preview" className="default-avatar" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="avatar-input"
                  />
                  {formik.touched.avatar && formik.errors.avatar ? (
                    <div className="error" style={{ color: 'red' }}>{formik.errors.avatar}</div>
                  ) : null}
                </div>

                <div className="register-input-row name-row">
                  <div className="register-input-group first-name">
                    <span className="register-label-input">First Name</span>
                    <input
                      className="register-input-field name-field"
                      type="text"
                      name="fname"
                      placeholder="First Name"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.fname}
                    />
                    {formik.touched.fname && formik.errors.fname ? (
                      <div className="error" style={{ color: 'red' }}>{formik.errors.fname}</div>
                    ) : null}
                  </div>
                  <div className="register-input-group last-name">
                    <span className="register-label-input">Last Name</span>
                    <input
                      className="register-input-field name-field"
                      type="text"
                      name="lname"
                      placeholder="Last Name"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.lname}
                    />
                    {formik.touched.lname && formik.errors.lname ? (
                      <div className="error" style={{ color: 'red' }}>{formik.errors.lname}</div>
                    ) : null}
                  </div>
                  <div className="register-input-group middle-initial">
                    <span className="register-label-input">Middle Initial</span>
                    <input
                      className="register-input-middle-field"
                      type="text"
                      name="middlei"
                      placeholder="MI"
                      maxLength="1"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.middlei}
                    />
                    {formik.touched.middlei && formik.errors.middlei ? (
                      <div className="error" style={{ color: 'red' }}>{formik.errors.middlei}</div>
                    ) : null}
                  </div>
                </div>

                
                <div className="register-input-row email-row p-t-30">
                  <div className="register-input-group email">
                    <span className="register-label-input">Email</span>
                    <input
                      className="register-input-field email-field"
                      type="email"
                      name="email"
                      placeholder="Email"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.email}
                      readOnly={!!googleData}
                    />
                    {formik.touched.email && formik.errors.email ? (
                      <div className="error" style={{ color: 'red' }}>{formik.errors.email}</div>
                    ) : null}
                  </div>
                </div>

                <div className="register-input-row">
                  <div className="register-input-group">
                    <span className="register-label-input">Password</span>
                    <input
                      className="register-input-field"
                      type="password"
                      name="password"
                      placeholder="Password"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.password}
                    />
                    {formik.touched.password && formik.errors.password ? (
                      <div className="error" style={{ color: 'red' }}>{formik.errors.password}</div>
                    ) : null}
                  </div>
                </div>

                <div className="register-input-row">
                  <div className="register-input-group">
                    <span className="register-label-input">Date of Birth</span>
                    <input
                      className="register-input-field"
                      type="date"
                      name="dateOfBirth"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.dateOfBirth}
                    />
                    {formik.touched.dateOfBirth && formik.errors.dateOfBirth ? (
                      <div className="error" style={{ color: 'red' }}>{formik.errors.dateOfBirth}</div>
                    ) : null}
                  </div>
                </div>

                <div className="register-input-row">
                  <div className="register-input-group">
                    <span className="register-label-input">Phone</span>
                    <input
                      className="register-input-field"
                      type="text"
                      name="phone"
                      placeholder="Phone Number"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.phone}
                    />
                    {formik.touched.phone && formik.errors.phone ? (
                      <div className="error" style={{ color: 'red' }}>{formik.errors.phone}</div>
                    ) : null}
                  </div>
                </div>

                <div className="register-input-row">
                  <div className="register-input-group">
                    <span className="register-label-input">Member ID</span>
                    <input
                      className="register-input-field"
                      type="text"
                      name="memberId"
                      placeholder="Member ID"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.memberId}
                    />
                    {formik.touched.memberId && formik.errors.memberId ? (
                      <div className="error" style={{ color: 'red' }}>{formik.errors.memberId}</div>
                    ) : null}
                  </div>
                </div>

                <div className="register-input-row">
                  <div className="register-input-group">
                    <span className="register-label-input">Address</span>
                    <input
                      className="register-input-field"
                      type="text"
                      name="address"
                      placeholder="Address"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.address}
                    />
                    {formik.touched.address && formik.errors.address ? (
                      <div className="error" style={{ color: 'red' }}>{formik.errors.address}</div>
                    ) : null}
                  </div>
                </div>

              </div>

              <div className="container-login100-form-btn">
                <div className="wrap-login100-form-btn">
                  <div className="login100-form-bgbtn" />
                  <button className="login100-form-btn" type="submit">Register</button>
                </div>
              </div>

              <div className="container-login100-form-btn p-t-13">
                <GoogleLogin
                  clientId={clientId}
                  render={(renderProps) => (
                    <button
                      className="login100-form-btn1"
                      disabled={renderProps.disabled}
                      onClick={renderProps.onClick}
                    >
                      <img src={googlelogo} alt="Google Logo" className="form-image1" />
                      <span className="social-text">Register with Google</span>
                    </button>
                  )}
                  onSuccess={handleGoogleSuccess}
                  onFailure={handleGoogleFailure}
                  cookiePolicy={'single_host_origin'}
                />
              </div>

              <div className="flex-col-c p-t-20">
                <span className="txt1">
                  Already have an account?{" "}
                  <Link to="/login" className="txt2">
                    Log in here
                  </Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
