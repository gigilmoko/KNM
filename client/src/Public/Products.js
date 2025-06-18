import React, { useEffect, useState } from "react";
import HeaderPublic from "../Layout/HeaderPublic";
import FooterPublic from "../Layout/FooterPublic";
import { FaShoppingBag, FaMagic, FaGift, FaHeart, FaTshirt } from "react-icons/fa";
import axios from "axios";
import Loading from "../Layout/Loader";
import Scene from "./showroom/Scene";

const Products = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = [
    { name: "Accessories", icon: <FaMagic className="h-8 w-8 md:h-10 md:w-10 text-[#df1f47]" /> },
    { name: "Bag", icon: <FaShoppingBag className="h-8 w-8 md:h-10 md:w-10 text-[#df1f47]" /> },
    { name: "Beauty", icon: <FaHeart className="h-8 w-8 md:h-10 md:w-10 text-[#df1f47]" /> },
    { name: "Clothing", icon: <FaTshirt className="h-8 w-8 md:h-10 md:w-10 text-[#df1f47]" /> },
    { name: "Christmas", icon: <FaGift className="h-8 w-8 md:h-10 md:w-10 text-[#df1f47]" /> },
  ];

  const categoryIds = {
    Accessories: "66f8c198b2ca3d3255d55634",
    Bag: "66fb86cb2fcf160141ee5e6d",
    Beauty: "6750c2d8ca587d8501277c7a",
    Clothing: "66fb86cb2fcf160141ee5e6d",
    Christmas: "66f76b66d66b6b46cf674469",
  };

  const handleCategoryClick = async (categoryName) => {
    const categoryId = categoryIds[categoryName];
    if (!categoryId) return;
    setLoading(true);
    setProducts([]);
    try {
      let newProducts = [];
      if (Array.isArray(categoryId)) {
        for (const id of categoryId) {
          const { data } = await axios.get(`${process.env.REACT_APP_API}/api/product/category/${id}`);
          if (data.success) newProducts = [...newProducts, ...data.products];
        }
      } else {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/product/category/${categoryId}`);
        if (data.success) newProducts = data.products;
      }
      setProducts(newProducts);
    } catch (error) {
      console.error(`Error fetching products for ${categoryName}:`, error);
    } finally {
      setLoading(false);
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
        if (data.success) setProducts(data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
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
    <div className={theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-black"}>
      <HeaderPublic />
      <main className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
        <section className="max-w-7xl mx-auto py-10 px-2 sm:px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-[#df1f47] text-center mb-4">Show Room</h1>
          <p className="text-center text-base md:text-lg mb-8 max-w-2xl mx-auto">
            A bright and modern showroom designed to showcase KNM's products, making them easy to see and appreciate.
          </p>
          <div className="mb-8">
            <Scene />
          </div>

          <h2 className="text-2xl md:text-4xl mt-10 font-bold text-center text-[#df1f47]">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mt-8">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`flex flex-col items-center p-4 md:p-6 rounded-2xl shadow-md border border-gray-200 cursor-pointer transition hover:shadow-xl hover:bg-[#fff0f4] focus:outline-none focus:ring-2 focus:ring-[#df1f47] ${
                  theme === "dark" ? "bg-gray-800 text-white border-gray-700 hover:bg-gray-700" : "bg-white text-black"
                }`}
                onClick={() => handleCategoryClick(category.name)}
                aria-label={category.name}
              >
                {category.icon}
                <p className="mt-3 text-base md:text-lg font-semibold">{category.name}</p>
              </button>
            ))}
          </div>

          <h2 className="text-2xl md:text-4xl mt-12 font-bold text-center text-[#df1f47]">Our Products</h2>
          <p className="text-center mb-6 text-base md:text-lg">Handcrafted by empowered women.</p>

          {loading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 max-w-7xl mx-auto mt-6">
              {products.length === 0 && (
                <div className="col-span-full text-center text-gray-400 text-lg py-12">
                  No products found.
                </div>
              )}
              {products.map((product) => (
                <div
                  className={`flex flex-col items-center rounded-2xl shadow-lg border border-gray-200 bg-white overflow-hidden transition-transform hover:scale-105 hover:shadow-2xl ${
                    theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-white text-black"
                  }`}
                  key={product._id}
                >
                  <div className="relative w-full aspect-square">
                    <img
                      src={product.images[0]?.url || 'https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-40 opacity-0 transition-opacity duration-300 hover:opacity-100 cursor-pointer"
                      onClick={() => openModal(product)}
                    >
                      <button className="bg-white text-[#df1f47] border border-[#df1f47] px-4 py-2 text-sm rounded hover:bg-[#df1f47] hover:text-white transition font-semibold shadow">
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="p-4 w-full">
                    <div className="flex justify-between text-xs md:text-sm mb-2">
                      <span className="font-semibold">{product.category?.name || "Unknown"}</span>
                      <span className="text-right font-bold text-[#df1f47]">₱{product.price}</span>
                    </div>
                    <div className="text-lg md:text-xl font-bold text-[#df1f47] font-poppins text-left truncate">{product.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <FooterPublic />

      {/* Product Modal */}
      {modalOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className={`rounded-2xl shadow-2xl w-full max-w-2xl md:max-w-4xl mx-4 md:mx-0 max-h-[90vh] p-4 md:p-10 relative flex flex-col md:flex-row ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            {/* Close Button */}
            <button className="absolute top-4 right-4 text-gray-400 hover:text-[#df1f47] text-3xl" onClick={closeModal} aria-label="Close">
              &times;
            </button>
            {/* Left: Product Image */}
            <div className="w-full md:w-1/2 flex justify-center items-center mb-6 md:mb-0">
              <img
                src={selectedProduct.images[0]?.url || "https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png"}
                alt={selectedProduct.name}
                className="w-full max-w-[300px] md:max-w-[350px] h-[200px] md:h-[350px] object-cover rounded-lg shadow"
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

export default Products;