import React, { lazy, useEffect } from 'react'
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import { themeChange } from 'theme-change'
import checkAuth from './app/auth';
import initializeApp from './app/init';
import { gapi } from 'gapi-script'
import ProtectedRoute from './Route/ProtectedRoute'
// Importing pages

const Layout = lazy(() => import('./containers/Layout'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const Register = lazy(() => import('./pages/Register'))
const Documentation = lazy(() => import('./pages/Documentation'))
const NewPassword = lazy(() => import('./pages/NewPassword'))
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
          <Route path="/password/reset/:token" element={<NewPassword />} />
          {/* <Route path="/app/calendar/update-event/:id" element={<EditCalendar />} />  */}
          {/* <Route path="/forgotpassword" element={<ForgotPassword />} />  */}
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

            {/* <Route path="/calendar/events" element={<AllCalendar />} /> 
            <Route path="/calendar/new-event" element={<NewCalendar />} />  */}
    
            {/* <Route path="/calendar/" element={<Calendar />} /> 
            <Route path="/calendar/new" element={<NewCalendarUi />} />  */}
        </Routes>
      </Router>
    </>
  )
}

export default App
