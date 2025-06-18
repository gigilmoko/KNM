import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { HiChevronDown, HiChevronUp, HiStar } from 'react-icons/hi';
import axios from 'axios';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';

const EventFeedbackList = () => {
  const [events, setEvents] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Fetch all feedback events (with average rating and event details)
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/event/feedback/all`, config);
        setEvents(data.data || []);
      } catch (err) {
        toast.error('Failed to load events.');
      }
    };

    // Fetch all feedbacks for all events (for dropdown details)
    const fetchAllFeedbacks = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/event/feedback/all`, config);
        // For each event, fetch its feedbacks
        const feedbackMap = {};
        await Promise.all(
          (data.data || []).map(async (event) => {
            try {
              const res = await axios.get(`${process.env.REACT_APP_API}/api/event/feedback/${event.eventId}`, config);
              feedbackMap[event.eventId] = res.data.data || [];
            } catch {
              feedbackMap[event.eventId] = [];
            }
          })
        );
        setFeedbacks(feedbackMap);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load feedbacks.');
        setLoading(false);
      }
    };

    fetchEvents().then(fetchAllFeedbacks);
  }, []);

  const toggleRow = (eventId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  return (
    <div className="drawer lg:drawer-open">
      <ToastContainer />
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto px-2 sm:px-6 bg-base-200">
          <TitleCard title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>Event Items, Ratings & Feedbacks</span>}>
            {loading ? (
              <p>Loading events...</p>
            ) : events.length === 0 ? (
              <p>No events available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-[#ed003f] rounded-lg shadow">
                  <thead>
                    <tr className="bg-[#ed003f] text-white">
                      <th className="py-2 px-4 text-left">Event</th>
                      <th className="py-2 px-4 text-left">Image</th>
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Average Rating</th>
                      <th className="py-2 px-4 text-left">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <React.Fragment key={event.eventId}>
                        <tr className="border-b border-[#ed003f]">
                          <td className="py-2 px-4 text-[#ed003f]">{event.title}</td>
                          <td className="py-2 px-4">
                            <img
                              src={event.image || '/assets/noimage.png'}
                              alt={event.title}
                              className="w-12 h-12 object-cover rounded border-2 border-[#ed003f]"
                            />
                          </td>
                          <td className="py-2 px-4">
                            {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-2 px-4">
                            <span className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <HiStar
                                  key={star}
                                  className={`inline-block text-yellow-400 ${star <= Math.round(event.averageRating) ? '' : 'opacity-30'}`}
                                />
                              ))}
                              <span className="ml-2 text-xs text-gray-700 font-semibold">
                                {event.averageRating ? event.averageRating.toFixed(1) : '0'} / 5
                              </span>
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            <button
                              className="flex items-center text-[#ed003f] font-semibold hover:underline"
                              onClick={() => toggleRow(event.eventId)}
                            >
                              {expandedRows[event.eventId] ? (
                                <>
                                  Hide <HiChevronUp className="ml-1" />
                                </>
                              ) : (
                                <>
                                  View <HiChevronDown className="ml-1" />
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedRows[event.eventId] && (
                          <tr>
                            <td colSpan={5} className="bg-red-50 px-4 py-3">
                              <div className="font-semibold mb-2 text-[#ed003f]">Feedbacks</div>
                              {feedbacks[event.eventId] && feedbacks[event.eventId].length > 0 ? (
                                <ul className="space-y-2">
                                  {feedbacks[event.eventId].map((fb, idx) => (
                                    <li key={fb._id || idx} className="border-b border-gray-100 pb-2">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-[#ed003f]">
                                          {fb.userId?.fname || 'User'}
                                        </span>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <HiStar
                                            key={star}
                                            className={`inline-block text-yellow-400 text-sm ${star <= fb.rating ? '' : 'opacity-30'}`}
                                          />
                                        ))}
                                        <span className="ml-1 text-xs text-gray-500">{fb.rating} / 5</span>
                                      </div>
                                      <div className="text-gray-700 text-sm">{fb.description}</div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="text-gray-400 text-sm">No feedback for this event yet.</div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TitleCard>
        </main>
      </div>
      <LeftSidebar />
      <RightSidebar />
      <ModalLayout />
    </div>
  );
};

export default EventFeedbackList;