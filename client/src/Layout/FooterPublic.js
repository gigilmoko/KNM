import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

const FooterPublic = () => {
  return (
    <footer className="w-full bg-[#df1f47] text-white pt-12 pb-6">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-4">
        {/* About */}
        <div>
          <h3 className="text-xl font-bold mb-3">About KNM</h3>
          <p className="text-sm leading-relaxed opacity-90">
            KNM empowers women artisans to showcase their craft. Our platform makes it easy to discover, support, and celebrate their unique creations.
          </p>
        </div>
        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-bold mb-3">Quick Links</h3>
          <ul className="text-sm space-y-2">
            <li><a href="#" className="hover:underline hover:text-gray-200 transition">About Us</a></li>
            <li><a href="#" className="hover:underline hover:text-gray-200 transition">Our Story</a></li>
            <li><a href="#" className="hover:underline hover:text-gray-200 transition">Products</a></li>
            <li><a href="#" className="hover:underline hover:text-gray-200 transition">Contact Us</a></li>
          </ul>
        </div>
        {/* Contact */}
        <div>
          <h3 className="text-xl font-bold mb-3">Contact Us</h3>
          <address className="not-italic text-sm leading-relaxed opacity-90">
            2342 Opalo St<br />
            San Andres Bukid,<br />
            Malate Manila
          </address>
        </div>
        {/* Social */}
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-xl font-bold mb-3">Follow Us</h3>
          <div className="flex gap-4 mt-1">
            <a href="#" aria-label="Facebook" className="hover:text-gray-200 transition">
              <FaFacebookF size={24} />
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-gray-200 transition">
              <FaInstagram size={24} />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-gray-200 transition">
              <FaTwitter size={24} />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white border-opacity-20 mt-10 pt-4 text-center text-xs opacity-80">
        &copy; {new Date().getFullYear()} KNM. All rights reserved.
      </div>
    </footer>
  );
};

export default FooterPublic;