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
import { toast, ToastContainer } from 'react-toastify';

function ProductsList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState({});
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [showLowStockWarning, setShowLowStockWarning] = useState(true);
    const [user, setUser] = useState(null);
    const [sortByDate, setSortByDate] = useState('desc');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [productToDeleteIndex, setProductToDeleteIndex] = useState(null);

    useEffect(() => {
        mainContentRef.current?.scroll({
            top: 0,
            behavior: "smooth"
        });
        getProfile();
        fetchCategories();
        fetchProducts();
    }, []);

    useEffect(() => {
        applySearch(searchText);
    }, [searchText, products, categories]);

    useEffect(() => {
        if (newNotificationMessage !== "") {
            if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
            if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
            dispatch(removeNotificationMessage());
        }
    }, [newNotificationMessage, newNotificationStatus, dispatch]);

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
                setCategories({});
            }
        } catch (error) {
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
            // ignore
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/api/product/all`);
            if (response.data && Array.isArray(response.data.products)) {
                setProducts(response.data.products);
                setFilteredProducts(response.data.products);
                const lowStock = response.data.products.filter(product => product.stock < 10);
                setLowStockProducts(lowStock);
            } else {
                setProducts([]);
                setFilteredProducts([]);
            }
        } catch (error) {
            setProducts([]);
            setFilteredProducts([]);
        }
    };

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = products.filter(product =>
            product.name.toLowerCase().includes(lowercasedValue) ||
            product.description.toLowerCase().includes(lowercasedValue) ||
            (categories[product.category]?.toLowerCase().includes(lowercasedValue))
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

    const confirmDeleteProduct = (id, index) => {
        setProductToDelete(id);
        setProductToDeleteIndex(index);
        setShowDeleteModal(true);
    };

    const deleteCurrentProduct = async () => {
        const token = sessionStorage.getItem("token");
        try {
            await axios.delete(`${process.env.REACT_APP_API}/api/product/delete/${productToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProducts(products.filter((_, i) => i !== productToDeleteIndex));
            setFilteredProducts(filteredProducts.filter((_, i) => i !== productToDeleteIndex));
            toast.success('Product deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete product');
        }
        setShowDeleteModal(false);
        setProductToDelete(null);
        setProductToDeleteIndex(null);
    };

    return (
        <>
            <ToastContainer />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard
                            title={<span className="text-[#ed003f] font-bold">All Products</span>}
                            topMargin="mt-3"
                            containerClassName="!bg-[#ed003f] !text-white"
                            TopSideButtons={
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                    <SearchBar searchText={searchText} styleClass="mr-0 sm:mr-4" setSearchText={setSearchText} />
                                    <button
                                        className="btn bg-[#ed003f] text-white font-bold border-none hover:bg-red-700 transition"
                                        onClick={toggleSortByDate}
                                    >
                                        {sortByDate === 'desc' ? 'Sort by Date Ascending' : 'Sort by Date Descending'}
                                    </button>
                                </div>
                            }
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full min-w-[700px]">
                                    <thead>
                                        <tr>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Image</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Name</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Description</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Price</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Stock</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Category</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Edit</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map((product, index) => (
                                                <tr key={product._id} className="hover:bg-[#fff0f4] transition">
                                                    <td>
                                                        {product.images.length > 0 ? (
                                                            <img src={product.images[0].url} alt={product.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded" />
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No image</span>
                                                        )}
                                                    </td>
                                                    <td className="text-xs sm:text-base">{product.name}</td>
                                                    <td className="text-xs sm:text-base">{product.description}</td>
                                                    <td className="text-xs sm:text-base">₱{product.price.toFixed(2)}</td>
                                                    <td className={`text-xs sm:text-base ${product.stock < 10 ? 'text-[#ed003f] font-bold' : ''}`}>{product.stock}</td>
                                                    <td className="text-xs sm:text-base">{categories[product.category] || 'Unknown'}</td>
                                                    <td>
                                                        <button className="btn btn-square btn-ghost border border-[#ed003f] hover:bg-[#fff0f4] transition" onClick={() => handleEdit(product._id)}>
                                                            <PencilIcon className="w-5" style={{ color: "#ed003f" }} />
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-square btn-ghost border border-[#ed003f] hover:bg-[#fff0f4] transition" onClick={() => confirmDeleteProduct(product._id, index)}>
                                                            <TrashIcon className="w-5" style={{ color: "#ed003f" }} />
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
            {lowStockProducts.length > 0 && showLowStockWarning && (
                <div className="fixed bottom-4 right-4 bg-[#ed003f] text-white p-4 rounded shadow-lg z-50 max-w-xs w-full">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-base">Low Stock Warning</h3>
                        <button className="btn btn-sm btn-ghost text-white" onClick={toggleLowStockWarning}>
                            <ChevronDownIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <ul className="text-xs">
                        {lowStockProducts.map(product => (
                            <li key={product._id}>{product.name} - {product.stock} left</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-4 text-[#ed003f]">Confirm Deletion</h2>
                        <p className="mb-6">Are you sure you want to delete this product?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="btn"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition"
                                onClick={deleteCurrentProduct}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ProductsList;