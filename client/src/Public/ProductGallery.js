import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom'; // Import for route checking
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import '../assets/css/gallery.css';
import prodBag from '../assets/img/KNMprodBag.png';
import prodBall from '../assets/img/KNMprodBall.png';
import prodNeck from '../assets/img/KNMprodNeck.png';
import prodParol from '../assets/img/KNMprodParol.png';
import prodSaya from '../assets/img/KNMprodSaya.png';
import prodOutfit from '../assets/img/KNMprodOutfit.jpg';
import prodBracelet from '../assets/img/KNMprodBracelet.jpg';
import prodCrochet from '../assets/img/KNMprodCrochet.png';
import Header from '../Layout/HeaderPublic';

const ProductGallery = () => {
  const location = useLocation(); // Hook to get the current route
  const galleryItems = [
    { id: 1, name: 'Necklace', price: '$30.00', image: prodNeck },
    { id: 2, name: 'Parol', price: '$40.00', image: prodParol },
    { id: 3, name: 'Bag', price: '$25.00', image: prodBag },
    { id: 4, name: 'Saya', price: '$35.00', image: prodSaya },
    { id: 5, name: 'Christmas Ball', price: '$20.00', image: prodBall },
    { id: 6, name: 'Outfit', price: '$50.00', image: prodOutfit },
    { id: 7, name: 'Bracelet', price: '$15.00', image: prodBracelet },
    { id: 8, name: 'Crochet Bag', price: '$45.00', image: prodCrochet },
  ];

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true, 
    });
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : galleryItems.length - 3
    );
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < galleryItems.length - 3 ? prevIndex + 1 : 0
    );
  };

  return (
    <div>
      {/* Render Header only if not on the homepage */}
      {location.pathname !== '/' && <Header />}

      <div className="gallery-section">
        <h2 className="gallery-title" data-aos="zoom-in" data-aos-delay="100">
          Our Products
        </h2>

        {location.pathname === '/' ? (
          // Render carousel only on the homepage
          <div className="gallery-carousel" data-aos="zoom-in">
            <button className="carousel-arrow left" onClick={handlePrevClick}>
            &lt;
          </button>
            <div
            className="carousel-track"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
              {galleryItems.slice(0, 8).map((item) => (
                <div className="card-container" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div className="hover-buttons">
                    <button className="hover-button">View</button>
                    <button className="hover-button">Wishlist</button>
                    <button className="hover-button">Buy</button>
                  </div>
                  <div className="product-info">
                    <div className="product-name">{item.name}</div>
                    <div className="product-price">{item.price}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="carousel-arrow right" onClick={handleNextClick}>
            &gt;
          </button>
            <a
              href="/gallery"
              className="read-more-link"
              data-aos="fade-in"
              data-aos-delay="400"
            >
              More Products
            </a>
          </div>
        ) : (
          // Render full product grid for the gallery page
          <div className="product-grid" data-aos="zoom-in" data-aos-delay="100">
            {galleryItems.map((item) => (
              <div className="card-container" key={item.id} data-aos="zoom-in" data-aos-delay="200">
                <img src={item.image} alt={item.name} />
                <div className="hover-buttons">
                  <button className="hover-button">View</button>
                  <button className="hover-button">Wishlist</button>
                  <button className="hover-button">Buy</button>
                </div>
                <div className="product-info">
                  <div className="product-name">{item.name}</div>
                  <div className="product-price">{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
