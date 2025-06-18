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
import { toast, ToastContainer } from 'react-toastify';

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

const cloudinaryDelete = async (public_id) => {
    try {
        await axios.delete(`${process.env.REACT_APP_API}/api/product/delete-image/${public_id}`);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
};

const nameRegex = /^[A-Za-z0-9\s]{5,100}$/;
const priceRegex = /^\d+(\.\d{1,2})?$/;
const stockRegex = /^\d{1,5}$/;

function UpdateProduct() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: 0,
        category: "",
        stock: 0,
        images: []
    });
    const [categories, setCategories] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getProfile();
        fetchCategories();
        fetchProductDetails();
        // eslint-disable-next-line
    }, []);

    const getProfile = async () => {
        const config = {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            },
        };
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
            setUser(data.user);
            setLoading(false);
        } catch (error) {
            setError('Failed to load profile.');
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/api/category/all`);
            if (response.data && Array.isArray(response.data.categories)) {
                setCategories(response.data.categories);
            } else {
                setCategories([]);
            }
        } catch (error) {
            setCategories([]);
        }
    };

    const fetchProductDetails = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/api/product/${id}`);
            if (response.data && response.data.success) {
                const { product } = response.data;
                setProductData({
                    name: product.name || "",
                    description: product.description || "",
                    price: product.price || 0,
                    category: product.category?._id || product.category || "",
                    stock: product.stock || 0,
                    images: Array.isArray(product.images) ? product.images : []
                });
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
        const uploadedImages = await Promise.all(
            files.map(async (file) => {
                const result = await cloudinaryUpload(file);
                return result;
            })
        );
        const validImages = uploadedImages.filter(img => img !== null);
        setProductData((prevData) => ({
            ...prevData,
            images: [...prevData.images, ...validImages.map(img => ({ url: img.url, public_id: img.public_id }))]
        }));
    };

    const handleImageRemove = async (index) => {
        const imageToRemove = productData.images[index];
        await cloudinaryDelete(imageToRemove.public_id);
        setProductData((prevData) => {
            const updatedImages = prevData.images.filter((_, i) => i !== index);
            return {
                ...prevData,
                images: updatedImages,
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
            images: productData.images
        };

        try {
            const token = sessionStorage.getItem("token");
            const productWithUser = { ...jsonData, user: user?._id };

            await axios.put(`${process.env.REACT_APP_API}/api/product/update/${id}`, productWithUser, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            toast.success('Product updated successfully!');
            setTimeout(() => {
                navigate('/admin/products');
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update product');
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-base-200">
                        <div className="max-w-2xl w-full mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-8 mt-4">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-[#ed003f]">
                                Update Product
                            </h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:gap-6" autoComplete="off">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        value={productData.name} 
                                        onChange={handleChange} 
                                        placeholder="Enter product name" 
                                        required 
                                        className="input input-bordered w-full text-sm" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description" 
                                        value={productData.description} 
                                        onChange={handleChange} 
                                        placeholder="Enter product description" 
                                        required 
                                        className="textarea textarea-bordered w-full text-sm" 
                                    />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Price</label>
                                        <input 
                                            type="number" 
                                            name="price" 
                                            value={productData.price} 
                                            onChange={handleChange} 
                                            placeholder="Enter product price" 
                                            min="0" 
                                            step="0.01"
                                            required 
                                            className="input input-bordered w-full text-sm" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Stock</label>
                                        <input 
                                            type="number" 
                                            name="stock" 
                                            value={productData.stock} 
                                            onChange={handleChange} 
                                            placeholder="Enter stock quantity" 
                                            min="0"
                                            required 
                                            className="input input-bordered w-full text-sm" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select 
                                        name="category" 
                                        value={productData.category} 
                                        onChange={handleChange} 
                                        required 
                                        className="select select-bordered w-full text-sm"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(category => (
                                            <option key={category._id} value={category._id}>{category.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Images</label>
                                    <input 
                                        type="file" 
                                        multiple 
                                        onChange={handleImageChange} 
                                        className="file-input file-input-bordered w-full text-sm"
                                        style={{
                                            background: 'transparent',
                                            border: '1px solid #ed003f',
                                            color: '#ed003f',
                                            boxShadow: 'none'
                                        }}
                                    />
                                    <div className="flex flex-wrap mt-2">
                                        {Array.isArray(productData.images) && productData.images.map((image, index) => (
                                            <div key={index} className="relative mt-2 mr-2" style={{ width: '90px', height: '90px' }}>
                                                <img
                                                    src={image.url}
                                                    alt={`Product image ${index + 1}`}
                                                    className="w-full h-full object-cover rounded"
                                                    style={{ minWidth: '90px', minHeight: '90px', maxWidth: '90px', maxHeight: '90px' }}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleImageRemove(index)}
                                                    className="absolute top-0 right-0 bg-white text-[#ed003f] hover:text-red-700 rounded-full p-1 shadow focus:outline-none"
                                                    style={{ zIndex: 2, fontSize: '1.2rem', lineHeight: '1.2rem' }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="btn w-full text-base font-semibold bg-[#ed003f] text-white border-none hover:bg-red-700 transition"
                                >
                                    Update Product
                                </button>
                            </form>
                        </div>
                        <div className="h-16"></div>
                    </main>
                </div>
                <LeftSidebar />
                <RightSidebar />
                <NotificationContainer />
                <ModalLayout />
            </div>
        </>
    );
}

export default UpdateProduct;