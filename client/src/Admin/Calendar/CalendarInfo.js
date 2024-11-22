import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Header from "../../Layout/Header";
import LeftSidebar from "../../Layout/LeftSidebar";
import { toast } from 'react-toastify';

const CalendarInfo = () => {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [user, setUser] = useState(null);
  const [isInterested, setIsInterested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate

  const currentTheme = localStorage.getItem("theme") || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/calendar/event/${id}`);
        
        console.log('Fetched Event Data:', response.data); // Log the event data being fetched
        
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
        
        console.log('Fetched User Profile:', data);
        
        setUser(data.user);
        setLoading(false);
      
        const interestResponse = await axios.get(`${process.env.REACT_APP_API}/api/interested/${data.user._id}/${id}`, config);
        
        console.log('Fetched Interest Status:', interestResponse.data);
        
        // Directly set the interested state based on the fetched interest status
        if (interestResponse.data && interestResponse.data.interest) {
          setIsInterested(interestResponse.data.interest.interested);
          console.log('User is interested in the event:', interestResponse.data.interest.interested);
        } else {
          console.log('Interest data is missing or user not found');
        }
      } catch (error) {
        setError('Failed to load profile.');
        setLoading(false);
        console.error('Error fetching profile or interest status:', error);
      }
    };
    
    console.log('Fetching event and profile data...');
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

    console.log('Notification Data:', notificationData); // Log notification data before making the request

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      };
      const response = await axios.post(`${process.env.REACT_APP_API}/api/interested`, notificationData, config);

      console.log('Notification Response:', response.data); // Log the response from the notification request

      if (response.data && response.data.success) {
        toast.success('You will be notified about this event!');
        setIsInterested(true);
      } else {
        toast.error('Failed to express interest in the event.');
      }
    } catch (error) {
      console.error('Error expressing interest:', error); // Log error details
      toast.error('An error occurred while trying to notify you.');
    }
  };

  const handleListInterested = () => {
    navigate(`/admin/calendar/info/${id}/list`);
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto md:pt-4 pt-4 bg-base-200" style={{ height: '100vh' }}>
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

            <div className="mt-6 mb-6">
              <button
                onClick={handleGetNotified}
                className={`w-full py-2 rounded ${currentTheme === "dark" ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}
                disabled={isInterested}
              >
                {isInterested ? "Already Interested" : "Get Notified!"}
              </button>
            </div>
            {user && user.role === "admin" && (
              <div className="mt-4">
                <button
                  onClick={handleListInterested}
                  className={`w-full py-2 rounded ${currentTheme === "dark" ? 'bg-green-600 text-white' : 'bg-green-500 text-white'}`}
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
