import React, { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import Header from '../../Layout/Header';
import SearchBar from '../../Layout/components/Input/SearchBar';
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
import { FunnelIcon, ChartPieIcon, StarIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';

ChartJS.register(ArcElement, Tooltip, Legend, Filler);

const FeedbackList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const mainContentRef = useRef(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [sortType, setSortType] = useState('rating-desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mainContentRef.current?.scroll({
      top: 0,
      behavior: "smooth"
    });
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    applySearch(searchText);
  }, [searchText, feedbacks]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
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
      setFilteredFeedbacks(initial);
    } catch (error) {
      toast.error('Failed to load feedbacks');
      console.error('Error fetching feedbacks:', error.response ? error.response.data : error);
      setFeedbacks([]);
      setFilteredFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const applySearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    const filtered = feedbacks.filter(feedback =>
      feedback?.userId?.email?.toLowerCase().includes(lowercasedValue) ||
      feedback?.feedback?.toLowerCase().includes(lowercasedValue) ||
      feedback?.rating?.toString().includes(lowercasedValue)
    );
    setFilteredFeedbacks(filtered);
  };

  const handleSort = () => {
    let nextSort;
    if (sortType === 'rating-desc') nextSort = 'rating-asc';
    else if (sortType === 'rating-asc') nextSort = 'date-desc';
    else if (sortType === 'date-desc') nextSort = 'date-asc';
    else nextSort = 'rating-desc';
    setSortType(nextSort);

    let sorted = [...filteredFeedbacks];
    if (nextSort === 'rating-desc') {
      sorted.sort((a, b) => b.rating - a.rating);
    } else if (nextSort === 'rating-asc') {
      sorted.sort((a, b) => a.rating - b.rating);
    } else if (nextSort === 'date-desc') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (nextSort === 'date-asc') {
      sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    setFilteredFeedbacks(sorted);
  };

  // Calculate statistics
  const totalFeedbacks = feedbacks.length;
  const averageRating = feedbacks.length > 0 
    ? (feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

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
        position: 'bottom',
        labels: {
          color: '#ed003f',
          padding: 20,
          usePointStyle: true,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed * 100) / total).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  // Button label logic
  let sortLabel = '';
  if (sortType === 'rating-desc') sortLabel = 'Rating ↓';
  else if (sortType === 'rating-asc') sortLabel = 'Rating ↑';
  else if (sortType === 'date-desc') sortLabel = 'Date ↓';
  else sortLabel = 'Date ↑';

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="drawer lg:drawer-open">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto pt-4 px-4 sm:px-6 bg-base-200" ref={mainContentRef}>
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#ed003f]">
                  <h1 className="text-3xl font-bold text-[#ed003f] mb-2 flex items-center">
                    <FunnelIcon className="w-8 h-8 mr-3" />
                    Feedback Analytics
                  </h1>
                  <p className="text-gray-600">Monitor customer satisfaction and feedback trends.</p>
                </div>
              </div>

              {/* Statistics Cards */}
              {feedbacks.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Feedbacks</p>
                        <p className="text-2xl font-bold text-gray-900">{totalFeedbacks}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FunnelIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Average Rating</p>
                        <p className="text-2xl font-bold text-gray-900">{averageRating} / 5</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <StarIcon className="w-6 h-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Positive Ratings</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {ratingCounts[3] + ratingCounts[4]} ({totalFeedbacks > 0 ? (((ratingCounts[3] + ratingCounts[4]) / totalFeedbacks) * 100).toFixed(1) : 0}%)
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <ChartPieIcon className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chart Section */}
              {feedbacks.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                  <div className="bg-gradient-to-r from-[#ed003f] to-red-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white flex items-center">
                      <ChartPieIcon className="w-6 h-6 mr-2" />
                      Rating Distribution
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-center items-center w-full">
                      <div className="w-full max-w-md" style={{ height: 400 }}>
                        <Doughnut options={options} data={data} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Feedback List */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">All Feedback</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {loading ? 'Loading...' : `${filteredFeedbacks.length} of ${feedbacks.length} feedbacks`}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      <div className="flex-1 lg:flex-none lg:w-80">
                        <SearchBar
                          searchText={searchText}
                          setSearchText={setSearchText}
                          styleClass="w-full"
                          inputProps={{
                            placeholder: "Search by email, feedback, or rating...",
                            className: "input input-bordered w-full focus:ring-2 focus:ring-[#ed003f] focus:border-[#ed003f]"
                          }}
                        />
                      </div>
                      <button
                        className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition-colors flex items-center gap-2"
                        onClick={handleSort}
                      >
                        <FunnelIcon className="w-4 h-4" />
                        Sort: {sortLabel}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="flex items-center gap-3">
                        <div className="loading loading-spinner loading-md text-[#ed003f]"></div>
                        <span className="text-gray-600">Loading feedback...</span>
                      </div>
                    </div>
                  ) : filteredFeedbacks.length > 0 ? (
                    <table className="table w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-[#ed003f] font-semibold text-sm">Customer</th>
                          <th className="text-[#ed003f] font-semibold text-sm">Feedback</th>
                          <th className="text-[#ed003f] font-semibold text-sm">Rating</th>
                          <th className="text-[#ed003f] font-semibold text-sm">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFeedbacks.map((feedback) => (
                          <tr key={feedback._id} className="hover:bg-gray-50 transition-colors">
                            <td>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#ed003f] text-white rounded-full flex items-center justify-center">
                                  <UserIcon className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    {feedback?.userId?.email || 'Anonymous'}
                                  </div>
                                  <div className="text-sm text-gray-500">Customer</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="max-w-md">
                                <p className="text-gray-900 line-clamp-3">{feedback.feedback}</p>
                              </div>
                            </td>
                            <td>
                              {renderStars(feedback.rating)}
                            </td>
                            <td>
                              <div className="flex items-center text-gray-600">
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-16">
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FunnelIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchText ? 'No feedback found' : 'No feedback yet'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                          {searchText ? 
                            "Try adjusting your search terms" : 
                            "Feedback will appear here once customers start leaving reviews"
                          }
                        </p>
                        {searchText && (
                          <button
                            className="btn bg-gray-100 text-gray-700 border-none hover:bg-gray-200"
                            onClick={() => setSearchText("")}
                          >
                            Clear Search
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="h-16"></div>
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