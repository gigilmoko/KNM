import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Layout/HeaderPublic';

const ProductGallery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    // Fetch the first 3 products in the database
    const fetchFeaturedProducts = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/product/all/user`);
        if (data.success && Array.isArray(data.products)) {
          setFeaturedProducts(data.products.slice(0, 3));
        } else {
          setFeaturedProducts([]);
        }
      } catch (error) {
        setFeaturedProducts([]);
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

      <div className="text-center pb-20 bg-transparent">
        <h2 className="text-3xl sm:text-4xl font-bold uppercase font-poppins text-[#df1f47]">
          Featured Products
        </h2>
        <p className="text-base sm:text-lg mt-2 max-w-xl mx-auto">
          Each piece tells a story of Filipino heritage and craftsmanship.
        </p>

        {loading ? (
          <p className="text-lg mt-4">Loading featured products...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-2 sm:px-4 mt-8">
            {featuredProducts.map((product) => (
              <div
                className={`rounded-2xl overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105 ${
                  theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-black'
                } flex flex-col`}
                key={product._id}
              >
                <div className="relative group">
                  <img
                    src={
                      Array.isArray(product.images) && product.images[0]?.url
                        ? product.images[0].url
                        : 'https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png'
                    }
                    alt={product.name}
                    className="w-full object-cover"
                    style={{
                      aspectRatio: '4/5',
                      minHeight: '320px',
                      maxHeight: '420px',
                      borderRadius: '1rem',
                      transition: 'box-shadow 0.3s',
                    }}
                  />
                  <div className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      className="bg-white text-[#df1f47] border border-[#df1f47] px-4 py-2 text-sm rounded hover:bg-[#df1f47] hover:text-white transition font-semibold shadow"
                      onClick={() => openModal(product)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="flex justify-between text-xs sm:text-sm mb-2">
                    <span className="truncate">{product.category?.name || 'Unknown'}</span>
                    <span className="text-right font-bold text-[#df1f47]">₱{product.price}</span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-[#df1f47] font-poppins text-left truncate">
                    {product.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          className="mt-8 px-6 py-3 text-lg font-bold text-white bg-[#df1f47] rounded-full shadow-md hover:bg-[#bf1a3d] transition duration-300"
          onClick={() => navigate('/products')}
        >
          View All Products
        </button>
      </div>

      {/* Responsive Modal */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-2">
          <div className={`rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-4xl mx-auto max-h-[90vh] p-4 md:p-8 relative flex flex-col md:flex-row ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            {/* Close Button */}
            <button className="absolute top-4 right-4 text-gray-400 hover:text-[#df1f47] text-3xl" onClick={closeModal} aria-label="Close">
              &times;
            </button>
            {/* Left: Product Image */}
            <div className="w-full md:w-1/2 flex justify-center items-center mb-6 md:mb-0">
              <img
                src={
                  Array.isArray(selectedProduct.images) && selectedProduct.images[0]?.url
                    ? selectedProduct.images[0].url
                    : "https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png"
                }
                alt={selectedProduct.name}
                className="w-full max-w-[350px] h-[350px] object-cover rounded-lg shadow"
              />
            </div>
            {/* Right: Product Details */}
            <div className="w-full md:w-1/2 md:pl-8 flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl md:text-3xl font-bold">{selectedProduct.name}</h2>
                <p className="text-xl md:text-2xl font-bold text-[#df1f47]">₱{selectedProduct.price}</p>
              </div>
              <p className={`text-base md:text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                {selectedProduct.category?.name || "No category"}
              </p>
              <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
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