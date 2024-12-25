import { useEffect, useState } from "react";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from "../../Layout/Header";
import { toast, ToastContainer } from 'react-toastify'; // Importing toast

// Your cloudinary config (replace with actual config)
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

function CreateProduct() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [productData, setProductData] = useState({
        name: "",
        description: "",
        price: 0,
        category: "",
        stock: 0,
        images: [] // Will hold URLs instead of files
    });
    const [categories, setCategories] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    useEffect(() => {
        getProfile();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/api/category/all`);
            if (response.data && Array.isArray(response.data.categories)) {
                setCategories(response.data.categories);
            } else {
                console.error('Data fetched is not an array:', response.data);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
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
                const result = await cloudinaryUpload(file);
                console.log("Uploaded image:", result);
                return result;
            })
        );

        const validImages = uploadedImages.filter(img => img !== null);
        console.log("Valid images after filtering:", validImages);

        setProductData((prevData) => {
            const updatedImages = [...prevData.images, ...validImages];
            console.log("Updated productData with images:", updatedImages);
            return {
                ...prevData,
                images: updatedImages,
            };
        });
    };

    const nameRegex = /^[A-Za-z0-9\s]{5,100}$/;
    const priceRegex = /^\d+(\.\d{1,2})?$/;
    const stockRegex = /^\d{1,5}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validations
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

            const response = await axios.post(`${process.env.REACT_APP_API}/api/product/new`, productWithUser, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Response:", response.data);
            toast.success('Product created successfully!');
            setTimeout(() => {
                navigate('/admin/products');
            }, 3000);
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error(error.response?.data?.message || 'An error occurred while creating product.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer/>
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200">
                        <h2 className="text-2xl font-bold mb-4">Create New Product</h2>
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
                                    className="file-input file-input-bordered w-full" 
                                />
                                {productData.images.map((image, index) => (
                                    <img key={index} src={image.url} alt="Preview" className="w-20 h-20 object-cover mt-2" />
                                ))}
                            </div>

                            {/* Submit Button */}
                            <button type="submit" className="btn btn-primary">Create Product</button>
                        </form>
                        <div className="h-16"></div>
                    </main>
                </div>
                <LeftSidebar />
            </div>
            <RightSidebar />
            <NotificationContainer />
            <ModalLayout />
        </>
    );
}

export default CreateProduct;
