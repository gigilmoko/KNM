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

const ProductFeedbackList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get(`${process.env.REACT_APP_API}/api/feedback/all`, config);
        setFeedbacks(response.data.feedbacks);
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
            <TitleCard title="Event Feedback Ratings Distribution">
              <div className="flex justify-center" style={{ width: '300px', height: '300px' }}>
                <Doughnut options={options} data={data} />
              </div>
            </TitleCard>

            <TitleCard title="Event Feedback List" topMargin="mt-2">
              <div className="grid grid-cols-1 gap-6">
                {feedbacks.length === 0 ? (
                  <p>No feedback available.</p>
                ) : (
                  <div>
                    <table className="table-auto w-full mt-6">
                      <thead>
                        <tr>
                          <th className="px-4 py-2">Feedback</th>
                          <th className="px-4 py-2">Rating</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feedbacks.map((feedback) => (
                          <tr key={feedback._id}>
                            <td className="border px-4 py-2">{feedback.feedback}</td>
                            <td className="border px-4 py-2">{feedback.rating}</td>
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

export default ProductFeedbackList;
