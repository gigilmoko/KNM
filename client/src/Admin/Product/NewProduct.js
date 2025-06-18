import { useEffect, useState, useRef } from "react";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from "../../Layout/Header";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import { toast, ToastContainer } from 'react-toastify';

// Cloudinary upload function (replace with your config if needed)
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

const nameRegex = /^[A-Za-z0-9\s]{5,100}$/;
const priceRegex = /^\d+(\.\d{1,2})?$/;
const stockRegex = /^\d{1,5}$/;

function CreateProduct() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const mainContentRef = useRef(null);

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
            images: [...prevData.images, ...validImages],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nameRegex.test(productData.name.trim())) {
            return toast.error('Product name must only contain letters, numbers, and spaces, and be between 5 to 100 characters!');
        }
        if (!priceRegex.test(productData.price.toString().trim())) {
            return toast.error('Price must be a valid number with up to 2 decimal places!');
        }
        if (!stockRegex.test(productData.stock.toString().trim())) {
            return toast.error('Stock must be a valid integer value (up to 5 digits)!');
        }
        if (productData.category === "") {
            return toast.error('Category is required!');
        }
        if (productData.images.length === 0) {
            return toast.error('At least one product image is required!');
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

            await axios.post(`${process.env.REACT_APP_API}/api/product/new`, productWithUser, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Product created successfully!');
            setTimeout(() => {
                navigate('/admin/products');
            }, 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred while creating product.');
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-base-200" ref={mainContentRef}>
                        <div className="max-w-2xl w-full mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-8 mt-4">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-[#ed003f]">
                                Create New Product
                            </h2>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:gap-6" autoComplete="off">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={productData.name}
                                        onChange={handleChange}
                                        className="input input-bordered w-full text-sm"
                                        placeholder="Enter product name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={productData.description}
                                        onChange={handleChange}
                                        className="textarea textarea-bordered w-full text-sm"
                                        placeholder="Enter product description"
                                        required
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
                                        {productData.images.map((image, index) => (
                                            <img key={index} src={image.url} alt="Preview" className="w-20 h-20 object-cover mr-2 mb-2 rounded" />
                                        ))}
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="btn w-full text-base font-semibold bg-[#ed003f] text-white border-none hover:bg-red-700 transition"
                                >
                                    Create Product
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

export default CreateProduct;