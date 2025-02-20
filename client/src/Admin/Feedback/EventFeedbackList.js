import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import axios from 'axios';
import { HiArrowRight } from 'react-icons/hi';

const EventFeedbackList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(`${process.env.REACT_APP_API}/api/event/feedback/all`, config);
        console.log('Event Feedback:', response.data);
        setEvents(response.data.data);
      } catch (error) {
        toast.error('Failed to load event feedbacks');
        console.error('Error fetching event feedbacks:', error.response ? error.response.data : error);
      }
    };
    fetchFeedbacks();
  }, [dispatch]);

  const formatDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const sameDay = start.toLocaleDateString() === end.toLocaleDateString();
    return sameDay
      ? `${start.toLocaleDateString()}, ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`
      : `${start.toLocaleString()} - ${end.toLocaleString()}`;
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <ToastContainer />
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200">
            <TitleCard title="Event Feedback Ratings Distribution">
              <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
                {events.map(({ eventId, title, image, averageRating, startDate, endDate }) => (
                  <div key={eventId} className="p-4 border rounded-md shadow-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <img 
                        src={image || '/assets/noimage.png'} 
                        alt={title || 'Event Image'} 
                        className="w-20 h-20 object-cover rounded-md mr-4" 
                      />
                      <div>
                        <h3 className="text-lg font-semibold">{title || 'Untitled Event'}</h3>
                        <p className="text-gray-500">Average Rating: {averageRating}</p>
                        <p className="text-gray-500">{startDate && endDate ? formatDate(startDate, endDate) : 'No Date Available'}</p>
                      </div>
                    </div>
                    <HiArrowRight 
                      className="text-gray-500 text-xl cursor-pointer" 
                      onClick={() => navigate(`/admin/event/feedback/list/${eventId}`)} 
                    />
                  </div>
                ))}
              </div>
            </TitleCard>
          </main>
        </div>
        <LeftSidebar />
      </div>
      <RightSidebar />
      <ModalLayout />
    </>
  );
};

export default EventFeedbackList;
