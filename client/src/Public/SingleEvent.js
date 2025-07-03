import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';
import axios from 'axios';
import { HiCalendar, HiLocationMarker, HiUsers, HiClock, HiArrowLeft, HiShare, HiHeart } from "react-icons/hi";
import Loading from '../Layout/Loader';

const SingleEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    // Trigger animation after component mounts
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/calendar/event/${id}`);
        console.log('Fetched Event:', data);
        if (data.success) {
          setEvent(data.data);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    }
  };

  const getDaysUntilEvent = () => {
    const eventDate = new Date(event.startDate);
    const today = new Date();
    const diffTime = eventDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}`}>
      <HeaderPublic />
      
      <main className="min-h-screen">
        {loading ? (
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loading />
          </div>
        ) : event ? (
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Hero Section with Image */}
            <section className="relative h-[60vh] overflow-hidden">
              <div className="absolute inset-0">
                <img
                  src={event.image || "https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png"}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              </div>
              
              {/* Hero Content */}
              <div className="relative z-10 flex flex-col justify-end h-full p-6 md:p-12">
                <div className="max-w-7xl mx-auto w-full">
                  {/* Back Button */}
                  <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full hover:bg-white/30 transition-all duration-300 mb-6"
                  >
                    <HiArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  
                  {/* Event Status Badge */}
                  {event.startDate && (
                    <div className="mb-4">
                      {getDaysUntilEvent() > 0 ? (
                        <span className="inline-block bg-[#df1f47] text-white px-4 py-2 rounded-full text-sm font-semibold">
                          {getDaysUntilEvent()} days to go
                        </span>
                      ) : getDaysUntilEvent() === 0 ? (
                        <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                          Today!
                        </span>
                      ) : (
                        <span className="inline-block bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                          Past Event
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Event Title */}
                  <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                    {event.title}
                  </h1>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/30 transition-all duration-300"
                    >
                      <HiShare className="w-4 h-4" />
                      Share Event
                    </button>
                    <button
                      onClick={() => setIsFavorited(!isFavorited)}
                      className={`flex items-center gap-2 backdrop-blur-sm px-6 py-3 rounded-full transition-all duration-300 ${
                        isFavorited 
                          ? 'bg-[#df1f47] text-white' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <HiHeart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                      {isFavorited ? 'Favorited' : 'Add to Favorites'}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Event Details Section */}
            <section className="px-4 py-12 md:py-16">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content */}
                  <div className="lg:col-span-2">
                    <div className={`rounded-3xl shadow-xl p-6 md:p-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-[#df1f47] mb-4">
                          About This Event
                        </h2>
                        <div className="w-16 h-1 bg-[#df1f47] rounded-full mb-6"></div>
                        <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                          {event.description || "Join us for this exciting event that brings our community together!"}
                        </p>
                      </div>

                      {/* Event Highlights */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-[#df1f47]/5 rounded-2xl">
                          <h3 className="font-semibold text-[#df1f47] mb-2">Community Impact</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            This event supports our mission of empowering women in Manila
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                          <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Networking</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Connect with like-minded individuals and expand your network
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="lg:col-span-1">
                    <div className={`rounded-3xl shadow-xl p-6 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} sticky top-6`}>
                      <h3 className="text-xl font-bold text-[#df1f47] mb-6">Event Details</h3>
                      
                      <div className="space-y-6">
                        {/* Start Date & Time */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-[#df1f47]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <HiCalendar className="text-[#df1f47] text-xl" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Start Date</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {formatDate(event.startDate).date}
                            </p>
                            <p className="text-[#df1f47] font-semibold text-sm">
                              {formatDate(event.startDate).time}
                            </p>
                          </div>
                        </div>

                        {/* End Date & Time */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <HiClock className="text-purple-600 text-xl" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">End Date</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {formatDate(event.endDate).date}
                            </p>
                            <p className="text-purple-600 font-semibold text-sm">
                              {formatDate(event.endDate).time}
                            </p>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <HiLocationMarker className="text-green-600 text-xl" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Location</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {event.location || "Location to be announced"}
                            </p>
                          </div>
                        </div>

                        {/* Audience */}
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                            <HiUsers className="text-blue-600 text-xl" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Audience</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                              {event.audience === "all" ? "Open to everyone" : "Members only"}
                            </p>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                              event.audience === "all" 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}>
                              {event.audience === "all" ? "Public Event" : "Exclusive Event"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                        <button
                          onClick={() => navigate('/blog')}
                          className="w-full bg-[#df1f47] text-white py-3 px-6 rounded-2xl font-semibold hover:bg-[#c0183d] transform hover:scale-105 transition-all duration-300 shadow-lg"
                        >
                          View More Events
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Related Events Section */}
            <section className="px-4 py-12 bg-gray-50 dark:bg-gray-800">
              <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-[#df1f47] mb-4">
                  Discover More Events
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Stay connected with our community through upcoming events and activities
                </p>
                <button
                  onClick={() => navigate('/blog')}
                  className="inline-flex items-center gap-2 bg-[#df1f47] text-white px-8 py-4 rounded-2xl font-semibold hover:bg-[#c0183d] transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <HiCalendar className="w-5 h-5" />
                  Browse All Events
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <HiCalendar className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-2">
              Event Not Found
            </h2>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              The event you're looking for doesn't exist or may have been removed.
            </p>
            <button
              onClick={() => navigate('/blog')}
              className="bg-[#df1f47] text-white px-6 py-3 rounded-2xl font-semibold hover:bg-[#c0183d] transition-all duration-300"
            >
              Back to Events
            </button>
          </div>
        )}
      </main>
      
      <FooterPublic />
    </div>
  );
};

export default SingleEvent;