import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import HeaderPublic from '../Layout/HeaderPublic';
import FooterPublic from '../Layout/FooterPublic';
import PhoneIcon from '@heroicons/react/24/solid/PhoneIcon';
import MapPinIcon from '@heroicons/react/24/solid/MapPinIcon';
import EnvelopeIcon from '@heroicons/react/24/solid/EnvelopeIcon';
import { FaFacebook, FaRegCalendarAlt } from 'react-icons/fa';
import emailjs from 'emailjs-com';

const Contact = () => {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm('service_idf070e', 'template_vo713ak', e.target, 'LXmbdzx4vKR1J6vY1')
      .then(
        (result) => {
          setSent(true);
        },
        (error) => {
          alert('Failed to send message, please try again later.');
        }
      );
    e.target.reset();
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-base-200 text-black"} flex flex-col`}>
      <HeaderPublic />
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
            {/* Right Column - Contact Form */}
            <div className={`p-8 rounded-2xl shadow-xl ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
              <h2 className="text-3xl font-bold mb-6 text-center text-[#df1f47]">Send Us a Message</h2>
              {sent ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-5xl mb-4">✅</div>
                  <p className="text-xl font-semibold text-center mb-2">Thank you for reaching out!</p>
                  <p className="text-center text-gray-500">Your message has been sent successfully. We will get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={sendEmail} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-bold mb-1">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
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
                        placeholder="Your Email"
                        required
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-[#df1f47] ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-bold mb-1">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      placeholder="Subject"
                      required
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-[#df1f47] ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}`}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-bold mb-1">Your Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="6"
                      placeholder="Write your message here..."
                      required
                      className={`w-full p-2 border rounded focus:ring-2 focus:ring-[#df1f47] ${theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"}`}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200 font-semibold py-2 rounded-lg"
                  >
                    Submit
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