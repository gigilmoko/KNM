import { GoogleLogin } from 'react-google-login';

const clientId = "503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com";

function Login() {
    const onSuccess = async (res) => {
        console.log("Login Success! User: ", res.profileObj);

        // Fetch user's phone number and date of birth using Google People API
        const accessToken = res.accessToken;
        try {
            const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=phoneNumbers,birthdays', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = await response.json();
            
            // Fetch phone number
            if (data.phoneNumbers) {
                console.log("User's Phone Number: ", data.phoneNumbers[0].value);
            } else {
                console.log("No phone number available");
            }
            
            // Fetch date of birth
            if (data.birthdays) {
                const birthday = data.birthdays[0].date;
                console.log("User's Date of Birth: ", `${birthday.year}-${birthday.month}-${birthday.day}`);
            } else {
                console.log("No date of birth available");
            }
        } catch (error) {
            console.error("Error fetching user's phone number or date of birth: ", error);
        }
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
                scope="https://www.googleapis.com/auth/user.phonenumbers.read https://www.googleapis.com/auth/user.birthday.read"
            />
        </div>
    );
}

export default Login;
