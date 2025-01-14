import React from "react";
import { useLocation } from 'react-router-dom'; // Import for route checking
import '../assets/css/blog.css';
import LogoImage from '../assets/img/logo.png'
import Header from "../Layout/HeaderPublic";


const Blog = () => {
  const location = useLocation(); // Hook to get the current route
  const blogs = [
    {
      id: 1,
      date: "05 DECEMBER",
      title: "Success Story 1",
      description:
        "Distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more...",
      image: LogoImage, // Replace with your image URL
    },
    {
      id: 2,
      date: "05 DECEMBER",
      title: "Success Story 2",
      description:
        "Distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more...",
      image: LogoImage, // Replace with your image URL
    },
    {
      id: 2,
      date: "05 DECEMBER",
      title: "Success Story 3",
      description:
        "Distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more...",
      image: LogoImage, // Replace with your image URL
    },
  ];

  return (
  <div>
    {/* Render Header only if not on the homepage */}
    {location.pathname !== '/' && <Header />}
    <div className="blog-container">
      <h1 className="blog-title" data-aos="fade-left" data-aos-delay="100">OUR BLOG</h1>
      <div className="dots-indicator" data-aos="fade-left" data-aos-delay="100">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      <div className="blog-grid">
        {blogs.map((blog) => (
          <div key={blog.id} className="blog-card" data-aos="fade-left" data-aos-delay="250">
            <div className="blog-image-wrapper">
              <img src={blog.image} alt={blog.title} className="blog-image" />
              <div className="date-badge">{blog.date}</div>
            </div>
            <div className="blog-content">
              <h2>{blog.title}</h2>
              <p>{blog.description}</p>
            </div>
            <button className="read-more-btn">READ MORE</button>
          </div>
          
        ))}
      </div>
      <a
              href="/blog"
              className="read-more-link"
              data-aos="fade-in"
              data-aos-delay="400"
            >
              More Stories
            </a>
    </div>
  </div>
  );
};

export default Blog;
