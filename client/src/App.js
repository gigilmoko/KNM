import React, { lazy, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { themeChange } from 'theme-change';
import { gapi } from 'gapi-script';
import ProtectedRoute from './Route/ProtectedRoute';

// Import components
const Layout = lazy(() => import('./containers/Layout'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Register = lazy(() => import('./pages/Register'));
const Documentation = lazy(() => import('./pages/Documentation'));
const NewPassword = lazy(() => import('./pages/NewPassword'));

const clientId = "503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com";

function App() {
    useEffect(() => {
        function start() {
            gapi.client.init({
                clientId: clientId,
                scope: ""
            });
        }
        gapi.load('client:auth2', start);
        themeChange(false);
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/register" element={<Register />} />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/password/reset/:token" element={<NewPassword />} />

                {/* Wrap protected routes with ProtectedRoute */}
                <Route path="/app/*" element={
                    <ProtectedRoute isAdmin={true}>
                        <Layout />
                    </ProtectedRoute>
                } />

                {/* Redirect unknown URLs */}
                {/* <Route path="*" element={<Navigate to="/404" />} /> */}
            </Routes>
        </Router>
    );
}

export default App;
