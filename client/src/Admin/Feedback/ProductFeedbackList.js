import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { HiChevronDown, HiChevronUp, HiStar } from 'react-icons/hi';
import axios from 'axios';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';

const ProductFeedbackList = () => {
  const [products, setProducts] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Fetch all products
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/product/all`, config);
        setProducts(data.products || []);
      } catch (err) {
        toast.error('Failed to load products.');
        setLoading(false);
      }
    };

    // Fetch all feedbacks
    const fetchFeedbacks = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/feedback/product-list`, config);
        setFeedbacks(data.feedbacks || []);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load feedbacks.');
        setLoading(false);
      }
    };

    fetchProducts();
    fetchFeedbacks();
  }, []);

  const getFeedbacksForProduct = (productId) => {
    return feedbacks.filter(
      (feedback) => feedback.productId && feedback.productId._id === productId
    );
  };

  const getAverageRating = (productId) => {
    const productFeedbacks = getFeedbacksForProduct(productId);
    if (productFeedbacks.length === 0) return 0;
    const totalRating = productFeedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return (totalRating / productFeedbacks.length).toFixed(1);
  };

  const toggleRow = (productId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  return (
    <div className="drawer lg:drawer-open">
      <ToastContainer />
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto px-2 sm:px-6 bg-base-200">
          <TitleCard title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>Product Items, Ratings & Feedbacks</span>}>
            {loading ? (
              <p>Loading products...</p>
            ) : products.length === 0 ? (
              <p>No products available.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-[#ed003f] rounded-lg shadow">
                  <thead>
                    <tr className="bg-[#ed003f] text-white">
                      <th className="py-2 px-4 text-left">Product</th>
                      <th className="py-2 px-4 text-left">Image</th>
                      <th className="py-2 px-4 text-left">Price</th>
                      <th className="py-2 px-4 text-left">Average Rating</th>
                      <th className="py-2 px-4 text-left">Reviews</th>
                      <th className="py-2 px-4 text-left">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const productFeedbacks = getFeedbacksForProduct(product._id);
                      const avgRating = getAverageRating(product._id);
                      return (
                        <React.Fragment key={product._id}>
                          <tr className="border-b border-[#ed003f]">
                            <td className="py-2 px-4 text-[#ed003f]">{product.name}</td>
                            <td className="py-2 px-4">
                              {product.images && product.images[0] && (
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded border-2 border-[#ed003f]"
                                />
                              )}
                            </td>
                            <td className="py-2 px-4 text-gray-700 font-semibold">
                              ₱{product.price?.toLocaleString() || 'N/A'}
                            </td>
                            <td className="py-2 px-4">
                              {avgRating > 0 ? (
                                <span className="flex items-center">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <HiStar
                                      key={star}
                                      className={`inline-block text-yellow-400 ${star <= Math.round(avgRating) ? '' : 'opacity-30'}`}
                                    />
                                  ))}
                                  <span className="ml-2 text-xs text-gray-700 font-semibold">{avgRating} / 5</span>
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400">No feedback yet</span>
                              )}
                            </td>
                            <td className="py-2 px-4">{productFeedbacks.length}</td>
                            <td className="py-2 px-4">
                              <button
                                className="flex items-center text-[#ed003f] font-semibold hover:underline"
                                onClick={() => toggleRow(product._id)}
                              >
                                {expandedRows[product._id] ? (
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
                          {expandedRows[product._id] && (
                            <tr>
                              <td colSpan={6} className="bg-red-50 px-4 py-3">
                                <div className="font-semibold mb-2 text-[#ed003f]">Feedbacks</div>
                                {productFeedbacks.length === 0 ? (
                                  <div className="text-gray-400 text-sm">No feedback for this item yet.</div>
                                ) : (
                                  <ul className="space-y-2">
                                    {productFeedbacks.map((fb, idx) => (
                                      <li key={fb._id || idx} className="border-b border-gray-100 pb-2">
                                        <div className="flex items-center gap-2 mb-1">
                                          <span className="font-semibold text-[#ed003f]">{fb.user?.fname || 'User'}</span>
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <HiStar
                                              key={star}
                                              className={`inline-block text-yellow-400 text-sm ${star <= fb.rating ? '' : 'opacity-30'}`}
                                            />
                                          ))}
                                          <span className="ml-1 text-xs text-gray-500">{fb.rating} / 5</span>
                                        </div>
                                        <div className="text-gray-700 text-sm">{fb.comment || fb.feedback}</div>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
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

export default ProductFeedbackList;