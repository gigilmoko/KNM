import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import { HiArrowRight } from 'react-icons/hi';
import axios from 'axios';

const ProductFeedbackList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const fetchFeedbacks = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/feedback/product-list`, config);
        setFeedbacks(data.feedbacks);
      } catch (err) {
        toast.error('Failed to load feedbacks.');
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  useEffect(() => {
    const fetchProductNames = async () => {
      if (feedbacks.length > 0) {
        try {
          const productIds = [...new Set(feedbacks.map(({ productId }) => productId._id))];
          const productPromises = productIds.map(id =>
            axios.get(`${process.env.REACT_APP_API}/api/product/${id}`)
          );
          const productResponses = await Promise.all(productPromises);
          const productData = productResponses.map((response) => response.data.product);
          setProducts(productData);
          setLoading(false);
        } catch (err) {
          toast.error('Failed to load products.');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchProductNames();
  }, [feedbacks]);

  const getAverageRating = (productId) => {
    const productFeedbacks = feedbacks.filter((feedback) => feedback.productId._id === productId);
    if (productFeedbacks.length === 0) return 0;
    const totalRating = productFeedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return (totalRating / productFeedbacks.length).toFixed(1);
  };

  const getNumberOfReviews = (productId) => {
    return feedbacks.filter((feedback) => feedback.productId._id === productId).length;
  };

  const handleNavigateToProductFeedback = (productId) => {
    navigate(`/admin/product/feedback/list/${productId}`);
  };

  return (
    <div className="drawer lg:drawer-open">
      <ToastContainer />
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto px-2 sm:px-6 bg-base-200">
          <TitleCard title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>Product Ratings</span>}>
            {loading ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <p>No products available.</p>
            ) : (
              <div className="flex flex-wrap gap-4 justify-center mt-2">
                {products.map(({ _id, name, images }) => (
                  <div
                    key={_id}
                    className="flex flex-col w-full sm:w-[350px] md:w-[320px] bg-white border border-[#ed003f] rounded-lg shadow-md hover:shadow-lg transition mb-4"
                    style={{ minHeight: 180 }}
                  >
                    <div className="flex flex-col sm:flex-row items-center p-4">
                      {images[0] && (
                        <img
                          src={images[0].url}
                          alt={name}
                          className="w-20 h-20 object-cover rounded-md border-2 border-[#ed003f] mb-2 sm:mb-0 sm:mr-4"
                        />
                      )}
                      <div className="flex-1 w-full">
                        <h3 className="text-base sm:text-lg font-bold text-[#ed003f] mb-1">{name}</h3>
                        <p className="text-[#ed003f] text-xs sm:text-sm font-semibold mb-1">
                          Average Rating: <span className="font-bold">{getAverageRating(_id)}</span>
                        </p>
                        <p className="text-gray-500 text-xs sm:text-sm">
                          Number of Reviews: {getNumberOfReviews(_id)}
                        </p>
                      </div>
                    </div>
                    <button
                      className="flex items-center justify-center w-full border-t border-[#ed003f] py-2 text-[#ed003f] hover:bg-[#ed003f] hover:text-white transition rounded-b-lg"
                      onClick={() => handleNavigateToProductFeedback(_id)}
                    >
                      <span className="text-xs font-semibold mr-1">View Feedback</span>
                      <HiArrowRight className="text-lg" />
                    </button>
                  </div>
                ))}
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

export default ProductFeedbackList;