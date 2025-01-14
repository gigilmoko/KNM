import logo from './logo.svg';
import React, { useEffect, useState } from 'react';
import './App.css';
import Header from './Layout/Header';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { themeChange } from 'theme-change';
import { gapi } from 'gapi-script';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './Public/Login';
import Register from './Public/Register';
import ProtectedRoute from './Route/ProtectedRoute';
import MembersList from './Admin/Member/MembersList';
import MemberApply from './User/MemberApply';
import MembersConfirmation from './Admin/Member/MembersConfirmation';
import Calendar from './Admin/Calendar/index';
import CalendarList from './Admin/Calendar/CalendarList';
import NewCalendar from './Admin/Calendar/NewCalendar';
import UpdateCalendar from './Admin/Calendar/UpdateCalendar';
import Dashboard from './Admin/Dashboard';
import Profile from './User/Profile';
import ProfileUpdate from './User/ProfileUpdate';
import UsersList from './Admin/User/UsersList';
import ForgotPassword from './Public/ForgotPassword';
import NewPassword from './Public/NewPassword';
import ProductsList from './Admin/Product/ProductList';
import UpdateProduct from './Admin/Product/UpdateProduct';
import NewProduct from './Admin/Product/NewProduct';
import CategoryList from './Admin/Category/CategoryList';
import UpdateCategory from './Admin/Category/UpdateCategory';
import NewCategory from './Admin/Category/NewCategory';
import RegisterMember from './Public/RegisterMember';
import NewMember from './Admin/Member/NewMember';
import UpdateMember from './Admin/Member/UpdateMember';
import Notifications from './Admin/Notification/Notification';
import CalendarInfo from './Admin/Calendar/CalendarInfo';
import NewFeedback from './Public/Feedback/NewFeedback';
import CalendarInterested from './Admin/Calendar/CalendarInterested';
import Homepage from './Public/Homepage';
import About from './Public/About';
import ProductGallery from './Public/ProductGallery';
import FeedbackList from './Admin/Feedback/FeedbackList';
import OrdersList from './Admin/Order/OrderList';
import Contact from './Public/Contact';
import Blog from './Public/Blog';
import EventFeedbackList from './Admin/Feedback/EventFeedbackList';
import ProductFeedbackList from './Admin/Feedback/ProductFeedbackList';


import SingleProduct from './Admin/Feedback/SingleProduct';
const clientId = "503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com";

function App() {

  useEffect(() => {
    // Initialize Google API client
    function start() {
      gapi.client.init({
        clientId: clientId,
        scope: "" // Add necessary scopes
      });
    }
    gapi.load('client:auth2', start);
    themeChange(false);

  }, []);

  return (
    <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<ProductGallery />} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/blog" element={<Blog/>} />
          {/* Feedback */}
          <Route path="/feedback/new" element={<NewFeedback />} />
          {/* <Route path="/event/feedback/new" element={<NewFeedback />} />
          <Route path="/product/feedback/new" element={<NewFeedback />} /> */}
          {/* User */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileUpdate />} />
          <Route path="/profile/apply" element={<MemberApply />} />
          {/* Fillup */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-member" element={<RegisterMember />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<NewPassword />} />
          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          {/* Feedback */}
          <Route path="/admin/feedback/list" element={<ProtectedRoute><FeedbackList /></ProtectedRoute>} />
          <Route path="/admin/event/feedback/list" element={<ProtectedRoute><EventFeedbackList /></ProtectedRoute>} />
          <Route path="/admin/product/feedback/list" element={<ProtectedRoute><ProductFeedbackList /></ProtectedRoute>} />
          <Route path="/admin/product/feedback/list/:productId" element={<ProtectedRoute><SingleProduct/></ProtectedRoute>} />
          {/* Member */}
          <Route path="/admin/members/new" element={<ProtectedRoute><NewMember /></ProtectedRoute>} />
          <Route path="/admin/members/edit/:memberId" element={<ProtectedRoute><UpdateMember /></ProtectedRoute>} />
          <Route path="/admin/members/list" element={<ProtectedRoute><MembersList /></ProtectedRoute>} />
          <Route path="/admin/members/confirmation" element={<ProtectedRoute><MembersConfirmation /></ProtectedRoute>} />
          {/* Calendar */}
          <Route path="/admin/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/admin/calendar/list" element={<ProtectedRoute><CalendarList /></ProtectedRoute>} />
          <Route path="/admin/calendar/new" element={<ProtectedRoute><NewCalendar /></ProtectedRoute>} />
          <Route path="/admin/calendar/update/:id" element={<ProtectedRoute><UpdateCalendar /></ProtectedRoute>} />
          <Route path="/admin/calendar/info/:id" element={<ProtectedRoute><CalendarInfo /></ProtectedRoute>} />
          <Route path="/admin/calendar/info/:id/list" element={<ProtectedRoute><CalendarInterested /></ProtectedRoute>} />
          {/* Products */}
          <Route path="/admin/products" element={<ProtectedRoute><ProductsList /></ProtectedRoute>} />
          <Route path="/admin/products/update/:id" element={<ProtectedRoute><UpdateProduct /></ProtectedRoute>} />
          <Route path="/admin/products/new" element={<ProtectedRoute><NewProduct /></ProtectedRoute>} />
          {/* Category */}
          <Route path="/admin/category" element={<ProtectedRoute><CategoryList /></ProtectedRoute>} />
          <Route path="/admin/category/update/:id" element={<ProtectedRoute><UpdateCategory /></ProtectedRoute>} />
          <Route path="/admin/category/new" element={<ProtectedRoute><NewCategory /></ProtectedRoute>} />
          {/* User */}
          <Route path="/admin/users/list" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
          {/* Orders */}
          <Route path="/admin/orders/list" element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
        </Routes>
    </Router>
  );
}

export default App;
