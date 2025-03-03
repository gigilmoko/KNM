import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ErrorText from '../Layout/components/Typography/ErrorText';
import InputText from '../Layout/components/Input/InputText';
import { GoogleLogin } from 'react-google-login';
import googlelogo from '../assets/img/googlelogo.png';
import { toast, ToastContainer } from "react-toastify";
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';

const clientId = "503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com";

function Login() {
    const INITIAL_LOGIN_OBJ = {
        password: "",
        email: ""
    };

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const navigate = useNavigate();
    const location = useLocation();
    const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : '';

    useEffect(() => {
        if (!localStorage.getItem('theme')) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }, []);

    const submitForm = async (e) => {
        e.preventDefault();
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^.{8,}$/;
    
        if (!loginObj.email || loginObj.email.trim() === "") {
            return toast.error("Email is required!");
        }
    
        if (!emailRegex.test(loginObj.email)) {
            return toast.error("Please enter a valid email address!");
        }
    
        if (!loginObj.password || loginObj.password.trim() === "") {
            return toast.error("Password is required!");
        }
    
        if (!passwordRegex.test(loginObj.password)) {
            return toast.error("Password must be at least 8 characters long");
        }
    
        console.log('Form data being sent:', { email: loginObj.email, password: loginObj.password });
    
        try {
            setLoading(true);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
            };
    
            const response = await axios.post(
                `${process.env.REACT_APP_API}/api/login`,
                { email: loginObj.email, password: loginObj.password },
                config
            );
    
            console.log('Response data:', response.data);
    
            sessionStorage.setItem("token", response.data.token);
            sessionStorage.setItem("user", JSON.stringify(response.data.user));
            setLoading(false);
    
            toast.success("Login successful!");
    
            setTimeout(() => {
                if (response.data.user && response.data.user.role === 'admin') {
                    navigate("/admin/dashboard");
                } else {
                    navigate(redirect || "/");
                }
            }, 3000);
    
        } catch (error) {
            setLoading(false);
    
            if (error.response) {
                console.log("Error response status:", error.response.status);
                console.log("Error response data:", error.response.data);
                const errorMsg = error.response.data.message || "An error occurred";
    
                toast.error(errorMsg);
    
            } else if (error.request) {
                console.log("No response received:", error.request);
    
                toast.error("No response received");
    
            } else {
                console.log("Error message:", error.message);
    
                toast.error(error.message);
            }
        }
    };

    const handleGoogleSuccess = async (response) => {
        try {
            const { profileObj } = response;
            if (!profileObj) {
                throw new Error("Google profile object is null");
            }
            const { email } = profileObj;
    
            console.log('Google login data being sent:', { email });
    
            const { data } = await axios.post(
                `${process.env.REACT_APP_API}/api/google-login`,
                { email }
            );
    
            console.log('Google login response:', data);
    
            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("user", JSON.stringify(data.user));
    
            console.log('Stored user in sessionStorage:', sessionStorage.getItem('user'));
    
            toast.success("Google login successful!");
    
            setTimeout(() => {
                if (data.user && (data.user.role === 'admin' || data.user.role === 'member')) {
                    console.log('Google login successful - Redirecting to admin dashboard');
                    navigate("/admin/dashboard");
                } else {
                    console.log('Google login successful - Redirecting to profile');
                    navigate("/profile");
                }
            }, 3000);
    
        } catch (error) {
            console.log("Google login error:", error);
    
            toast.error("Google login failed");
            setErrorMessage("Google login failed");
        }
    };
    
    const handleGoogleFailure = (error) => {
        console.error("Google login failed:", error);
    
        toast.error("Google login failed");
        setErrorMessage("Google login failed");
    };

    const updateFormValue = ({ updateType, value }) => {
        setErrorMessage("");
        setLoginObj({ ...loginObj, [updateType]: value });
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-base-200 text-black'} flex flex-col`}>
            <HeaderPublic />
            <ToastContainer />
            <div className={`mx-auto w-full max-w-2xl shadow-xl p-6 my-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-base-100'} rounded-xl border border-gray-300`}>
                <h2 className="text-3xl font-bold mb-2 text-center text-[#df1f47]">Welcome Back!</h2>
                <p className={`text-center mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Enter your email and password to access your account</p>

                <form onSubmit={submitForm}>
                    <div className="mb-4">
                        <InputText
                            type="email"
                            defaultValue={loginObj.email}
                            updateType="email"
                            containerStyle="mt-4"
                            labelTitle="Email"
                            updateFormValue={updateFormValue}
                        />
                        <InputText
                            type="password"
                            defaultValue={loginObj.password}
                            updateType="password"
                            containerStyle="mt-4"
                            labelTitle="Password"
                            updateFormValue={updateFormValue}
                        />
                    </div>

                    <div className="text-right">
                        <Link to="/forgot-password">
                            <span className="text-sm inline-block text-[#df1f47] hover:underline hover:cursor-pointer transition duration-200">
                                Forgot Password?
                            </span>
                        </Link>
                    </div>

                    <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
                    <button type="submit" className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200">
                        Login
                    </button>
                    <div className="relative flex items-center my-4">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className={`mx-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'} text-sm`}>or</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    <div className="container-login100-form-btn p-t-13">
                        <div className="wrap-login100-form-btn">
                            <div className="login100-form-bgbtn1" />
                            <GoogleLogin
                                clientId={clientId}
                                buttonText="Login with Google"
                                onSuccess={handleGoogleSuccess}
                                onFailure={handleGoogleFailure}
                                cookiePolicy={'single_host_origin'}
                                render={(renderProps) => (
                                    <button
                                        onClick={renderProps.onClick}
                                        disabled={renderProps.disabled}
                                        className="btn mt-4 w-full flex justify-center items-center border border-gray-300 rounded-md shadow-sm py-2 bg-white text-gray-700 hover:bg-gray-100 transition duration-200"
                                    >
                                        <img src={googlelogo} alt="Google Logo" className="w-5 h-5 mr-2" />
                                        <span className="font-medium">Login with Google</span>
                                    </button>
                                )}
                            />
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        Don't have an account yet?{" "}
                        <Link to="/register">
                            <span className="inline-block text-[#df1f47] hover:underline hover:cursor-pointer transition duration-200">
                                Register
                            </span>
                        </Link>
                    </div>
                </form>
            </div>
            <FooterPublic />
        </div>
    );
}

export default Login;
