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
      ? `${start.toLocaleDateString()}, ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : `${start.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })} - ${end.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}`;
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <ToastContainer />
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-2 sm:px-6 bg-base-200">
            <TitleCard title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>Event Feedback Ratings Distribution</span>}>
              <div className="flex flex-wrap gap-4 justify-center mt-2">
                {events.map(({ eventId, title, image, averageRating, startDate, endDate }) => (
                  <div
                    key={eventId}
                    className="flex flex-col w-full sm:w-[350px] md:w-[320px] bg-white border border-[#ed003f] rounded-lg shadow-md hover:shadow-lg transition mb-4"
                    style={{ minHeight: 180 }}
                  >
                    <div className="flex flex-col sm:flex-row items-center p-4">
                      <img
                        src={image || '/assets/noimage.png'}
                        alt={title || 'Event Image'}
                        className="w-20 h-20 object-cover rounded-md border-2 border-[#ed003f] mb-2 sm:mb-0 sm:mr-4"
                      />
                      <div className="flex-1 w-full">
                        <h3 className="text-base sm:text-lg font-bold text-[#ed003f] mb-1">{title || 'Untitled Event'}</h3>
                        <p className="text-[#ed003f] text-xs sm:text-sm font-semibold mb-1">
                          Average Rating: <span className="font-bold">{averageRating}</span>
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm">
                          {startDate && endDate ? formatDate(startDate, endDate) : 'No Date Available'}
                        </p>
                      </div>
                    </div>
                    <button
                      className="flex items-center justify-center w-full border-t border-[#ed003f] py-2 text-[#ed003f] hover:bg-[#ed003f] hover:text-white transition rounded-b-lg"
                      onClick={() => navigate(`/admin/event/feedback/list/${eventId}`)}
                    >
                      <span className="text-xs font-semibold mr-1">View Feedback</span>
                      <HiArrowRight className="text-lg" />
                    </button>
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