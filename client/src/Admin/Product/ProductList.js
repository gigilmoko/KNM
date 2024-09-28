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

function ProductsList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState({});
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);

    useEffect(() => {
        mainContentRef.current.scroll({
            top: 0,
            behavior: "smooth"
        });
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
            const response = await axios.get(`${process.env.REACT_APP_API}/api/category`);
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

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/api/product`);
            if (response.data && Array.isArray(response.data.products)) {
                setProducts(response.data.products);
                setFilteredProducts(response.data.products);
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
        const productToDelete = products[index]; // Get the product to delete
        const imageDeletePromises = productToDelete.images.map(image => 
            axios.delete(`${process.env.REACT_APP_API}/api/product/delete-image/${image.public_id}`)
        );

        try {
            // Delete all images from Cloudinary
            await Promise.all(imageDeletePromises);
            
            // Now delete the product
            await axios.delete(`${process.env.REACT_APP_API}/api/product/delete/${id}`);
            
            // Update the state to remove the deleted product
            setProducts(products.filter((_, i) => i !== index));
            setFilteredProducts(filteredProducts.filter((_, i) => i !== index));

            console.log('Product and images deleted successfully');
        } catch (error) {
            console.error('Failed to delete product or images', error);
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

    return (
        <>
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard
                            title="All Products"
                            topMargin="mt-2"
                            TopSideButtons={<SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} />}
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
                                                    <td>${product.price.toFixed(2)}</td>
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
        </>
    );
}

export default ProductsList;
