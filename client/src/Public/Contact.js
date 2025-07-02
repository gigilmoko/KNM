import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';
import PhoneIcon from '@heroicons/react/24/solid/PhoneIcon';
import MapPinIcon from '@heroicons/react/24/solid/MapPinIcon';
import EnvelopeIcon from '@heroicons/react/24/solid/EnvelopeIcon';
import { FaFacebook, FaRegCalendarAlt, FaStar } from 'react-icons/fa';
import { StarIcon } from '@heroicons/react/24/outline';

const Contact = () => {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sent, setSent] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    name: '',
    email: '',
    feedback: '',
    rating: 0
  });

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData({ ...feedbackData, [name]: value });
  };

  const handleStarClick = (rating) => {
    setFeedbackData({ ...feedbackData, rating });
  };

  const validateForm = () => {
    if (!feedbackData.name.trim()) {
      toast.error('Name is required!');
      return false;
    }
    if (!feedbackData.email.trim()) {
      toast.error('Email is required!');
      return false;
    }
    if (!feedbackData.feedback.trim() || feedbackData.feedback.length < 5) {
      toast.error('Feedback must be at least 5 characters long!');
      return false;
    }
    if (feedbackData.rating === 0) {
      toast.error('Please select a rating!');
      return false;
    }
    return true;
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const token = sessionStorage.getItem('token');
    
    if (!token) {
      toast.error('Please log in to submit feedback');
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      await axios.post(
        `${process.env.REACT_APP_API}/api/feedback/new`, 
        {
          feedback: feedbackData.feedback,
          rating: feedbackData.rating
        }, 
        config
      );
      
      toast.success('Feedback submitted successfully!');
      setSent(true);
      
      // Reset form
      setFeedbackData({
        name: '',
        email: '',
        feedback: '',
        rating: 0
      });
      
    } catch (error) {
      console.error('Error submitting feedback:', error.response ? error.response.data : error);
      toast.error('Failed to submit feedback. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-base-200 text-black"} flex flex-col`}>
      <HeaderPublic />
      <ToastContainer position="top-right" />
      <div className="flex flex-1 flex-col items-center py-12 px-4">
        <div className="w-full max-w-6xl">
          {/* Responsive Two-Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Left Column - Contact Info & Business Hours */}
            <div className="flex flex-col gap-8">
              <div className={`p-8 rounded-2xl shadow-xl ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white"}`}>
                <h2 className="text-3xl font-bold mb-6 text-center text-[#df1f47]">Contact Information</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPinIcon className="h-8 w-8 text-[#df1f47]" />
                    <div>
                      <p className="font-bold">Address</p>
                      <p className="text-sm opacity-90">2325 Opalo, San Andres Bukid, Manila, 1017 Metro Manila</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <PhoneIcon className="h-8 w-8 text-[#df1f47]" />
                    <div>
                      <p className="font-bold">Phone</p>
                      <p className="text-sm opacity-90">(123) 456-7890</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <EnvelopeIcon className="h-8 w-8 text-[#df1f47]" />
                    <div>
                      <p className="font-bold">Email</p>
                      <a href="mailto:info@domain.com" className="text-blue-400 hover:underline text-sm">
                        info@domain.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <FaFacebook className="h-8 w-8 text-[#df1f47]" />
                    <div>
                      <p className="font-bold">Facebook</p>
                      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
                        @OurBusiness
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`p-8 rounded-2xl shadow-xl ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <FaRegCalendarAlt className="text-[#df1f47] text-3xl" />
                  <h2 className="text-2xl font-bold text-[#df1f47]">Business Hours</h2>
                </div>
                <ul className="mt-4 space-y-1 text-base">
                  <li>Monday - Friday: <span className="font-semibold">9:00 AM - 6:00 PM</span></li>
                  <li>Saturday: <span className="font-semibold">10:00 AM - 4:00 PM</span></li>
                  <li>Sunday: <span className="font-semibold">Closed</span></li>
                </ul>
              </div>
            </div>
            {/* Right Column - Feedback Form */}
            <div className={`p-8 rounded-2xl shadow-xl ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
              <h2 className="text-3xl font-bold mb-6 text-center text-[#df1f47]">Share Your Feedback</h2>
              {sent ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-xl font-semibold text-center mb-2">Thank you for your feedback!</p>
                  <p className="text-center text-gray-500">Your feedback has been submitted successfully. We appreciate your input!</p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-4 btn bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200"
                  >
                    Submit Another Feedback
                  </button>
                </div>
              ) : (
                <form onSubmit={submitFeedback} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={feedbackData.name}
                        onChange={handleInputChange}
                        placeholder="Your Name"
                        required
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-[#df1f47] ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}`}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-bold mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={feedbackData.email}
                        onChange={handleInputChange}
                        placeholder="Your Email"
                        required
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-[#df1f47] ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}`}
                      />
                    </div>
                  </div>
                  
                  {/* Rating Section */}
                  <div>
                    <label className="block text-sm font-bold mb-2">Rate Your Experience</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(star)}
                          className="transition-colors duration-200"
                        >
                          <StarIcon
                            className={`w-8 h-8 ${
                              star <= feedbackData.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300 hover:text-yellow-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {feedbackData.rating > 0 ? `${feedbackData.rating} out of 5 stars` : 'Click to rate'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="feedback" className="block text-sm font-bold mb-1">Your Feedback</label>
                    <textarea
                      id="feedback"
                      name="feedback"
                      value={feedbackData.feedback}
                      onChange={handleInputChange}
                      rows="6"
                      placeholder="Tell us about your experience..."
                      required
                      minLength="5"
                      maxLength="500"
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-[#df1f47] ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}`}
                    ></textarea>
                    <p className="text-xs text-gray-500 mt-1">
                      {feedbackData.feedback.length}/500 characters
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200 font-semibold py-2 rounded-lg"
                  >
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          </div>
          {/* Google Map */}
          <div className="w-full h-80 rounded-2xl overflow-hidden shadow-xl mt-12">
            <iframe
              title="Google Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d414.6619062712479!2d121.00147082008115!3d14.570662967939969!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c99c5bed43cd%3A0xc73ed36d9754193!2sAtienza%20Naturale%20Inc.!5e0!3m2!1sen!2sph!4v1735003786418!5m2!1sen!2sph"
              allowFullScreen
              loading="lazy"
              className="w-full h-full border-none"
            ></iframe>
          </div>
        </div>
      </div>
      <FooterPublic />
    </div>
  );
};

export default Contact;