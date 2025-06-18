import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import Subtitle from '../../Layout/components/Typography/Subtitle';
import axios from 'axios';
import {
  Chart as ChartJS,
  Filler,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Filler);

const FeedbackList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [sortType, setSortType] = useState('rating-desc'); // rating-desc, rating-asc, date-desc, date-asc

  const handleSort = () => {
    let nextSort;
    if (sortType === 'rating-desc') nextSort = 'rating-asc';
    else if (sortType === 'rating-asc') nextSort = 'date-desc';
    else if (sortType === 'date-desc') nextSort = 'date-asc';
    else nextSort = 'rating-desc';
    setSortType(nextSort);

    let sorted = [...feedbacks];
    if (nextSort === 'rating-desc') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (nextSort === 'rating-asc') {
      sorted.sort((a, b) => a.rating - b.rating);
    } else if (nextSort === 'date-desc') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (nextSort === 'date-asc') {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    setFeedbacks(sorted);
  };

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(
          `${process.env.REACT_APP_API}/api/feedback/all`,
          config
        );
        let initial = response.data.feedbacks || [];
        // Default sort: rating-desc
        initial.sort((a, b) => b.rating - a.rating);
        setFeedbacks(initial);
      } catch (error) {
        toast.error('Failed to load feedbacks');
        console.error('Error fetching feedbacks:', error.response ? error.response.data : error);
      }
    };

    fetchFeedbacks();
  }, [dispatch]);

  // Prepare data for Doughnut chart
  const ratingCounts = [0, 0, 0, 0, 0];
  feedbacks.forEach((feedback) => {
    if (feedback.rating >= 1 && feedback.rating <= 5) {
      ratingCounts[feedback.rating - 1] += 1;
    }
  });

  const data = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Number of Feedbacks',
        data: ratingCounts,
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
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ed003f'
        }
      },
    },
    maintainAspectRatio: false,
  };

  // Button label logic
  let sortLabel = '';
  if (sortType === 'rating-desc') sortLabel = 'Sort: Rating ↓';
  else if (sortType === 'rating-asc') sortLabel = 'Sort: Rating ↑';
  else if (sortType === 'date-desc') sortLabel = 'Sort: Date ↓';
  else sortLabel = 'Sort: Date ↑';

  return (
    <>
      <div className="drawer lg:drawer-open">
        <ToastContainer />
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-2 sm:px-6 bg-base-200">
            <TitleCard title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>Feedback Ratings Distribution</span>}>
              <div className="flex justify-center items-center w-full">
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md" style={{ height: 300 }}>
                  <Doughnut options={options} data={data} />
                </div>
              </div>
            </TitleCard>
            <TitleCard
              title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>Feedback List</span>}
              topMargin="mt-2"
              TopSideButtons={
                <button
                  className="btn text-xs sm:text-sm"
                  style={{
                    color: "#ed003f",
                    border: "2px solid #ed003f",
                    background: "transparent",
                    fontWeight: "bold"
                  }}
                  onClick={handleSort}
                >
                  {sortLabel}
                </button>
              }
            >
              <div className="overflow-x-auto w-full">
                <table className="table w-full text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 sm:px-4 py-2" style={{ color: '#ed003f' }}>Email</th>
                      <th className="px-2 sm:px-4 py-2" style={{ color: '#ed003f' }}>Feedback</th>
                      <th className="px-2 sm:px-4 py-2" style={{ color: '#ed003f' }}>Rating</th>
                      <th className="px-2 sm:px-4 py-2" style={{ color: '#ed003f' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">No feedback available.</td>
                      </tr>
                    ) : (
                      feedbacks.map((feedback) => (
                        <tr key={feedback._id}>
                          <td className="border px-2 sm:px-4 py-2 break-all">
                            {feedback?.userId?.email || 'No Email'}
                          </td>
                          <td className="border px-2 sm:px-4 py-2">{feedback.feedback}</td>
                          <td className="border px-2 sm:px-4 py-2" style={{ color: '#ed003f', fontWeight: 'bold' }}>{feedback.rating}</td>
                          <td className="border px-2 sm:px-4 py-2">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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

export default FeedbackList;