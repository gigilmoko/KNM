import React, { lazy, useEffect } from 'react'
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { themeChange } from 'theme-change'
import checkAuth from './app/auth';
import initializeApp from './app/init';
// import Welcome from './pages/protected/Welcome'
// import Login from './ComponentsOld/User/Login';
// import Register from './ComponentsOld/User/Register';
import RegisterTry from './ComponentsOld/User/RegisterTry';
import Working from './ComponentsOld/User/Working';
// import ForgotPassword from './ComponentsOld/User/ForgotPassword';
import Profile from './ComponentsOld/User/Profile';
<<<<<<< Updated upstream
import NewPassword from "./ComponentsOld/User/NewPassword";
=======
// import NewPassword from "./ComponentsOld/User/NewPassword";
>>>>>>> Stashed changes
import UpdatePassword from "./ComponentsOld/User/UpdatePassword";
import UpdateProfile from "./ComponentsOld/User/UpdateProfile";
import LogoutWithGoogle2 from './ComponentsOld/User/LogoutWithGoogle2';
import RegisterWithGoogle from './ComponentsOld/User/GoogleRegister';
import RegisterWithGoogleFill from './ComponentsOld/User/GoogleRegisterFill';
import LoginWithGoogle from './ComponentsOld/User/LoginWithGoogle';
// import Product from './pages/Product';
import { gapi } from 'gapi-script'
import ProtectedRoute from './Route/ProtectedRoute'
// Importing pages
const Layout = lazy(() => import('./containers/Layout'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Register = lazy(() => import('./pages/Register'))
const Documentation = lazy(() => import('./pages/Documentation'))
<<<<<<< Updated upstream

=======
const NewPassword = lazy(() => import('./pages/NewPassword'))
>>>>>>> Stashed changes
const clientId = "503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com"

// Initializing different libraries
initializeApp()


// Check for login and initialize axios
// const token = checkAuth()


function App() {

  useEffect(() => {
    function start () {
      gapi.client.init({
        clientId: clientId,
        scope: ""
      })
    };
    gapi.load('client:auth2', start);
    themeChange(false)
  }, [])


  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/documentation" element={<Documentation />} />
<<<<<<< Updated upstream
=======
          <Route path="/password/reset/:token" element={<NewPassword />} />
          {/* <Route path="/forgotpassword" element={<ForgotPassword />} />  */}
>>>>>>> Stashed changes
          {/* <Route path = "/app/welcome" element = {<Welcome />}></Route> */}
          {/* Place new routes over this */}
          {/* <Route path="/app/*" element={<ProtectedRoute isAdmin={true}><Layout /></ProtectedRoute> }/> */}
          <Route path="/app/*" element={<Layout/>} />
          {/* <Route
                path="/app/*"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <Layout />
                    </ProtectedRoute>
                }
            /> */}
          {/* <Route path="*" element={<Navigate to={token ? "/app/welcome" : "/login"} replace />}/> */}
          {/* Product */}
          {/* <Route path="/app/product" element={<Product />} /> */}
            {/* <Route path="/login" element={<Login />} /> 
            <Route path="/login-google" element={<LoginWithGoogle />} /> 
           
            <Route path="/logout-google" element={<LogoutWithGoogle2 />} />
            <Route path="/register-google" element={<RegisterWithGoogle />} />
            <Route path="/register-google-fill" element={<RegisterWithGoogleFill />} />
            <Route path="/register" element={<Register />} /> 
            <Route path="/register2" element={<RegisterTry />} /> 
            <Route path="/working" element={<Working />} /> 
            <Route path="/forgotpassword" element={<ForgotPassword />} /> 
            <Route path="/password/reset/:token" element={<NewPassword />} />
            <Route path="/profile" element={<Profile />} /> 
            <Route path="/profile/update" element={<UpdateProfile />} /> 
            <Route path="/password/update" element={<UpdatePassword />} />  */}
        </Routes>
      </Router>
    </>
  )
}

export default App
