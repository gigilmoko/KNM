import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  StarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import axios from 'axios';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';

const EventFeedbackList = () => {
  const [events, setEvents] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Fetch all feedback events (with average rating and event details)
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/event/feedback/all`, config);
        setEvents(data.data || []);
      } catch (err) {
        toast.error('Failed to load events.');
      }
    };

    // Fetch all feedbacks for all events (for dropdown details)
    const fetchAllFeedbacks = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/event/feedback/all`, config);
        // For each event, fetch its feedbacks
        const feedbackMap = {};
        await Promise.all(
          (data.data || []).map(async (event) => {
            try {
              const res = await axios.get(`${process.env.REACT_APP_API}/api/event/feedback/${event.eventId}`, config);
              feedbackMap[event.eventId] = res.data.data || [];
            } catch {
              feedbackMap[event.eventId] = [];
            }
          })
        );
        setFeedbacks(feedbackMap);
        setLoading(false);
      } catch (err) {
        toast.error('Failed to load feedbacks.');
        setLoading(false);
      }
    };

    fetchEvents().then(fetchAllFeedbacks);
  }, []);

  const toggleRow = (eventId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  // Filter and sort events
  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const matchesRating = filterRating === 'all' || 
        (filterRating === '4+' && (event.averageRating || 0) >= 4) ||
        (filterRating === '3+' && (event.averageRating || 0) >= 3) ||
        (filterRating === '2+' && (event.averageRating || 0) >= 2);
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        case 'date':
        default:
          return new Date(b.startDate || 0) - new Date(a.startDate || 0);
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
                  <ChatBubbleLeftRightIcon className="w-8 h-8" />
                  <h1 className="text-3xl font-bold">Event Feedback Dashboard</h1>
                </div>
                <p className="text-red-100 text-lg">
                  Monitor event performance and user satisfaction through comprehensive feedback analysis
                </p>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">{events.length}</div>
                    <div className="text-red-100 text-sm">Total Events</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">
                      {Object.values(feedbacks).reduce((acc, curr) => acc + curr.length, 0)}
                    </div>
                    <div className="text-red-100 text-sm">Total Feedback</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">
                      {events.length > 0 ? 
                        (events.reduce((acc, event) => acc + (event.averageRating || 0), 0) / events.length).toFixed(1) 
                        : '0.0'
                      }
                    </div>
                    <div className="text-red-100 text-sm">Average Rating</div>
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
                      placeholder="Search events..."
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
                    <option value="date">Date</option>
                    <option value="rating">Rating</option>
                    <option value="title">Name</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Events List */}
            {loading ? (
              <LoadingSkeleton />
            ) : filteredEvents.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterRating !== 'all' 
                    ? "Try adjusting your search or filter criteria." 
                    : "No events with feedback available yet."
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div key={event.eventId} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                    {/* Event Header */}
                    <div className="p-6">
                      <div className="flex items-center gap-6">
                        {/* Event Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border-2 border-[#ed003f]/20">
                            <img
                              src={event.image || '/assets/noimage.png'}
                              alt={event.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Event Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                                {event.title}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-4 h-4" />
                                  {event.startDate ? new Date(event.startDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  }) : 'No date'}
                                </div>
                                <div className="flex items-center gap-1">
                                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                  {feedbacks[event.eventId]?.length || 0} feedback{(feedbacks[event.eventId]?.length || 0) !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>

                            {/* Rating and Actions */}
                            <div className="flex flex-col items-end gap-3">
                              <div className="flex items-center gap-2">
                                <StarRating rating={event.averageRating || 0} />
                                <span className="text-sm font-semibold text-gray-700">
                                  {event.averageRating ? event.averageRating.toFixed(1) : '0.0'}
                                </span>
                              </div>
                              
                              <button
                                onClick={() => toggleRow(event.eventId)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  expandedRows[event.eventId]
                                    ? 'bg-[#ed003f] text-white hover:bg-red-600'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                <EyeIcon className="w-4 h-4" />
                                {expandedRows[event.eventId] ? 'Hide' : 'View'} Feedback
                                {expandedRows[event.eventId] ? (
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

                    {/* Expanded Feedback Section */}
                    {expandedRows[event.eventId] && (
                      <div className="border-t border-gray-100 bg-gray-50">
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-[#ed003f] mb-4 flex items-center gap-2">
                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            User Feedback ({feedbacks[event.eventId]?.length || 0})
                          </h4>
                          
                          {feedbacks[event.eventId] && feedbacks[event.eventId].length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                              {feedbacks[event.eventId].map((fb, idx) => (
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
                                          {fb.userId?.fname || 'Anonymous User'}
                                        </h5>
                                        <div className="flex items-center gap-2">
                                          <StarRating rating={fb.rating} size="w-3.5 h-3.5" />
                                          <span className="text-xs text-gray-500 font-medium">
                                            {fb.rating}/5
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-gray-700 text-sm leading-relaxed">
                                        {fb.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500">No feedback available for this event yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
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

export default EventFeedbackList;