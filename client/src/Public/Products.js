import React, { useEffect, useState } from "react";
import HeaderPublic from "../Layout/HeaderPublic";
import FooterPublic from "../Layout/FooterPublic";
import { FaShoppingBag, FaMagic, FaGift, FaHeart, FaTshirt, FaEye } from "react-icons/fa";
import axios from "axios";
import Loading from "../Layout/Loader";
import Scene from "./showroom/Scene";

const Products = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const categories = [
    { name: "All", icon: <FaMagic className="h-6 w-6 md:h-8 md:w-8" /> },
    { name: "Accessories", icon: <FaMagic className="h-6 w-6 md:h-8 md:w-8" /> },
    { name: "Bag", icon: <FaShoppingBag className="h-6 w-6 md:h-8 md:w-8" /> },
    { name: "Beauty", icon: <FaHeart className="h-6 w-6 md:h-8 md:w-8" /> },
    { name: "Clothing", icon: <FaTshirt className="h-6 w-6 md:h-8 md:w-8" /> },
    { name: "Christmas", icon: <FaGift className="h-6 w-6 md:h-8 md:w-8" /> },
  ];

  const [allProducts, setAllProducts] = useState([]);

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName);
    if (categoryName === "All") {
      setProducts(allProducts);
    } else {
      const filtered = allProducts.filter(product => 
        product.category?.name === categoryName
      );
      setProducts(filtered);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("theme")) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/product/all/user`);
        if (data.success) {
          setAllProducts(data.products);
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const openModal = (product, imageIndex = 0) => {
    setSelectedProduct(product);
    setCurrentImageIndex(imageIndex);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProduct && selectedProduct.images) {
      setCurrentImageIndex((prev) => 
        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedProduct && selectedProduct.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedProduct.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className={theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}>
      <HeaderPublic />
      <main className="min-h-screen">
        {/* Hero Section with Showroom */}
        <section className="relative px-4 py-8 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-16">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6">
                <span className="bg-gradient-to-r from-[#df1f47] to-pink-600 bg-clip-text text-transparent">
                  Interactive
                </span>
                <br />
                <span className={theme === "dark" ? "text-white" : "text-gray-900"}>
                  Showroom
                </span>
              </h1>
              <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
                Explore our beautiful 3D showroom featuring handcrafted products made by empowered women. 
                Navigate through the space and discover our collection in an immersive environment.
              </p>
            </div>
            <div className="rounded-3xl overflow-hidden shadow-2xl mb-8 md:mb-16">
              <Scene />
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="px-4 py-8 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-[#df1f47] mb-4 md:mb-6">
                Browse by Category
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Filter our collection to find exactly what you're looking for
              </p>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-6 max-w-4xl mx-auto mb-8 md:mb-12">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`flex flex-col items-center p-3 md:p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.name
                      ? "bg-[#df1f47] text-white border-[#df1f47] shadow-xl"
                      : theme === "dark" 
                        ? "bg-gray-800 text-white border-gray-600 hover:bg-gray-700 hover:border-[#df1f47]" 
                        : "bg-white text-black border-gray-200 hover:bg-[#fff0f4] hover:border-[#df1f47]"
                  }`}
                  onClick={() => handleCategoryClick(category.name)}
                >
                  <div className={`text-[#df1f47] mb-2 md:mb-3 ${selectedCategory === category.name ? "text-white" : ""}`}>
                    {category.icon}
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-center">{category.name}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section className="px-4 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl md:text-4xl font-bold text-[#df1f47] mb-4">
                {selectedCategory === "All" ? "Our Complete Collection" : `${selectedCategory} Collection`}
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
                {selectedCategory === "All" 
                  ? "Discover all our handcrafted products made with love and dedication" 
                  : `Explore our beautiful ${selectedCategory.toLowerCase()} collection`
                }
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loading />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaShoppingBag className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {selectedCategory === "All" ? "No products available" : `No ${selectedCategory.toLowerCase()} products found`}
                  </h3>
                  <p className="text-gray-500">
                    {selectedCategory === "All" 
                      ? "Check back soon for new additions to our collection" 
                      : "Try selecting a different category to see more products"
                    }
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                {products.map((product, index) => (
                  <div
                    key={product._id}
                    className={`group relative rounded-2xl overflow-hidden shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${
                      theme === "dark" ? "bg-gray-800" : "bg-white"
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Square Image Container */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={product.images[0]?.url || 'https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png'}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Floating Action Button */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={() => openModal(product)}
                          className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#df1f47] hover:bg-[#df1f47] hover:text-white transition-all duration-300 shadow-lg"
                        >
                          <FaEye className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price Badge */}
                      <div className="absolute top-2 left-2 bg-[#df1f47] text-white px-2 py-1 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0">
                        ₱{product.price}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-3">
                      <h3 className="font-bold text-sm mb-1 truncate text-[#df1f47]">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        {product.category?.name || "Uncategorized"}
                      </p>
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-center gap-1 text-[#df1f47]">
                          <FaHeart className="w-3 h-3" />
                          <span className="text-xs font-medium">Handcrafted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Support Message */}
            {products.length > 0 && (
              <div className="mt-12 md:mt-16 text-center">
                <div className="bg-gradient-to-r from-[#df1f47]/10 via-pink-50 to-purple-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-3xl p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-bold text-[#df1f47] mb-4">
                    Supporting Women Empowerment
                  </h3>
                  <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Every purchase supports the women of Manila in their journey towards economic independence and skill development. 
                    Each product is carefully crafted with traditional techniques and modern innovation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <FooterPublic />

      {/* Enhanced Product Modal */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4">
          <div className={`rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] relative flex flex-col md:flex-row overflow-hidden ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-[#df1f47] flex items-center justify-center text-xl font-bold transition-all duration-300 shadow-lg" 
              onClick={closeModal}
            >
              ×
            </button>
            
            {/* Image Gallery */}
            <div className="w-full md:w-1/2 bg-gray-50 dark:bg-gray-800 relative">
              <div className="aspect-square overflow-hidden">
                <img
                  src={selectedProduct.images[currentImageIndex]?.url || "https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png"}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Navigation */}
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-all duration-300 shadow-lg"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-gray-800 hover:bg-white transition-all duration-300 shadow-lg"
                  >
                    →
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {selectedProduct.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Product Details */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
              <div className="mb-4">
                <span className="inline-block bg-[#df1f47]/10 text-[#df1f47] px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  {selectedProduct.category?.name || "Uncategorized"}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#df1f47] mb-3">
                  {selectedProduct.name}
                </h2>
                <p className="text-xl md:text-2xl font-bold text-[#df1f47] mb-4">
                  ₱{selectedProduct.price}
                </p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  Product Description
                </h3>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedProduct.description || "This beautiful handcrafted item represents the skill and dedication of the women artisans of Manila. Each piece is unique and made with traditional techniques passed down through generations."}
                </p>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-[#df1f47]/5 rounded-2xl">
                <FaHeart className="w-5 h-5 text-[#df1f47]" />
                <div>
                  <p className="font-semibold text-[#df1f47] text-sm">Handcrafted with Care</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Made by empowered women artisans
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;