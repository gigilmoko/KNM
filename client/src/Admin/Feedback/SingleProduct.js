import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import axios from 'axios';
import { Bar } from 'react-chartjs-2'; // Import the bar chart library
import { Chart as ChartJS } from 'chart.js/auto';

const SingleProduct = () => {
  const { productId } = useParams();  // Get the productId from the URL
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [product, setProduct] = useState(null); // State for storing product details

  // Fetch the product feedbacks and details
  useEffect(() => {
    console.log('Product ID:', productId);  // Log productId to check if it's being fetched correctly

    const fetchProductDetails = async () => {
      try {
        const productUrl = `${process.env.REACT_APP_API}/api/product/${productId}`;
        console.log('Fetching product details from URL:', productUrl);  // Log the URL being used
        
        const { data } = await axios.get(productUrl);
        console.log('Fetched product details:', data);  // Log the entire product object
        
        if (data && data.product) {
          setProduct(data.product); // Store product data if the correct structure is found
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
        const feedbackUrl = `${process.env.REACT_APP_API}/api/feedback/product/${productId}`;
        console.log('Fetching feedback from URL:', feedbackUrl);  // Log the URL being used
        
        const { data } = await axios.get(feedbackUrl);
        console.log('Fetched feedbacks:', data);  // Log the feedbacks array
        
        if (data.feedbacks) {
          setFeedbacks(data.feedbacks);
        } else {
          toast.error('No feedbacks available.');
        }
      } catch (err) {
        toast.error('Failed to load feedbacks.');
        console.error('Error:', err.response || err.message);
      }
    };

    if (productId) {
      fetchProductDetails(); // Fetch product details
      fetchFeedbacks(); // Fetch product feedbacks
    }
  }, [productId]);

  // Calculate average rating
  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  // Rating distribution for the bar chart (assuming ratings are 1-5)
  const ratingDistribution = [0, 0, 0, 0, 0]; // Initialize an array for ratings 1-5
  feedbacks.forEach(feedback => {
    if (feedback.rating >= 1 && feedback.rating <= 5) {
      ratingDistribution[feedback.rating - 1] += 1;
    }
  });

  // Bar chart data
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
          {/* Product Details Card */}
          <TitleCard title="Product Details">
            <div className="flex flex-col lg:flex-row space-x-6">
              {/* Left section: Product Image and Info */}
              <div className="flex-1 mb-6 lg:mb-0">
                {product ? (
                  <>
                    <div className="flex items-center space-x-4">
                      {/* Product image */}
                      <div className="flex-shrink-0">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-52 h-52 object-cover"
                          />
                        ) : (
                          <p>No image available for this product.</p>
                        )}
                      </div>

                      {/* Product details */}
                      <div>
                        <h2 className="text-2xl font-bold">{product.name || 'No Name Available'}</h2>
                        <p><strong>Reviews:</strong> {feedbacks.length} reviews</p>
                        <p><strong>Average Rating:</strong> {averageRating}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p>Loading product details...</p>
                )}
              </div>

              {/* Right section: Rating Distribution Bar Chart */}
              <div className="w-full lg:w-1/3">
                <h3 className="text-xl font-semibold">Rating Distribution</h3>
                <div className="h-64">
                  <Bar data={barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </div>
          </TitleCard>

          {/* Product Feedback */}
          <TitleCard title="Product Feedback">
            {feedbacks.length > 0 ? (
              <ul className="space-y-4">
                {feedbacks.map((feedback) => (
                  <li key={feedback._id} className="p-4 border rounded-md shadow-md">
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
