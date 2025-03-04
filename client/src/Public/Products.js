import React, { useEffect, useState } from "react";
import HeaderPublic from "../Layout/HeaderPublic";
import FooterPublic from "../Layout/FooterPublic";
import { FaShoppingBag, FaMagic, FaGift, FaHeart, FaTshirt, FaStar } from "react-icons/fa";
import axios from "axios";
import Loading from "../Layout/Loader";

const Products = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const categories = [
    { name: "Accessories", icon: <FaMagic className="h-12 w-12 text-[#df1f47]" /> },
    { name: "Bag", icon: <FaShoppingBag className="h-12 w-12 text-[#df1f47]" /> },
    { name: "Beauty", icon: <FaHeart className="h-12 w-12 text-[#df1f47]" /> },
    { name: "Clothing", icon: <FaTshirt className="h-12 w-12 text-[#df1f47]" /> },
    { name: "Christmas", icon: <FaGift className="h-12 w-12 text-[#df1f47]" /> },
    { name: "Essentials", icon: <FaStar className="h-12 w-12 text-[#df1f47]" /> },
  ];

  const categoryIds = {
    Accessories: "66f8c198b2ca3d3255d55634",
    Bag: "66fb86cb2fcf160141ee5e6d",
    Beauty: "6750c2d8ca587d8501277c7a",
    Clothing: "66fb86cb2fcf160141ee5e6d",
    Christmas: "66f76b66d66b6b46cf674469",
    Essentials: ["678fb571dcbe0679d2b366db", "678fb588dcbe0679d2b366f9"],
  };
  
  const handleCategoryClick = async (categoryName) => {
    const categoryId = categoryIds[categoryName];
  
    if (!categoryId) {
      console.error("Invalid category ID");
      return;
    }
  
    setLoading(true);
    setProducts([]); // Clear the current products
  
    try {
      let newProducts = [];
  
      if (Array.isArray(categoryId)) {
        for (const id of categoryId) {
          const { data } = await axios.get(`${process.env.REACT_APP_API}/api/product/category/${id}`);
          if (data.success) {
            newProducts = [...newProducts, ...data.products]; // Append products from each category ID
          }
        }
      } else {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/product/category/${categoryId}`);
        if (data.success) {
          newProducts = data.products;
        }
      }
  
      setProducts(newProducts); // Update the product list
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
        console.log("Fetched Products:", data);
        if (data.success) {
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

  const openModal = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className={theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}>
      <HeaderPublic />
      <main className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
        <section className="container mx-auto py-16">
          <h1 className="text-5xl font-bold text-[#df1f47]">Show Room</h1>
          <div className="mt-4 mb-4">
            <p>A bright and modern showroom designed to showcase KNM's products, making them easy to see and appreciate.</p>
          </div>
          <div className="w-full min-h-[45vh] p-12 rounded-lg shadow-lg bg-[#df1f47] text-white" />

          <h2 className="text-4xl mt-10 font-bold text-center text-[#df1f47]">Shop by Category</h2>

          {/* Category Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-10">
            {categories.map((category, index) => (
                <div
                key={index}
                className={`flex flex-col items-center p-6 rounded-lg shadow-md border border-gray-300 cursor-pointer transition ${
                  theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"
                }`}
                onClick={() => handleCategoryClick(category.name)}
                >
                {category.icon}
                <p className="mt-4 text-lg font-semibold">{category.name}</p>
                </div>
            ))}
            </div>

          <h2 className="text-4xl mt-5 font-bold text-center text-[#df1f47]">Our Products</h2>
          <p className="text-center">Handcrafted by empowered women.</p>

          {loading ? (
            <Loading />
) : (

  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-8xl mx-auto mt-6">
  {products.map((product) => (
    <div
      className={`flex flex-col items-center p-6 rounded-lg shadow-md border border-gray-300 w-full ${
        theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"
      }`}
      key={product._id}
    >
      {/* Product Image */}
      <div className="relative w-80 h-80">
        <img
          src={product.images[0]?.url ||'https://res.cloudinary.com/dglawxazg/image/upload/v1741029114/Yellow_Minimalistic_Grandma_Avatar_mnjrbs.png'}
          alt={product.name}
          className="w-full h-full object-cover rounded-md"
        />
        <div
          className="absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-300 hover:opacity-100 cursor-pointer"
          onClick={() => openModal(product)}
        >
          <button className="bg-white text-black border border-black px-4 py-2 text-sm rounded hover:bg-black hover:text-white">
            View Details
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 w-full">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-left">{product.category?.name || "Unknown"}</span>
          <span className="text-right font-bold text-[#df1f47]">₱{product.price}</span>
        </div>
        <div className="text-xl font-bold text-[#df1f47] font-poppins text-left">{product.name}</div>
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

export default Products;
