import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from "../../Layout/Header";
import { toast, ToastContainer } from 'react-toastify'; // Importing toast

const CLOUDINARY_API_KEY = '655852923368639';

// Your Cloudinary config (replace with actual config)
const cloudinaryUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    try {
        const res = await axios.post('https://api.cloudinary.com/v1_1/dglawxazg/image/upload', formData);
        return { public_id: res.data.public_id, url: res.data.secure_url };
    } catch (error) {
        console.error('Error uploading image', error);
        return null;
    }
};

// Cloudinary deletion function
const cloudinaryDelete = async (public_id) => {
  try {
      const response = await axios.delete(`${process.env.REACT_APP_API}/api/product/delete-image/${public_id}`);
      console.log('Image deleted from Cloudinary:', response.data);
  } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
  }
};

// Regular expressions for validation
const nameRegex = /^[A-Za-z0-9\s]{5,100}$/;  // Letters, numbers, spaces, 5-100 characters
const priceRegex = /^\d+(\.\d{1,2})?$/;      // Numbers with up to 2 decimal places
const stockRegex = /^\d{1,5}$/;              // Integer value with up to 5 digits

function UpdateProduct() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams(); // Get the product ID from URL parameters
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: 0,
        category: "",
        stock: 0,
        images: [] // Will hold URLs and public_ids
    });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
        fetchProductDetails();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/api/category`);
            if (response.data && Array.isArray(response.data.categories)) {
                setCategories(response.data.categories);
            } else {
                console.error('Data fetched is not an array:', response.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/api/product/${id}`);
            console.log("Fetched product details:", response.data); // Debugging line
            
            if (response.data && response.data.success) {
                const { product } = response.data; // Destructure product from the response
                
                // Set the productData state with the correct structure
                setProductData({
                    name: product.name || "",
                    description: product.description || "",
                    price: product.price || 0,
                    category: product.category || "",
                    stock: product.stock || 0,
                    images: Array.isArray(product.images) ? product.images : [] // Ensure it's an array
                });

                console.log("Product data set:", productData); // Log the updated product data
            }
        } catch (error) {
            console.error('Failed to fetch product details', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        console.log("Files selected:", files);

        const uploadedImages = await Promise.all(
            files.map(async (file) => {
                const result = await cloudinaryUpload(file); // If you use ml_default, you can skip this
                console.log("Uploaded image:", result);
                return result;
            })
        );

        const validImages = uploadedImages.filter(img => img !== null);
        console.log("Valid images after filtering:", validImages);

        // Update productData images correctly
        setProductData((prevData) => {
            const updatedImages = [...prevData.images, ...validImages.map(img => ({ url: img.url, public_id: img.public_id }))];
            console.log("Updated productData with images:", updatedImages); // This will show the correct updated array
            return {
                ...prevData,
                images: updatedImages, // Append new images to existing ones
            };
        });
    };

    const handleImageRemove = async (index) => {
        const imageToRemove = productData.images[index];
        console.log('Deleting image with public_id:', imageToRemove.public_id); // Log public_id

        // Call the cloudinaryDelete function to delete the image
        await cloudinaryDelete(imageToRemove.public_id);
        
        // Now update the productData state
        setProductData((prevData) => {
            const updatedImages = prevData.images.filter((_, i) => i !== index);
            console.log('Image successfully deleted from state:', imageToRemove.public_id); // Log confirmation
            return {
                ...prevData,
                images: updatedImages,
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Validations
        if (!nameRegex.test(productData.name.trim())) {
            return toast.error('Product name must be between 5 and 100 characters, and only contain letters, numbers, and spaces!');
        }
        if (!priceRegex.test(productData.price.toString().trim())) {
            return toast.error('Price must be a valid number with up to 2 decimal places!');
        }
        if (!stockRegex.test(productData.stock.toString().trim())) {
            return toast.error('Stock must be a valid integer value (up to 5 digits)!');
        }
    
        const jsonData = {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            stock: productData.stock,
            images: productData.images // Send only URLs and public IDs
        };
    
        try {
            const response = await axios.put(`${process.env.REACT_APP_API}/api/product/update/${id}`, jsonData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("Response:", response.data);
            toast.success('Product updated successfully!');
            setTimeout(() => {
                navigate('/admin/products');
              }, 3000); 
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error(error.response?.data?.message || 'Failed to update product');
        }
    };
    

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer/>
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200">
                        <h2 className="text-2xl font-bold mb-4">Update Product</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Product Name */}
                            <div>
                                <label className="label">
                                    <span className="label-text">Product Name</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={productData.name} 
                                    onChange={handleChange} 
                                    placeholder="Enter product name" 
                                    required 
                                    className="input input-bordered w-full" 
                                />
                            </div>
                            
                            {/* Description */}
                            <div>
                                <label className="label">
                                    <span className="label-text">Description</span>
                                </label>
                                <textarea
                                    name="description" 
                                    value={productData.description} 
                                    onChange={handleChange} 
                                    placeholder="Enter product description" 
                                    required 
                                    className="textarea textarea-bordered w-full" 
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label className="label">
                                    <span className="label-text">Price</span>
                                </label>
                                <input 
                                    type="number" 
                                    name="price" 
                                    value={productData.price} 
                                    onChange={handleChange} 
                                    placeholder="Enter product price" 
                                    min="0" 
                                    step="0.01"
                                    required 
                                    className="input input-bordered w-full" 
                                />
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="label">
                                    <span className="label-text">Stock</span>
                                </label>
                                <input 
                                    type="number" 
                                    name="stock" 
                                    value={productData.stock} 
                                    onChange={handleChange} 
                                    placeholder="Enter stock quantity" 
                                    min="0"
                                    required 
                                    className="input input-bordered w-full" 
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="label">
                                    <span className="label-text">Category</span>
                                </label>
                                <select 
                                    name="category" 
                                    value={productData.category} 
                                    onChange={handleChange} 
                                    required 
                                    className="select select-bordered w-full">
                                    <option value="">Select a category</option>
                                    {categories.map(category => (
                                        <option key={category._id} value={category._id}>{category.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Images */}
                            <div>
                                <label className="label">
                                    <span className="label-text">Images</span>
                                </label>
                                <input 
                                    type="file" 
                                    multiple 
                                    onChange={handleImageChange} 
                                    className="input input-bordered w-full" 
                                />
                            </div>
                            
                            {/* Display uploaded images */}
                            <div className="flex flex-wrap mt-4">
                                {Array.isArray(productData.images) && productData.images.map((image, index) => (
                                    <div key={index} className="relative mt-2">
                                        <img src={image.url} alt={`Product image ${index + 1}`} className="w-full h-auto" />
                                        <button 
                                            type="button" 
                                            onClick={() => handleImageRemove(index)} // Call handleImageRemove with the index
                                            className="absolute top-2 right-2 btn btn-circle btn-sm btn-error"
                                        >
                                            X
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button type="submit" className="btn btn-primary">Update Product</button>
                        </form>
                    </main>
                    <RightSidebar />
                </div>
                <LeftSidebar />
            </div>
            <NotificationContainer />
        </>
    );
}

export default UpdateProduct;
