import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // To get the event ID from the route
import axios from 'axios'; // For making API requests
import Header from "../../Layout/Header";
import LeftSidebar from "../../Layout/LeftSidebar";
import ModalLayout from "../../Layout/ModalLayout";
import { toast } from 'react-toastify'; // Assuming you're using toast notifications

const CalendarInfo = () => {
  const { id } = useParams(); // Get the event ID from the route parameters
  const [eventData, setEventData] = useState(null); // State to store event data
  const [user, setUser] = useState(null); // State to store user data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state

  // Get the current theme from localStorage or fallback to the default
  const currentTheme = localStorage.getItem("theme") || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");

  useEffect(() => {
    // Fetch the event data and user profile when the component mounts
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/calendar/event/${id}`);
        if (response.data && response.data.success) {
          setEventData(response.data.data);
        } else {
          console.error('Event not found or failed to fetch');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
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
        setLoading(false);
      } catch (error) {
        setError('Failed to load profile.');
        setLoading(false);
      }
    };

    fetchEvent();
    getProfile(); // Fetch user profile
  }, [id]);

  // Handle user interest in the event
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

    console.log('Notification Data:', notificationData);
    console.log('Token:', sessionStorage.getItem('token')); // Log the token being used

    try {
        const config = {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}` // Ensure token is included
            }
        };
        const response = await axios.post(`${process.env.REACT_APP_API}/api/interested`, notificationData, config);

        if (response.data && response.data.success) {
            toast.success('You will be notified about this event!');
        } else {
            toast.error('Failed to express interest in the event.');
        }
    } catch (error) {
        console.error('Error expressing interest:', error);
        toast.error('An error occurred while trying to notify you.');
    }
};


  return (
    <div className="drawer lg:drawer-open">
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        {/* Header */}
        <Header />
  
        {/* Main content */}
        <main className="flex-1 overflow-y-auto md:pt-4 pt-4 bg-base-200" style={{ height: '100vh' }}>
          {/* Calendar Information Header */}
          <div
            className="relative h-1/2"
            style={{
              backgroundImage: eventData ? `url(${eventData.image})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-30">
              <h2 className="text-2xl font-semibold text-white">{eventData ? eventData.title : 'Loading...'}</h2>
            </div>
          </div>
  
          {/* Card for event details in the lower half */}
          <div className="h-1/2 p-6">
            {eventData ? (
              <div className={`p-4 rounded shadow-md ${currentTheme === "dark" ? 'bg-[#1D232A] text-white' : 'bg-white text-gray-800'}`}>
                <p className={`${currentTheme === "dark" ? 'text-white' : 'text-gray-600'}`}>
                  Date Published: {new Date(eventData.date).toLocaleDateString()}
                </p>
                <p className={`${currentTheme === "dark" ? 'text-white' : 'text-gray-700'} mb-7 mt-7`}>
                  {eventData.description}
                </p>
                <p className={`${currentTheme === "dark" ? 'text-white' : 'text-gray-600'} text-right`}>
                  Event Time: {new Date(eventData.startDate).toLocaleString()} {new Date(eventData.startDate).getTime() !== new Date(eventData.endDate).getTime() ? `- ${new Date(eventData.endDate).toLocaleString()}` : ''}
                </p>
              </div>
            ) : (
              <p>Loading event details...</p>
            )}
            
            {/* Get Notified Button */}
            <div className="mt-6">
              <button onClick={handleGetNotified} className={`w-full py-2 rounded ${currentTheme === "dark" ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}>
                Get Notified!
              </button>
            </div>
          </div>
        </main>
      </div>
  
      {/* Left Sidebar */}
      <LeftSidebar />
    </div>
  );
}

export default CalendarInfo;
