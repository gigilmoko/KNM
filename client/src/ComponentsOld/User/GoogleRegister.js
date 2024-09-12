import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from 'react-google-login';

const clientId = "503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com";

function GoogleRegister() {
    const navigate = useNavigate();

    const onSuccess = (res) => {
        console.log("Login Success! User: ", res.profileObj);

        // Navigate to another page, passing profileObj as state
        navigate('/register-google-fill', { state: { userProfile: res.profileObj } });
    };

    const onFailure = (res) => {
        console.log("Login Failed! User: ", res);
    };

    return (
        <div id="signInButton">
            <GoogleLogin
                clientId={clientId}
                buttonText="Login"
                onSuccess={onSuccess}
                onFailure={onFailure}
                cookiePolicy="single_host_origin"
                isSignedIn={true}
            />
        </div>
    );
}

export default GoogleRegister;
