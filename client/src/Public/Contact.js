import React from "react";

import '../assets/css/contact.css';

const Contact = () => {
  return (
    <div id="contact" className="contact-container">
      <div className="contact-row">
        {/* Google Map */}
        <div className="map-column">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d414.6619062712479!2d121.00147082008115!3d14.570662967939969!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c99c5bed43cd%3A0xc73ed36d9754193!2sAtienza%20Naturale%20Inc.!5e0!3m2!1sen!2sph!4v1735003786418!5m2!1sen!2sph"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>
        {/* Contact Details */}
        <div className="info-column">
          <h2>Contact Us</h2>
          <p>
          We’d love to hear from you! Whether you have questions about our products,
           want to support our programs, or wish to collaborate with us, 
           feel free to reach out using the details below:
          </p>
          <p>
            📍 2325 Opalo, San Andres Bukid, Manila, 1017 Metro Manila
          </p>
          <p>
            📞 (123) 456-7890
          </p>
          <p>
            ✉️ <a href="mailto:info@domain.com">info@domain.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
