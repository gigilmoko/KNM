import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LandingIntro from './components/LandingIntro';
import ErrorText from '../../components/Typography/ErrorText';
import InputText from '../../components/Input/InputText';
import { GoogleLogin } from 'react-google-login';
import googlelogo from '../../assets/img/googlelogo.png';

const clientId = "503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com"; // Replace with your actual client ID

function Login() {
    const INITIAL_LOGIN_OBJ = {
        password: "",
        email: ""
    };

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ);
    const navigate = useNavigate();
    const location = useLocation();
    const redirect = location.search ? new URLSearchParams(location.search).get('redirect') : '';

    // Handle form submission
    const submitForm = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!loginObj.email || loginObj.email.trim() === "") return setErrorMessage("Email Id is required!");
        if (!loginObj.password || loginObj.password.trim() === "") return setErrorMessage("Password is required!");

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

            localStorage.setItem("token", response.data.token);
            setLoading(false);

            if (response.data.user && response.data.user.role === 'admin') {
                navigate("/app/welcome");
            } else {
                navigate("/");
            }
        } catch (error) {
            setLoading(false);
            if (error.response) {
                console.log("Error response status:", error.response.status);
                console.log("Error response data:", error.response.data);
                setErrorMessage(error.response.data.message || "An error occurred");
            } else if (error.request) {
                console.log("No response received:", error.request);
                setErrorMessage("No response received");
            } else {
                console.log("Error message:", error.message);
                setErrorMessage(error.message);
            }
        }
    };

    // Google Login success handler
    const handleGoogleSuccess = async (response) => {
        try {
            const { profileObj } = response;
            const { email } = profileObj;

            console.log('Google login data being sent:', { email });

            const { data } = await axios.post(
                `${process.env.REACT_APP_API}/api/google-login`,
                { email }
            );

            console.log('Google login response:', data);

            localStorage.setItem("token", data.token);

            if (data.user && data.user.memberId === '1') {
                console.log('Google login successful - Redirecting to admin dashboard');
                navigate("/admin/dashboard");
            } else {
                console.log('Google login successful - Redirecting to profile');
                navigate("/profile");
            }
        } catch (error) {
            console.log("Google login error:", error);
            setErrorMessage("Google login failed");
        }
    };

    // Google Login failure handler
    const handleGoogleFailure = (error) => {
        setErrorMessage("Google login failed");
        console.error("Google login failed:", error);
    };

    // Update form values
    const updateFormValue = ({ updateType, value }) => {
        setErrorMessage("");
        setLoginObj({ ...loginObj, [updateType]: value });
    };

    return (
        <div className="min-h-screen bg-base-200 flex items-center">
            <div className="card mx-auto w-full max-w-5xl shadow-xl">
                <div className="grid md:grid-cols-2 grid-cols-1 bg-base-100 rounded-xl">
                    <div>
                        <LandingIntro />
                    </div>
                    <div className='py-24 px-10'>
                        <h2 className='text-2xl font-semibold mb-2 text-center'>Login</h2>
                        <form onSubmit={submitForm}>
                            <div className="mb-4">
                                <InputText
                                    type="email"
                                    defaultValue={loginObj.email}
                                    updateType="email"
                                    containerStyle="mt-4"
                                    labelTitle="Email Id"
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

                            <div className='text-right text-primary'>
                                <Link to="/forgot-password">
                                    <span className="text-sm inline-block hover:text-primary hover:underline hover:cursor-pointer transition duration-200">Forgot Password?</span>
                                </Link>
                            </div>

                            <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
                            <button type="submit" className={"btn mt-2 w-full btn-primary" + (loading ? " loading" : "")}>
                                {loading ? "Loading..." : "Login"}
                            </button>

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
                                                className="login100-form-btn1"
                                                onClick={renderProps.onClick}
                                                disabled={renderProps.disabled}
                                            >
                                                <img src={googlelogo} alt="Google Logo" className="form-image1" />
                                                <span className="social-text">Login with Google</span>
                                            </button>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className='text-center mt-4'>
                                Don't have an account yet? <Link to="/register">
                                    <span className="inline-block hover:text-primary hover:underline hover:cursor-pointer transition duration-200">Register</span>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;