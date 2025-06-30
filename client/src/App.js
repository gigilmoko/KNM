import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { themeChange } from 'theme-change';
import { gapi } from 'gapi-script';
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
import NewRider from './Admin/Rider/NewRider';
import UpdateRider from './Admin/Rider/UpdateRider';
import RiderList from './Admin/Rider/RiderList';
import ChangePassword from './Admin/Rider/ChangePassword';
import ChangePasswordUser from './User/ChangePassword';
import SingleProduct from './Admin/Feedback/SingleProduct';
import TruckList from './Admin/Truck/TruckList';
import NewTruck from './Admin/Truck/NewTruck';
import UpdateTruck from './Admin/Truck/UpdateTruck';
import DeliveryList from './Admin/Delivery/DeliveryList';
import NewDelivery from './Admin/Delivery/NewDelivery';
import UpdateDelivery from './Admin/Delivery/UpdateDelivery';
import RevenueReport from './Admin/Reports/RevenueReport';
import OrderReports from './Admin/Reports/OrderReports';
import UserReports from './Admin/Reports/UserReports';
import SingleEvent from './Public/SingleEvent';
import Products from './Public/Products';
import EventList from './Public/EventList';
import ForecastList from './Admin/Forecast/ForecastList';
import ForecastCreate from './Admin/Forecast/NewForecast';
import UpdateForecast from './Admin/Forecast/UpdateForecast';
import ForecastGraph from './Admin/Forecast/ForecastGraph';
import PpiForecastLineGraph from './Admin/components/PPIForecastLineGraph';
import ProductPriceForecastLineGraph from './Admin/components/ProductPriceForecastLineGraph';
import TaskList from './Admin/Task/TaskList';
import NewTask from './Admin/Task/NewTask';
import UpdateTask from './Admin/Task/UpdateTask';
import RiderHistory from './Admin/Rider/RiderHistory';
import TopProduct from './Admin/Product/TopProduct';

const clientId = "503515447444-2m5c069jorg7vsjj6eibo1vrl82nbc99.apps.googleusercontent.com";

