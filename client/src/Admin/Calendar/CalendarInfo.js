import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import Header from "../../Layout/Header";
import LeftSidebar from "../../Layout/LeftSidebar";
import { toast } from 'react-toastify';

const CalendarInfo = () => {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [user, setUser] = useState(null);
  const [isInterested, setIsInterested] = useState(false);
  const navigate = useNavigate();

  const currentTheme = localStorage.getItem("theme") || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/calendar/event/${id}`);
        if (response.data && response.data.success) {
          setEventData(response.data.data);
        }
      } catch (error) {
        // ignore
      }
    };

    const getProfile = async () => {
      const config = {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      };
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
        setUser(data.user);
        const interestResponse = await axios.get(`${process.env.REACT_APP_API}/api/interested/${data.user._id}/${id}`, config);
        if (interestResponse.data && interestResponse.data.interest) {
          setIsInterested(interestResponse.data.interest.interested);
        }
      } catch (error) {
        // ignore
      }
    };

    fetchEvent();
    getProfile();
  }, [id]);

  const handleGetNotified = async () => {
    if (!user) {
      toast.error('User not found. Please log in to express interest in the event.');
      return;
    }
    const notificationData = {
      userId: user._id,
      eventId: id,
      interested: true,
    };
    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      };
      const response = await axios.post(`${process.env.REACT_APP_API}/api/interested`, notificationData, config);
      if (response.data && response.data.success) {
        toast.success('You will be notified about this event!');
        setIsInterested(true);
      } else {
        toast.error('Failed to express interest in the event.');
      }
    } catch (error) {
      toast.error('An error occurred while trying to notify you.');
    }
  };

  const handleListInterested = () => {
    navigate(`/admin/calendar/info/${id}/list`);
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-base-200">
          <div
            className="relative w-full h-48 sm:h-64 md:h-80 rounded-lg overflow-hidden mb-4"
            style={{
              backgroundImage: eventData ? `url(${eventData.image})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-30">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-white text-center px-2">
                {eventData ? eventData.title : 'Loading...'}
              </h2>
            </div>
          </div>

          <div className="max-w-2xl w-full mx-auto p-4 sm:p-8">
            {eventData ? (
              <div className={`p-4 rounded shadow-md ${currentTheme === "dark" ? 'bg-[#1D232A] text-white' : 'bg-white text-gray-800'}`}>
                <p className={`${currentTheme === "dark" ? 'text-white' : 'text-gray-600'} text-xs sm:text-sm`}>
                  Date Published: {new Date(eventData.date).toLocaleDateString()}
                </p>
                <p className={`${currentTheme === "dark" ? 'text-white' : 'text-gray-700'} mb-7 mt-7 text-sm sm:text-base`}>
                  {eventData.description}
                </p>
                <p className={`${currentTheme === "dark" ? 'text-white' : 'text-gray-600'} text-right text-xs sm:text-sm`}>
                  Event Time: {new Date(eventData.startDate).toLocaleString()} {new Date(eventData.startDate).getTime() !== new Date(eventData.endDate).getTime() ? `- ${new Date(eventData.endDate).toLocaleString()}` : ''}
                </p>
              </div>
            ) : (
              <p>Loading event details...</p>
            )}

            <div className="mt-6 mb-6">
              <button
                onClick={handleGetNotified}
                className={`w-full py-2 rounded text-base font-semibold bg-[#ed003f] text-white border-none hover:bg-red-700 transition`}
                disabled={isInterested}
              >
                {isInterested ? "Already Interested" : "Get Notified!"}
              </button>
            </div>
            {user && user.role === "admin" && (
              <div className="mt-4">
                <button
                  onClick={handleListInterested}
                  className="w-full py-2 rounded text-base font-semibold bg-[#ed003f] text-white border-none hover:bg-red-700 transition"
                >
                  List of Interested
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      <LeftSidebar />
    </div>
  );
};

export default CalendarInfo;