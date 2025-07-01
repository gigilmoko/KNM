import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import ErrorText from '../Layout/components/Typography/ErrorText';
import InputText from '../Layout/components/Input/InputText';
import { toast, ToastContainer } from "react-toastify";
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';

function Login() {
    const INITIAL_LOGIN_OBJ = {
        password: "",
        email: ""
    };

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [loginObj, setLoginObj] = useState(INITIAL_LOGIN_OBJ);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [unverifiedUserId, setUnverifiedUserId] = useState(null);
    const [resendingCode, setResendingCode] = useState(false);
    const [isAdminVerification, setIsAdminVerification] = useState(false);
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

        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        try {
            setLoading(true);

            const response = await axios.post(
                `${process.env.REACT_APP_API}/api/login`,
                { email: loginObj.email, password: loginObj.password },
                config
            );

            // Check if login was successful (regular users)
            if (response.data.success && response.data.token) {
                sessionStorage.setItem("token", response.data.token);
                sessionStorage.setItem("user", JSON.stringify(response.data.user));
                setLoading(false);

                toast.success("Login successful!");

                setTimeout(() => {
                    if (response.data.user && response.data.user.role.includes('admin')) {
                        navigate("/admin/dashboard");
                    } else {
                        navigate(redirect || "/");
                    }
                }, 1500);
            }
            // Check if admin verification is required
            else if (response.data.requiresVerification) {
                setLoading(false);
                setIsAdminVerification(true);
                toast.info("Verification code sent to your email. Please check your inbox.");
                navigate("/admin-verify", { 
                    state: { 
                        email: loginObj.email,
                        fromLogin: true 
                    } 
                });
            }

        } catch (error) {
            setLoading(false);

            if (error.response) {
                const errorMsg = error.response.data.message || "An error occurred";
                
                // Check if the error is due to unverified email
                if (errorMsg.toLowerCase().includes('email not verified') || 
                    errorMsg.toLowerCase().includes('please verify your email') ||
                    (error.response.status === 403 && error.response.data.requiresVerification)) {
                    
                    // Try to get user ID to resend verification
                    try {
                        const userCheckResponse = await axios.post(
                            `${process.env.REACT_APP_API}/api/check-user-verification`,
                            { email: loginObj.email },
                            config
                        );
                        
                        if (userCheckResponse.data.userId) {
                            setUnverifiedUserId(userCheckResponse.data.userId);
                            setIsAdminVerification(false);
                            setShowVerificationModal(true);
                            toast.error("Your email is not verified. Please verify your email to continue.");
                        } else {
                            toast.error("Email verification required. Please check your email or contact support.");
                        }
                    } catch (checkError) {
                        console.error('Error checking user verification:', checkError);
                        toast.error("Email verification required. Please check your email or contact support.");
                    }
                }
                // Check if admin verification is required (from response)
                else if (error.response.data.requiresVerification) {
                    setIsAdminVerification(true);
                    toast.info("Admin verification required. Verification code sent to your email.");
                    navigate("/admin-verify", { 
                        state: { 
                            email: loginObj.email,
                            fromLogin: true 
                        } 
                    });
                } else {
                    toast.error(errorMsg);
                }
            } else if (error.request) {
                toast.error("No response received");
            } else {
                toast.error(error.message);
            }
        }
    };

    const handleResendVerification = async () => {
        if (!unverifiedUserId) {
            toast.error("Unable to resend verification. Please try registering again.");
            return;
        }

        setResendingCode(true);

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API}/api/resend-email-verification`,
                { userId: unverifiedUserId },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response.data.success) {
                toast.success("Verification code sent! Redirecting to verification page...");
                setShowVerificationModal(false);
                setTimeout(() => {
                    navigate("/verify", { state: { userId: unverifiedUserId } });
                }, 2000);
            }
        } catch (error) {
            console.error('Resend verification failed:', error);
            if (error.response) {
                const errorMsg = error.response.data.message || 'Failed to resend verification code';
                toast.error(errorMsg);
            } else {
                toast.error('Network error. Please try again later.');
            }
        } finally {
            setResendingCode(false);
        }
    };

    const handleGoToVerification = () => {
        setShowVerificationModal(false);
        navigate("/verify", { state: { userId: unverifiedUserId } });
    };

    const handleCloseModal = () => {
        setShowVerificationModal(false);
        setUnverifiedUserId(null);
    };

    const updateFormValue = ({ updateType, value }) => {
        setErrorMessage("");
        setLoginObj({ ...loginObj, [updateType]: value });
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-base-200 text-black'} flex flex-col`}>
            <HeaderPublic />
            <ToastContainer />
            <div className="flex flex-1 items-center justify-center py-10 px-2">
                <div className={`w-full max-w-md rounded-2xl shadow-2xl p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200`}>
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

                        <div className="text-right mb-4">
                            <Link to="/forgot-password">
                                <span className="text-sm text-[#df1f47] hover:underline hover:cursor-pointer transition duration-200">
                                    Forgot Password?
                                </span>
                            </Link>
                        </div>

                        <ErrorText styleClass="mt-8">{errorMessage}</ErrorText>
                        <button
                            type="submit"
                            className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200 font-semibold py-2 rounded-lg"
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </button>
                        <div className="text-center mt-6">
                            <span className="text-gray-500">Don't have an account yet? </span>
                            <Link to="/register">
                                <span className="text-[#df1f47] hover:underline hover:cursor-pointer transition duration-200 font-semibold">
                                    Register
                                </span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>

            {/* Email Verification Modal - Only for unverified users */}
            {showVerificationModal && !isAdminVerification && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className={`w-full max-w-md rounded-xl shadow-xl p-8 m-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200`}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 text-[#df1f47]">Email Verification Required</h3>
                            <p className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                Your email address is not verified. Please verify your email to continue logging in.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleResendVerification}
                                    disabled={resendingCode}
                                    className="btn bg-[#df1f47] text-white hover:bg-[#c0183d] border-none font-semibold"
                                >
                                    {resendingCode ? "Sending..." : "Resend Verification Code"}
                                </button>
                                <button
                                    onClick={handleGoToVerification}
                                    className="btn btn-outline border-[#df1f47] text-[#df1f47] hover:bg-[#df1f47] hover:text-white"
                                >
                                    Go to Verification Page
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    className="btn btn-ghost"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <FooterPublic />
        </div>
    );
}

export default Login;