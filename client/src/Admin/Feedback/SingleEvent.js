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
    const fetchEventDetails = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const eventUrl = `${process.env.REACT_APP_API}/api/calendar/event/${eventId}`;
        const { data } = await axios.get(eventUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data && data.data) {
          setEvent(data.data);
        } else {
          toast.error('Event not found.');
        }
      } catch (err) {
        toast.error('Failed to load event details.');
      }
    };

    const fetchFeedbacks = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const feedbackUrl = `${process.env.REACT_APP_API}/api/event/feedback/${eventId}`;
        const { data } = await axios.get(feedbackUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.data) {
          setFeedbacks(data.data);
          fetchUserNames(data.data);
        } else {
          toast.error('No feedbacks available.');
        }
      } catch (err) {
        toast.error('Failed to load feedbacks.');
      }
    };

    if (eventId) {
      fetchEventDetails();
      fetchFeedbacks();
    }
    // eslint-disable-next-line
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
          if (data.success) {
            names[id] = `${data.user.fname} ${data.user.middlei}. ${data.user.lname}`.trim();
          }
        } catch (err) {
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
        backgroundColor: [
          'rgba(237, 0, 63, 0.9)',
          'rgba(237, 0, 63, 0.7)',
          'rgba(237, 0, 63, 0.5)',
          'rgba(237, 0, 63, 0.3)',
          'rgba(237, 0, 63, 0.15)',
        ],
        borderColor: [
          'rgba(237, 0, 63, 1)',
          'rgba(237, 0, 63, 1)',
          'rgba(237, 0, 63, 1)',
          'rgba(237, 0, 63, 1)',
          'rgba(237, 0, 63, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: '#ed003f'
        }
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: { color: '#ed003f', font: { weight: 'bold' } },
        grid: { color: 'rgba(237,0,63,0.1)' }
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#ed003f', font: { weight: 'bold' } },
        grid: { color: 'rgba(237,0,63,0.1)' }
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="drawer lg:drawer-open">
      <ToastContainer />
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto px-2 sm:px-6 bg-base-200">
          <TitleCard title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>Event Details</span>}>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 mb-6 lg:mb-0">
                {event ? (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-[#ed003f] mb-2">{event.title || 'No Title Available'}</h2>
                    <p className="mb-1"><span className="font-semibold text-[#ed003f]">Description:</span> {event.description || 'No description available'}</p>
                    <p className="mb-1"><span className="font-semibold text-[#ed003f]">Date:</span> {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</p>
                    <p className="mb-1"><span className="font-semibold text-[#ed003f]">Average Rating:</span> {averageRating}</p>
                  </div>
                ) : (
                  <p>Loading event details...</p>
                )}
              </div>
              <div className="w-full lg:w-1/3">
                <h3 className="text-lg font-semibold text-[#ed003f] mb-2">Rating Distribution</h3>
                <div className="h-56 sm:h-64 bg-white rounded-lg p-2 border border-[#ed003f]">
                  <Bar data={barChartData} options={barOptions} />
                </div>
              </div>
            </div>
          </TitleCard>

          <TitleCard title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>Event Feedback</span>}>
            {feedbacks.length > 0 ? (
              <ul className="space-y-4">
                {feedbacks.map((feedback) => (
                  <li key={feedback._id} className="p-4 border border-[#ed003f] rounded-md shadow-md bg-white">
                    <p className="font-semibold text-[#ed003f]">{userNames[feedback.userId] || 'Loading...'}</p>
                    <p className="mb-1">{feedback.description}</p>
                    <p className="text-xs text-[#ed003f]">Rating: <span className="font-bold">{feedback.rating}</span></p>
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