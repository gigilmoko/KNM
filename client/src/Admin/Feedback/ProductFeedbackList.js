import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  StarIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import Header from '../../Layout/Header';

const ProductFeedbackList = () => {
  const [products, setProducts] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('name');

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
    return (totalRating / productFeedbacks.length);
  };

  const toggleRow = (productId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const avgRating = getAverageRating(product._id);
      const matchesRating = filterRating === 'all' || 
        (filterRating === '4+' && avgRating >= 4) ||
        (filterRating === '3+' && avgRating >= 3) ||
        (filterRating === '2+' && avgRating >= 2) ||
        (filterRating === 'no-rating' && avgRating === 0);
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return getAverageRating(b._id) - getAverageRating(a._id);
        case 'price':
          return (b.price || 0) - (a.price || 0);
        case 'reviews':
          return getFeedbacksForProduct(b._id).length - getFeedbacksForProduct(a._id).length;
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

  const StarRating = ({ rating, size = 'w-4 h-4' }) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          star <= Math.round(rating) ? (
            <StarIconSolid key={star} className={`${size} text-yellow-400`} />
          ) : (
            <StarIcon key={star} className={`${size} text-gray-300`} />
          )
        ))}
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="drawer lg:drawer-open">
      <ToastContainer />
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-[#ed003f] to-red-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <ShoppingBagIcon className="w-8 h-8" />
                  <h1 className="text-3xl font-bold">Product Feedback List</h1>
                </div>
                <p className="text-red-100 text-lg">
                  Track product performance and customer satisfaction through detailed reviews and ratings
                </p>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">{products.length}</div>
                    <div className="text-red-100 text-sm">Total Products</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">{feedbacks.length}</div>
                    <div className="text-red-100 text-sm">Total Reviews</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">
                      {products.length > 0 ? 
                        (products.reduce((acc, product) => acc + getAverageRating(product._id), 0) / products.length).toFixed(1) 
                        : '0.0'
                      }
                    </div>
                    <div className="text-red-100 text-sm">Average Rating</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">
                      {products.filter(product => getFeedbacksForProduct(product._id).length > 0).length}
                    </div>
                    <div className="text-red-100 text-sm">Products with Reviews</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  {/* Search */}
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ed003f] focus:border-transparent transition-all w-full sm:w-64"
                    />
                  </div>
                  
                  {/* Rating Filter */}
                  <div className="relative">
                    <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={filterRating}
                      onChange={(e) => setFilterRating(e.target.value)}
                      className="pl-10 pr-8 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ed003f] focus:border-transparent transition-all appearance-none bg-white"
                    >
                      <option value="all">All Ratings</option>
                      <option value="4+">4+ Stars</option>
                      <option value="3+">3+ Stars</option>
                      <option value="2+">2+ Stars</option>
                      <option value="no-rating">No Reviews</option>
                    </select>
                  </div>
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#ed003f] focus:border-transparent transition-all text-sm"
                  >
                    <option value="name">Name</option>
                    <option value="rating">Rating</option>
                    <option value="price">Price</option>
                    <option value="reviews">Reviews</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products List */}
            {loading ? (
              <LoadingSkeleton />
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterRating !== 'all' 
                    ? "Try adjusting your search or filter criteria." 
                    : "No products available yet."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const productFeedbacks = getFeedbacksForProduct(product._id);
                  const avgRating = getAverageRating(product._id);
                  
                  return (
                    <div key={product._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                      {/* Product Header */}
                      <div className="p-6">
                        <div className="flex items-center gap-6">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border-2 border-[#ed003f]/20">
                              <img
                                src={product.images?.[0]?.url || '/assets/noimage.png'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                                  {product.name}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                  <div className="flex items-center gap-1">
                                    <CurrencyDollarIcon className="w-4 h-4" />
                                    ₱{product.price?.toLocaleString() || 'N/A'}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                    {productFeedbacks.length} review{productFeedbacks.length !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              </div>

                              {/* Rating and Actions */}
                              <div className="flex flex-col items-end gap-3">
                                <div className="flex items-center gap-2">
                                  {avgRating > 0 ? (
                                    <>
                                      <StarRating rating={avgRating} />
                                      <span className="text-sm font-semibold text-gray-700">
                                        {avgRating.toFixed(1)}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-sm text-gray-400">No reviews yet</span>
                                  )}
                                </div>
                                
                                <button
                                  onClick={() => toggleRow(product._id)}
                                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                    expandedRows[product._id]
                                      ? 'bg-[#ed003f] text-white hover:bg-red-600'
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  }`}
                                >
                                  <EyeIcon className="w-4 h-4" />
                                  {expandedRows[product._id] ? 'Hide' : 'View'} Reviews
                                  {expandedRows[product._id] ? (
                                    <ChevronUpIcon className="w-4 h-4" />
                                  ) : (
                                    <ChevronDownIcon className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Reviews Section */}
                      {expandedRows[product._id] && (
                        <div className="border-t border-gray-100 bg-gray-50">
                          <div className="p-6">
                            <h4 className="text-lg font-semibold text-[#ed003f] mb-4 flex items-center gap-2">
                              <ChatBubbleLeftRightIcon className="w-5 h-5" />
                              Customer Reviews ({productFeedbacks.length})
                            </h4>
                            
                            {productFeedbacks.length > 0 ? (
                              <div className="space-y-4 max-h-96 overflow-y-auto">
                                {productFeedbacks.map((fb, idx) => (
                                  <div key={fb._id || idx} className="bg-white rounded-lg p-4 border border-gray-200">
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-[#ed003f]/10 flex items-center justify-center">
                                          <UserCircleIcon className="w-6 h-6 text-[#ed003f]" />
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                          <h5 className="font-medium text-gray-900">
                                            {fb.user?.fname || 'Anonymous Customer'}
                                          </h5>
                                          <div className="flex items-center gap-2">
                                            <StarRating rating={fb.rating} size="w-3.5 h-3.5" />
                                            <span className="text-xs text-gray-500 font-medium">
                                              {fb.rating}/5
                                            </span>
                                          </div>
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                          {fb.comment || fb.feedback}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No reviews available for this product yet.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
      <LeftSidebar />
      <RightSidebar />
      <ModalLayout />
    </div>
  );
};

export default ProductFeedbackList;