function App() {

  useEffect(() => {
    // Initialize Google API client
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
          <Route path="/" element={<Homepage />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<ProductGallery />} />
          <Route path="/contact" element={<Contact/>} />
          <Route path="/blog" element={<Blog/>} />
          <Route path="/products" element={<Products/>} />
          <Route path="/event/:id" element={<SingleEvent/>} />
          <Route path="/event-list" element={<EventList/>} />
          <Route path="/ppi" element={<PpiForecastLineGraph />} />
          <Route path="/price" element={<ProductPriceForecastLineGraph />} />
          
          {/* Feedback */}
          <Route path="/feedback/new" element={<NewFeedback />} />
          {/* <Route path="/event/feedback/new" element={<NewFeedback />} />
          <Route path="/product/feedback/new" element={<NewFeedback />} /> */}
          {/* User */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<ProfileUpdate />} />
          <Route path="/profile/apply" element={<MemberApply />} />
          <Route path="/profile/changepassword" element={<ChangePasswordUser />} />
          {/* Fillup */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-member" element={<RegisterMember />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<NewPassword />} />
          {/* Admin */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          {/* Forecast */}
          <Route path="/admin/forecast/list" element={<ProtectedRoute><ForecastList /></ProtectedRoute>} />
          <Route path="/admin/forecast/create" element={<ProtectedRoute><ForecastCreate /></ProtectedRoute>} />
          <Route path="/admin/forecast/edit/:id" element={<ProtectedRoute><UpdateForecast /></ProtectedRoute>} />
          <Route path="/admin/forecast/ppi" element={<ProtectedRoute><PpiForecastLineGraph /></ProtectedRoute>} />
          <Route path="/admin/forecast/price" element={<ProtectedRoute><ProductPriceForecastLineGraph /></ProtectedRoute>} />
          <Route path="/admin/forecast/graph" element={<ProtectedRoute><ForecastGraph /></ProtectedRoute>} />
          {/* Rider */}
          <Route path="/admin/rider/list" element={<ProtectedRoute><RiderList /></ProtectedRoute>} />
          <Route path="/admin/rider/:riderId/history" element={<ProtectedRoute><RiderHistory /></ProtectedRoute>} />
          <Route path="/admin/rider/new" element={<ProtectedRoute><NewRider /></ProtectedRoute>} />
          <Route path="/admin/rider/edit/:riderId" element={<ProtectedRoute><UpdateRider /></ProtectedRoute>} />
          <Route path="/admin/rider/changepassword/:riderId" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          {/* Truck */}
          <Route path="/admin/truck/list" element={<ProtectedRoute><TruckList /></ProtectedRoute>} />
          <Route path="/admin/truck/new" element={<ProtectedRoute><NewTruck /></ProtectedRoute>} />
          <Route path="/admin/truck/edit/:truckId" element={<ProtectedRoute><UpdateTruck /></ProtectedRoute>} />
          {/* <Route path="/admin/truck/order/:truckId" element={<ProtectedRoute><TruckOrder /></ProtectedRoute>} /> */}
          {/* Delivery */}
          <Route path="/admin/delivery/list" element={<ProtectedRoute><DeliveryList /></ProtectedRoute>} />
          <Route path="/admin/delivery/new" element={<ProtectedRoute><NewDelivery /></ProtectedRoute>} />
         <Route path="/admin/delivery/edit/:id" element={<UpdateDelivery />} />
          {/* Feedback */}
          <Route path="/admin/feedback/list" element={<ProtectedRoute><FeedbackList /></ProtectedRoute>} />
          <Route path="/admin/event/feedback/list" element={<ProtectedRoute><EventFeedbackList /></ProtectedRoute>} />
          <Route path="/admin/product/feedback/list" element={<ProtectedRoute><ProductFeedbackList /></ProtectedRoute>} />
          <Route path="/admin/product/feedback/list/:productId" element={<ProtectedRoute><SingleProduct/></ProtectedRoute>} />
          <Route path="/admin/event/feedback/list/:eventId" element={<ProtectedRoute><SingleEvent/></ProtectedRoute>} />
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
          <Route path="/admin/products/top" element={<ProtectedRoute><TopProduct /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute><ProductsList /></ProtectedRoute>} />
          <Route path="/admin/products/update/:id" element={<ProtectedRoute><UpdateProduct /></ProtectedRoute>} />
          <Route path="/admin/products/new" element={<ProtectedRoute><NewProduct /></ProtectedRoute>} />
          {/* Category */}
          <Route path="/admin/category" element={<ProtectedRoute><CategoryList /></ProtectedRoute>} />
          <Route path="/admin/category/update/:id" element={<ProtectedRoute><UpdateCategory /></ProtectedRoute>} />
          <Route path="/admin/category/new" element={<ProtectedRoute><NewCategory /></ProtectedRoute>} />
          {/* Reports */}
          <Route path="/admin/reports/revenue" element={<ProtectedRoute><RevenueReport /></ProtectedRoute>} />
          <Route path="/admin/reports/orders" element={<ProtectedRoute><OrderReports /></ProtectedRoute>} />
          <Route path="/admin/reports/users" element={<ProtectedRoute><UserReports /></ProtectedRoute>} />
          {/* <Route path="/admin/reports/members" element={<ProtectedRoute><MemberReports /></ProtectedRoute>} /> */}
          {/* Tasks */}
          <Route path="/admin/tasks" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
          <Route path="/admin/tasks/new" element={<ProtectedRoute><NewTask /></ProtectedRoute>} />
          <Route path="/admin/tasks/update/:id" element={<ProtectedRoute><UpdateTask /></ProtectedRoute>} />
          {/* User */}
          <Route path="/admin/users/list" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
          {/* Orders */}
          <Route path="/admin/orders/list" element={<ProtectedRoute><OrdersList /></ProtectedRoute>} />
        </Routes>
    </Router>
  );
}

export default App;
