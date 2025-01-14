import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import { HiArrowRight } from 'react-icons/hi';  // Add the right arrow icon
import axios from 'axios';

const ProductFeedbackList = () => {
  const navigate = useNavigate();  // Use the navigate hook
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
        console.log('Feedbacks fetched:', data.feedbacks); // Log feedbacks data
        setFeedbacks(data.feedbacks);
      } catch (err) {
        toast.error('Failed to load feedbacks.');
        console.error(err);
      }
    };

    fetchFeedbacks();
  }, []);

  useEffect(() => {
    const fetchProductNames = async () => {
      if (feedbacks.length > 0) {
        try {
          console.log('Fetching products for feedbacks:', feedbacks);
          const productIds = [...new Set(feedbacks.map(({ productId }) => productId._id))];
          console.log('Product IDs:', productIds);
    
          const productPromises = productIds.map(id =>
            axios.get(`${process.env.REACT_APP_API}/api/product/${id}`)
          );
          const productResponses = await Promise.all(productPromises);
          const productData = productResponses.map((response) => response.data.product);
          console.log('Product data:', productData);
    
          setProducts(productData);
          setLoading(false); // Set loading to false once products are fetched
        } catch (err) {
          toast.error('Failed to load products.');
          console.error(err);
          setLoading(false); // Ensure loading is set to false even if an error occurs
        }
      }
    };
    
    fetchProductNames();
  }, [feedbacks]);

  // Calculate average ratings for each product
  const getAverageRating = (productId) => {
    const productFeedbacks = feedbacks.filter((feedback) => feedback.productId._id === productId);
    if (productFeedbacks.length === 0) return 0;

    const totalRating = productFeedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return (totalRating / productFeedbacks.length).toFixed(1);
  };

  // Calculate number of reviews for each product
  const getNumberOfReviews = (productId) => {
    const productFeedbacks = feedbacks.filter((feedback) => feedback.productId._id === productId);
    return productFeedbacks.length;
  };

  // Handle navigation when the arrow icon is clicked
  const handleNavigateToProductFeedback = (productId) => {
    navigate(`/admin/product/feedback/list/${productId}`);
  };

  console.log('Products:', products); // Log products data

  return (
    <div className="drawer lg:drawer-open">
      <ToastContainer />
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto px-6 bg-base-200">
          <TitleCard title="Product Ratings">
            {loading ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <p>No products available.</p>
            ) : (
              <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
                {products.map(({ _id, name, images }) => (
                  <div key={_id} className="p-4 border rounded-md shadow-lg flex items-center justify-between">
                    <div className="flex items-center">
                      {images[0] && (
                        <img 
                          src={images[0].url} 
                          alt={name} 
                          className="w-20 h-20 object-cover rounded-md mr-4" 
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold">{name}</h3>
                        <p className="text-gray-500">Average Rating: {getAverageRating(_id)}</p>
                        <p className="text-gray-500">Number of Reviews: {getNumberOfReviews(_id)}</p>
                      </div>
                    </div>
                    <HiArrowRight 
                      className="text-gray-500 text-xl cursor-pointer" 
                      onClick={() => handleNavigateToProductFeedback(_id)} // Add onClick handler
                    />
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
