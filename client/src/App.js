import logo from './logo.svg';
import React, { useEffect } from 'react';
import './App.css';
import Header from './Layout/Header';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { themeChange } from 'theme-change';
import { gapi } from 'gapi-script';
import Login from './Public/Login'
import Register from './Public/Register'
import ProtectedRoute from './Route/ProtectedRoute';
import MembersList from './Admin/Member/MembersList';
import MembersConfirmation from './Admin/Member/MembersConfirmation';
import Calendar from './Admin/Calendar/index'
import CalendarList from './Admin/Calendar/CalendarList'
import NewCalendar from './Admin/Calendar/NewCalendar'
import UpdateCalendar from './Admin/Calendar/UpdateCalendar'
import Dashboard from './Admin/Dashboard'
import Profile from './User/Profile';
import ProfileUpdate from './User/ProfileUpdate';
import UsersList from './Admin/User/UsersList'
import ForgotPassword from './Public/ForgotPassword';
import NewPassword from './Public/NewPassword';
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
        {/* Public */}
          {/* User */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<ProfileUpdate />} />
            <Route path="/profile" element={<Profile />} />
          {/* Fillup */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/password/reset/:token" element={<NewPassword />} />
        {/* Admin */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          {/* Members */}
            <Route path="/admin/members/confirmation" element={<MembersConfirmation />} />
          {/* Calendar */}
            <Route path="/admin/calendar" element={<Calendar />} />
            <Route path="/admin/calendar/list" element={<CalendarList />} />
            <Route path="/admin/calendar/new" element={<NewCalendar />} />
            <Route path="/admin/calendar/update/:id" element={<UpdateCalendar />} />
          {/* Product */}
          {/* Category */}
          {/* User */}
            <Route path="/admin/users/list" element={<UsersList />} />
            <Route path="/admin/calendar" element={<Calendar />} />
      </Routes>
    </Router>
  );
}


export default App;
