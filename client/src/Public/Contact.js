import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Import for route checking
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import "../assets/css/contact.css";
import Header from '../Layout/HeaderPublic';

const Contact = () => {
  const location = useLocation(); // Hook to get the current route

  useEffect(() => {
    AOS.init({ 
      duration: 1000, // Animation duration in milliseconds
      once: true,     // Whether animation should happen only once - while scrolling down
    });
  }, []);

  return (
  <div>
    {/* Render Header only if not on the homepage */}
    {location.pathname !== '/' && <Header />}
    <div id="contact" className="contact-container" data-aos="fade-right" data-aos-delay="50">
      {/* Google Map and Contact Info */}
      <div className="contact-row">
        {/* Google Map */}
        <div className="map-column" data-aos="fade-right" data-aos-delay="100">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d414.6619062712479!2d121.00147082008115!3d14.570662967939969!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c99c5bed43cd%3A0xc73ed36d9754193!2sAtienza%20Naturale%20Inc.!5e0!3m2!1sen!2sph!4v1735003786418!5m2!1sen!2sph"
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>

        {/* Contact Info */}
        <div className="info-column" data-aos="fade-right" data-aos-delay="200">
          <h2>Contact Us</h2>
          <p>
            We’d love to hear from you! Whether you have questions about our products,
            want to support our programs, or wish to collaborate with us, 
            feel free to reach out using the details below:
          </p>
          <p>📍 2325 Opalo, San Andres Bukid, Manila, 1017 Metro Manila</p>
          <p>📞 (123) 456-7890</p>
          <p>
            ✉️ <a href="mailto:info@domain.com">info@domain.com</a>
          </p>
        </div>
      </div>

      {/* Contact Form */}
      <div className="contact-form" data-aos="fade-right" data-aos-delay="300">
        <h3>Send Us a Message</h3>
        <form>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input type="text" id="name" name="name" placeholder="Your Name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Your Email" required />
          </div>
          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input type="text" id="subject" name="subject" placeholder="Subject" required />
          </div>
          <div className="form-group">
            <label htmlFor="message">Your Message</label>
            <textarea id="message" name="message" rows="5" placeholder="Write your message here..." required></textarea>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  </div>
  );
};

export default Contact;
