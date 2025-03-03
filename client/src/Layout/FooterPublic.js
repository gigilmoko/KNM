import React from 'react';

const FooterPublic = () => {
  return (
    <footer className="w-full bg-[#df1f47] text-white py-12">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8 px-1 md:px-3">
        <div className="flex flex-col">
          <h3 className="text-lg font-bold mb-2">About KNM</h3>
          <p className="text-sm leading-relaxed">
            The content management system is a game-changer for my workflow. I can now publish and manage my blog posts with ease.
          </p>
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-bold mb-2">Quick Links</h3>
          <ul className="text-sm space-y-1">
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">Our Story</a></li>
            <li><a href="#" className="hover:underline">Products</a></li>
            <li><a href="#" className="hover:underline">Contact Us</a></li>
          </ul>
        </div>
        <div className="flex flex-col">
          <h3 className="text-lg font-bold mb-2">Contact Us</h3>
          <p className="text-sm leading-relaxed">
            2342 Opalo St<br />
            San Andres Bukid,<br />
            Malate Manila
          </p>
        </div>
        <div className="flex flex-col items-center md:items-start">
          <h3 className="text-lg font-bold mb-2">Follow Us</h3>
          <a href="#" className="text-white text-3xl">
            <i className="fab fa-facebook"></i> {/* FontAwesome Facebook Icon */}
          </a>
        </div>
      </div>
    </footer>
  );
};

export default FooterPublic;
