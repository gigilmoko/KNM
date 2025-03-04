import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
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

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
    AOS.init({ 
      duration: 1000, 
      once: true, 
    });
  }, []);

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_idf070e', 'template_vo713ak', e.target, 'LXmbdzx4vKR1J6vY1')
      .then((result) => {
          console.log(result.text);
          alert('Message sent successfully!');
      }, (error) => {
          console.log(error.text);
          alert('Failed to send message, please try again later.');
      });

    e.target.reset();
  };

  return (
    <div
  className={`min-h-screen ${
    theme === "dark" ? "bg-gray-900 text-white" : "bg-base-200 text-black"
  } flex flex-col justify-between`}
>
  <HeaderPublic />
  <div className="flex flex-col items-center py-12 px-6">
    <div id="contact" className="w-full max-w-6xl" data-aos="fade-right">
      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column - Contact Info & Business Hours */}
        <div className="space-y-6 flex flex-col">
          <div
            className={`p-6 rounded-lg shadow-lg flex-1 ${
              theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
            }`}
            data-aos="fade-right"
          >
            <h2 className="text-3xl font-bold mb-4 text-center text-[#df1f47]">Our Location</h2>
            <div className="flex items-start space-x-4 mb-4">
              <MapPinIcon className="h-12 w-12 text-[#df1f47]" />
              <div>
                <p className="font-bold">Address</p>
                <p>2325 Opalo, San Andres Bukid, Manila, 1017 Metro Manila</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 mb-4">
              <PhoneIcon className="h-12 w-12 text-[#df1f47]" />
              <div>
                <p className="font-bold">Phone</p>
                <p>(123) 456-7890</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 mb-4">
              <EnvelopeIcon className="h-12 w-12 text-[#df1f47]" />
              <div>
                <p className="font-bold">Email</p>
                <p>
                  <a href="mailto:info@domain.com" className="text-blue-400 hover:underline">
                    info@domain.com
                  </a>
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaFacebook className="h-12 w-12 text-[#df1f47]" />
              <div>
                <p className="font-bold">Facebook</p>
                <p>
                  <a href="https://facebook.com" target="_blank" className="text-blue-400 hover:underline">
                    @OurBusiness
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg shadow-lg flex-1 ${
              theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
            }`}
            data-aos="fade-right"
          >
            <div className="flex items-center space-x-3">
              <FaRegCalendarAlt className="text-[#df1f47] text-4xl" />
              <h2 className="text-4xl font-bold text-[#df1f47]">Business Hours</h2>
            </div>
            <p className="text-lg mt-4">Monday - Friday: 9:00 AM - 6:00 PM</p> 
            <p className="text-lg mt-2">Saturday: 10:00 AM - 4:00 PM</p> 
            <p className="text-lg mt-2">Sunday: Closed</p> 
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div
          className={`p-8 rounded-lg shadow-lg flex-1 ${
            theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          }`}
          data-aos="fade-right"
        >
          <h2 className="text-3xl font-bold mb-4 text-center text-[#df1f47]">Welcome Back!</h2>
          <form onSubmit={sendEmail}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-sm font-bold mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your Name"
                  required
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 ${
                    theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"
                  }`}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-bold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Your Email"
                  required
                  className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 ${
                    theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"
                  }`}
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="subject" className="block text-sm font-bold mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                placeholder="Subject"
                required
                className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 ${
                  theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"
                }`}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="message" className="block text-sm font-bold mb-2">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="8"
                placeholder="Write your message here..."
                required
                className={`w-full p-2 border rounded focus:ring-2 focus:ring-red-500 ${
                  theme === "dark" ? "bg-gray-700 text-white border-gray-600" : "border-gray-300"
                }`}
              ></textarea>
            </div>
            <button
              type="submit"
              className="btn w-full bg-[#df1f47] text-white hover:bg-[#c0183d] transition duration-200"
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {/* Google Map */}
      <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg mt-8" data-aos="fade-right">
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
