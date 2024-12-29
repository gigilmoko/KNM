import React from "react";
import '../assets/css/blog.css';
import LogoImage from '../assets/img/logo.png'


const Blog = () => {
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
  ];

  return (
    <div className="blog-container">
      <h1 className="blog-title">OUR BLOG</h1>
      <div className="dots-indicator">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      <div className="blog-grid">
        {blogs.map((blog) => (
          <div key={blog.id} className="blog-card">
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
    </div>
  );
};

export default Blog;
