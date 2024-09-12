import { GoogleLogout } from 'react-google-login'

const clientId = "503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com"

function Logout(){

    const onSuccess = (res) => {
        console.log("Logout Success! User: ")
    }
    // const onFailure = (res) => {
    //     console.log("Login Failed! User: ", res)
    // }
    return (
    <div id = "signOutButton">

        <GoogleLogout
            clientId={clientId}
            buttonText = {"Logout"}
            onLogoutSuccess={onSuccess}
        />

       

    </div>
    )
}

export default Logout