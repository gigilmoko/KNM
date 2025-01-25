import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import { removeNotificationMessage } from "../../Layout/common/headerSlice";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from "../../Layout/Header";
import SearchBar from "../../Layout/components/Input/SearchBar";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon'; 
import ChevronUpIcon from '@heroicons/react/24/outline/ChevronUpIcon';
import ChevronDownIcon from '@heroicons/react/24/outline/ChevronDownIcon';
import { toast, ToastContainer } from 'react-toastify'; // Importing toast

function ProductsList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState({});
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);
    const [lowStockProducts, setLowStockProducts] = useState([]); // State to manage low stock products
    const [showLowStockWarning, setShowLowStockWarning] = useState(true); // State to manage visibility of low stock warning
    const [user, setUser] = useState(null); // Define user state
    const [sortByDate, setSortByDate] = useState('desc'); // New state for date sorting

    useEffect(() => {
        mainContentRef.current.scroll({
            top: 0,
            behavior: "smooth"
        });
        getProfile();
        fetchCategories();
        fetchProducts();
    }, []);

    useEffect(() => {
        applySearch(searchText);
    }, [searchText, products]);

    useEffect(() => {
        if (newNotificationMessage !== "") {
            if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
            if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
            dispatch(removeNotificationMessage());
        }
    }, [newNotificationMessage]);

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/api/category/all`);
            if (response.data && Array.isArray(response.data.categories)) {
                const categoryMap = response.data.categories.reduce((acc, category) => {
                    acc[category._id] = category.name;
                    return acc;
                }, {});
                setCategories(categoryMap);
            } else {
                console.error('Data fetched is not an array:', response.data);
                setCategories({});
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
            setCategories({});
        }
    };

    const getProfile = async () => {
        const config = {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            },
        };
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
            setUser(data.user);
        } catch (error) {
            console.error('Failed to load profile.');
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/api/product/all`);
            if (response.data && Array.isArray(response.data.products)) {
                setProducts(response.data.products);
                setFilteredProducts(response.data.products);
                const lowStock = response.data.products.filter(product => product.stock < 10);
                setLowStockProducts(lowStock); // Set low stock products
            } else {
                console.error('Data fetched is not an array:', response.data);
                setProducts([]);
                setFilteredProducts([]);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
            setProducts([]);
            setFilteredProducts([]);
        }
    };

    const deleteCurrentProduct = async (id, index) => {
        const token = sessionStorage.getItem("token");
        try {
            await axios.delete(`${process.env.REACT_APP_API}/api/product/delete/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProducts(products.filter((_, i) => i !== index));
            setFilteredProducts(filteredProducts.filter((_, i) => i !== index));
            toast.success('Product deleted successfully!');
        } catch (error) {
            console.error('Failed to delete product', error);
            toast.error('Failed to delete product');
        }
    };

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(lowercasedValue) ||
            product.description.toLowerCase().includes(lowercasedValue) ||
            categories[product.category]?.toLowerCase().includes(lowercasedValue)
        );
        setFilteredProducts(filtered);
    };

    const handleEdit = (id) => {
        navigate(`/admin/products/update/${id}`);
    };

    const toggleLowStockWarning = () => {
        setShowLowStockWarning(!showLowStockWarning);
    };

    const toggleSortByDate = () => {
        const sortedProducts = [...filteredProducts].sort((a, b) =>
            sortByDate === 'desc'
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt)
        );
        setFilteredProducts(sortedProducts);
        setSortByDate(sortByDate === 'desc' ? 'asc' : 'desc');
    };

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer/>
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard
                            title="All Products"
                            topMargin="mt-2"
                            TopSideButtons={
                                <div className="flex items-center space-x-2">
                                    {/* <SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} /> */}
                                    <button
                                        className="btn btn-primary"
                                        onClick={toggleSortByDate}
                                    >
                                        {sortByDate === 'desc' ? 'Sort by Date Ascending' : 'Sort by Date Descending'}
                                    </button>
                                </div>
                            }
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Product Name</th>
                                            <th>Description</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Category</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map((product, index) => (
                                                <tr key={product._id}>
                                                    <td>
                                                        {product.images.length > 0 ? (
                                                            <img src={product.images[0].url} alt={product.name} className="w-16 h-16 object-cover" />
                                                        ) : (
                                                            <span>No image</span>
                                                        )}
                                                    </td>
                                                    <td>{product.name}</td>
                                                    <td>{product.description}</td>
                                                    <td>₱{product.price.toFixed(2)}</td>
                                                    <td>{product.stock}</td>
                                                    <td>{categories[product.category] || 'Unknown'}</td>
                                                    <td>
                                                        <button className="btn btn-square btn-ghost" onClick={() => handleEdit(product._id)}>
                                                            <PencilIcon className="w-5" />
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-square btn-ghost" onClick={() => deleteCurrentProduct(product._id, index)}>
                                                            <TrashIcon className="w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center">No products found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </TitleCard>
                        <div className="h-16"></div>
                    </main>
                </div>
                <LeftSidebar />
            </div>
            <RightSidebar />
            <NotificationContainer />
            <ModalLayout />

            {/* Low Stock Banner */}
            {lowStockProducts.length > 0 && (
                <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded shadow-lg">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold">Low Stock Warning</h3>
                        <button className="btn btn-sm btn-outline border-none" onClick={toggleLowStockWarning}>
                            {showLowStockWarning ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    {showLowStockWarning && (
                        <ul>
                            {lowStockProducts.map(product => (
                                <li key={product._id}>{product.name} - {product.stock} left</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </>
    );
}

export default ProductsList;