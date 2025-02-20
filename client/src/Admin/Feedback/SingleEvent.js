import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';

const SingleEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [event, setEvent] = useState(null);
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    console.log('Event ID:', eventId);

    const fetchEventDetails = async () => {
        try {
          const token = sessionStorage.getItem("token");
          const eventUrl = `${process.env.REACT_APP_API}/api/calendar/event/${eventId}`;
          const { data } = await axios.get(eventUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
      
          console.log('Fetched event details:', data);
      
          // Change from `data.event` to `data.data` (based on your API response)
          if (data && data.data) {
            setEvent(data.data);
          } else {
            toast.error('Event not found.');
          }
        } catch (err) {
          toast.error('Failed to load event details.');
          console.error('Error:', err.response || err.message);
        }
      };
      

    const fetchFeedbacks = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const feedbackUrl = `${process.env.REACT_APP_API}/api/event/feedback/${eventId}`;
        const { data } = await axios.get(feedbackUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched feedbacks:', data);
        if (data.data) {
          setFeedbacks(data.data);
          fetchUserNames(data.data);
        } else {
          toast.error('No feedbacks available.');
        }
      } catch (err) {
        toast.error('Failed to load feedbacks.');
        console.error('Error:', err.response || err.message);
      }
    };

    if (eventId) {
      fetchEventDetails();
      fetchFeedbacks();
    }
  }, [eventId]);

  const fetchUserNames = async (feedbackList) => {
    const userIds = [...new Set(feedbackList.map(fb => fb.userId))];
    const names = { ...userNames };
    const token = sessionStorage.getItem("token");

    await Promise.all(userIds.map(async (id) => {
      if (!names[id]) {
        try {
          const { data } = await axios.get(`${process.env.REACT_APP_API}/api/get-user/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('Fetched user:', data);
          if (data.success) {
            names[id] = `${data.user.fname} ${data.user.middlei}. ${data.user.lname}`.trim();
          }
        } catch (err) {
          console.error(`Error fetching user ${id}:`, err.message);
          names[id] = 'Unknown User';
        }
      }
    }));

    setUserNames(names);
  };

  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  const ratingDistribution = [0, 0, 0, 0, 0];
  feedbacks.forEach(feedback => {
    if (feedback.rating >= 1 && feedback.rating <= 5) {
      ratingDistribution[feedback.rating - 1] += 1;
    }
  });

  const barChartData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Number of Reviews',
        data: ratingDistribution,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="drawer lg:drawer-open">
      <ToastContainer />
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 bg-base-200">
          <TitleCard title="Event Details">
            <div className="flex flex-col lg:flex-row space-x-6">
              <div className="flex-1 mb-6 lg:mb-0">
                {event ? (
                  <div>
                    <h2 className="text-2xl font-bold">{event.title || 'No Title Available'}</h2>
                    <p><strong>Description:</strong> {event.description || 'No description available'}</p>
                    <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                  </div>
                ) : (
                  <p>Loading event details...</p>
                )}
              </div>
              <div className="w-full lg:w-1/3">
                <h3 className="text-xl font-semibold">Rating Distribution</h3>
                <div className="h-64">
                  <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </TitleCard>

          <TitleCard title="Event Feedback">
            {feedbacks.length > 0 ? (
              <ul className="space-y-4">
                {feedbacks.map((feedback) => (
                  <li key={feedback._id} className="p-4 border rounded-md shadow-md">
                    <p><strong>{userNames[feedback.userId] || 'Loading...'}</strong></p>
                    <p>{feedback.description}</p>
                    <p className="text-gray-500">Rating: {feedback.rating}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No feedback available for this event.</p>
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

export default SingleEvent;
