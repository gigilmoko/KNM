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
            }, 1500);

        } catch (error) {
            setLoading(false);

            if (error.response) {
                const errorMsg = error.response.data.message || "An error occurred";
                toast.error(errorMsg);
            } else if (error.request) {
                toast.error("No response received");
            } else {
                toast.error(error.message);
            }
        }
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
            <FooterPublic />
        </div>
    );
}

export default Login;