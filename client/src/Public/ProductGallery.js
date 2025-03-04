import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Header from '../Layout/HeaderPublic';
import { useNavigate } from 'react-router-dom';

const ProductGallery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/predictions/get-top-products`);
        console.log('Fetched Featured Products:', data);
        setFeaturedProducts((data.topProducts || []).slice(0, 3));
      } catch (error) {
        console.error('Failed to load featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
      {location.pathname !== '/' && <Header />}

      <div className="text-center py-12 bg-transparent">
        <h2 className="text-4xl font-bold uppercase font-poppins text-[#df1f47]" data-aos="zoom-in" data-aos-delay="100">
          Featured Products
        </h2>

        <p className="text-lg mt-2" data-aos="fade-up" data-aos-delay="150">
          Each piece tells a story of Filipino heritage and craftsmanship.
        </p>

        {loading ? (
          <p className="text-lg mt-4">Loading featured products...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 mt-6" data-aos="zoom-in" data-aos-delay="100">
            {featuredProducts.map(({ product }) => (
              <div className={`rounded-lg overflow-hidden shadow-md transform transition-transform duration-300 hover:scale-105 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'}`} key={product._id} data-aos="zoom-in" data-aos-delay="200">
                <div className="relative">
                  <img
                    src={product.images[0]?.url || 'placeholder.jpg'}
                    alt={product.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 hover:opacity-100">
                    <button
                      className="bg-white text-black border border-black px-4 py-2 text-sm rounded hover:bg-black hover:text-white"
                      onClick={() => openModal(product)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{product.category?.name || 'Unknown'}</span>
                    <span className="text-right font-bold text-[#df1f47]">₱{product.price}</span>
                  </div>
                  <div className="text-xl font-bold text-[#df1f47] font-poppins text-left">{product.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className="mt-8 px-6 py-3 text-lg font-bold text-white bg-[#df1f47] rounded-full shadow-md hover:bg-[#bf1a3d] transition duration-300"
          data-aos="fade-up"
          data-aos-delay="200"
          onClick={() => navigate('/products')}
        >
          View All Products
        </button>
      </div>

      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className={`rounded-lg shadow-lg w-[1000px] max-h-[500px] p-8 relative flex ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}>
            {/* Close Button */}
            <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl" onClick={closeModal}>
              &times;
            </button>

            {/* Left: Product Image */}
            <div className="w-1/2 flex justify-center items-center">
              <img
                src={selectedProduct.images[0]?.url || "placeholder.jpg"}
                alt={selectedProduct.name}
                className="w-[600px] h-[400px] object-cover rounded-md"
              />
            </div>

            {/* Right: Product Details */}
            <div className="w-1/2 pl-8 flex flex-col shadow-md rounded-lg p-6 border ml-6 mr-2">
              {/* Name and Price in the Same Line */}
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-3xl font-bold ">{selectedProduct.name}</h2>
                <p className="text-2xl font-bold text-[#df1f47]">₱{selectedProduct.price}</p>
              </div>

              {/* Category Name */}
              <p className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
  {selectedProduct.category?.name || "No category"}
</p>

{/* Description */}
<p className={`text-gray-600 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
  {selectedProduct.description || "No description available."}
</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
