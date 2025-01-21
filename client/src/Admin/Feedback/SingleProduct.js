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

const SingleProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [product, setProduct] = useState(null);
  const [userNames, setUserNames] = useState({}); // Store user names by userId

  useEffect(() => {
    console.log('Product ID:', productId);
  
    const fetchProductDetails = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const productUrl = `${process.env.REACT_APP_API}/api/product/${productId}`;
        const { data } = await axios.get(productUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Fetched product details:', data);
        if (data && data.product) {
          setProduct(data.product);
        } else {
          toast.error('Product not found.');
        }
      } catch (err) {
        toast.error('Failed to load product details.');
        console.error('Error:', err.response || err.message);
      }
    };
  
    const fetchFeedbacks = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const feedbackUrl = `${process.env.REACT_APP_API}/api/feedback/product/${productId}`;
        const { data } = await axios.get(feedbackUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Fetched feedbacks:', data);
        if (data.feedbacks) {
          setFeedbacks(data.feedbacks);
          fetchUserNames(data.feedbacks); // Fetch user names after loading feedbacks
        } else {
          toast.error('No feedbacks available.');
        }
      } catch (err) {
        toast.error('Failed to load feedbacks.');
        console.error('Error:', err.response || err.message);
      }
    };
  
    if (productId) {
      fetchProductDetails();
      fetchFeedbacks();
    }
  }, [productId]);
  
  // Function to fetch user names based on userId from feedbacks
  const fetchUserNames = async (feedbackList) => {
    const userIds = [...new Set(feedbackList.map(fb => fb.userId))]; // Remove duplicate userIds
    const names = { ...userNames };
    const token = sessionStorage.getItem("token");
  
    await Promise.all(userIds.map(async (id) => {
      if (!names[id]) {
        try {
          const { data } = await axios.get(`${process.env.REACT_APP_API}/api/get-user/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log('Fetched user:', data);
          if (data.success) {
            names[id] = `${data.user.fname} ${data.user.middlei}. ${data.user.lname}`.trim();
          }
        } catch (err) {
          console.error(`Error fetching user ${id}:`, err.message);
          names[id] = 'Unknown User'; // Default if fetch fails
        }
      }
    }));
  
    setUserNames(names);
  };

  // Calculate average rating
  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  // Rating distribution for bar chart
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
          <TitleCard title="Product Details">
            <div className="flex flex-col lg:flex-row space-x-6">
              <div className="flex-1 mb-6 lg:mb-0">
                {product ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {product.images && product.images[0] ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-52 h-52 object-cover"
                        />
                      ) : (
                        <p>No image available.</p>
                      )}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{product.name || 'No Name Available'}</h2>
                      <p><strong>Reviews:</strong> {feedbacks.length} reviews</p>
                      <p><strong>Average Rating:</strong> {averageRating}</p>
                    </div>
                  </div>
                ) : (
                  <p>Loading product details...</p>
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

          <TitleCard title="Product Feedback">
            {feedbacks.length > 0 ? (
              <ul className="space-y-4">
                {feedbacks.map((feedback) => (
                  <li key={feedback._id} className="p-4 border rounded-md shadow-md">
                    <p><strong>{userNames[feedback.userId] || 'Loading...'}</strong></p>
                    <p>{feedback.feedback}</p>
                    <p className="text-gray-500">Rating: {feedback.rating}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No feedback available for this product.</p>
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

export default SingleProduct;
