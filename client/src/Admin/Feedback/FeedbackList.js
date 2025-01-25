import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify'; // Importing toast
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
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortByDate, setSortByDate] = useState('desc'); // New state for date sorting

  const toggleSortOrder = () => {
    const sortedFeedbacks = [...feedbacks].sort((a, b) =>
      sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating
    );
    setFeedbacks(sortedFeedbacks);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const toggleSortByDate = () => {
    const sortedFeedbacks = [...feedbacks].sort((a, b) =>
      sortByDate === 'desc'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );
    setFeedbacks(sortedFeedbacks);
    setSortByDate(sortByDate === 'desc' ? 'asc' : 'desc');
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
        setFeedbacks(response.data.feedbacks);
        console.log('Feedbacks:', response.data.feedbacks);
      } catch (error) {
        toast.error('Failed to load feedbacks');
        console.error('Error fetching feedbacks:', error.response ? error.response.data : error);
      }
    };

    fetchFeedbacks();
  }, [dispatch]);

  // Prepare data for Doughnut chart
  const ratingCounts = [0, 0, 0, 0, 0]; // Counts for 1, 2, 3, 4, 5 ratings
  feedbacks.forEach((feedback) => {
    if (feedback.rating >= 1 && feedback.rating <= 5) {
      ratingCounts[feedback.rating - 1] += 1; // Increment the count for the rating
    }
  });

  const data = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Number of Feedbacks',
        data: ratingCounts,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
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
      },
    },
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <ToastContainer />
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200">
            <TitleCard title="Feedback Ratings Distribution">
              <div className="flex justify-center" style={{ width: '300px', height: '300px' }}>
                <Doughnut options={options} data={data} />
              </div>
            </TitleCard>
            <TitleCard
              title="Feedback List"
              topMargin="mt-2"
              TopSideButtons={
                <div className="flex items-center space-x-2">
                  <button
                    className="btn btn-primary"
                    onClick={toggleSortOrder}
                  >
                    {sortOrder === 'asc' ? 'Sort by Rating Descending' : 'Sort by Rating Ascending'}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={toggleSortByDate}
                  >
                    {sortByDate === 'desc' ? 'Sort by Date Ascending' : 'Sort by Date Descending'}
                  </button>
                </div>
              }
            >
              <div className="grid grid-cols-1 gap-6">
                {feedbacks.length === 0 ? (
                  <p>No feedback available.</p>
                ) : (
                  <div>
                    {/* Doughnut chart displaying ratings distribution */}
                    <table className="table-auto w-full mt-6">
                      <thead>
                        <tr>
                          <th className="px-4 py-2">Email</th>
                          <th className="px-4 py-2">Feedback</th>
                          <th className="px-4 py-2">Rating</th>
                          <th className="px-4 py-2">Date</th> {/* Added Date column */}
                        </tr>
                      </thead>
                      <tbody>
                        {feedbacks.map((feedback) => (
                          <tr key={feedback._id}>
                         {feedback?.userId?.email ? (
  <td className="border px-4 py-2">{feedback.userId.email}</td>
) : (
  <td className="border px-4 py-2">No Email</td>
)}
                            <td className="border px-4 py-2">{feedback.feedback}</td>
                            <td className="border px-4 py-2">{feedback.rating}</td>
                            <td className="border px-4 py-2">
                              {new Date(feedback.createdAt).toLocaleDateString()} {/* Display date */}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
