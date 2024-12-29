import React from 'react';
import '../assets/css/gallery.css';
import LogoImage from '../assets/img/logo.png'
import BgImage from '../assets/img/bglogin.jpg'
import prodBag from '../assets/img/KNMprodBag.png'
import prodBall from '../assets/img/KNMprodBall.png'
import prodNeck from '../assets/img/KNMprodNeck.png'
import prodParol from '../assets/img/KNMprodParol.png'
import prodSaya from '../assets/img/KNMprodSaya.png'
import prodOufit from '../assets/img/KNMprodOutfit.jpg'
import prodBracelet from '../assets/img/KNMprodBracelet.jpg'
import prodCrochet from '../assets/img/KNMprodCrochet.png'


const ProductGallery = () => {
  const galleryItems = [
    
    { id: 1, name: 'Necklace', image: prodNeck, link: '#' },
    { id: 2, name: 'Parol', image: prodParol, link: '#' },
    { id: 3, name: 'Bag', image: prodBag, link: '#' },
    { id: 4, name: 'Saya', image: prodSaya, link: '#' },
    { id: 5, name: 'Christmas Ball', image: prodBall, link: '#' },
    { id: 6, name: 'Outfit', image: prodOufit, link: '#' },
    { id: 7, name: 'Bracelet', image: prodBracelet, link: '#' },
    { id: 8, name: 'Crochet Bag', image: prodCrochet, link: '#' },
  ];

  return (
    <div className="gallery-section">
      <h2 className="gallery-title">Our Products</h2>
      <div className="gallery-grid">
        {galleryItems.map((item) => (
          <div className="gallery-item" key={item.id}>
            <img src={item.image} alt={item.name} />
            <div className="gallery-hover">
              <span>{item.name}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGallery;
