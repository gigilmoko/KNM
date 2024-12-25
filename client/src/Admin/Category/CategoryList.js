import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
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
import PencilIcon from '@heroicons/react/24/outline/PencilIcon'; // Import the edit icon
import { toast, ToastContainer } from 'react-toastify'; // Importing toast

function CategoryList() {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // Initialize navigate
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        mainContentRef.current.scroll({
            top: 0,
            behavior: "smooth"
        });
        fetchCategories();
    }, []);

    useEffect(() => {
        getProfile();
        applySearch(searchText);
    }, [searchText, categories]);

    useEffect(() => {
        if (newNotificationMessage !== "") {
            if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
            if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
            dispatch(removeNotificationMessage());
        }
    }, [newNotificationMessage]);

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
                setFilteredCategories(response.data.categories);
            } else {
                console.error('Data fetched is not an array:', response.data);
                setCategories([]);
                setFilteredCategories([]);
            }
        } catch (error) {
            console.error('Failed to fetch categories', error);
            setCategories([]);
            setFilteredCategories([]);
        }
    };

    const deleteCurrentCategory = async (id, index) => {
        try {

            const token = sessionStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_API}/api/category/delete/${id}`,{
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            // Update state to remove the deleted category
            setCategories(categories.filter((_, i) => i !== index));
            setFilteredCategories(filteredCategories.filter((_, i) => i !== index));
            
            // Show success toast
            toast.success('Category deleted successfully!');
        } catch (error) {
            console.error('Failed to delete category', error);
            // Show error toast
            toast.error('Failed to delete category');
        }
    };
    

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = categories.filter(category =>
            category.name.toLowerCase().includes(lowercasedValue) ||
            category.description.toLowerCase().includes(lowercasedValue)
        );
        setFilteredCategories(filtered);
    };

    // Function to handle redirect to edit category page
    const handleEdit = (id) => {
        navigate(`/admin/category/update/${id}`); // Redirect to the update page
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
                            title="All Categories"
                            topMargin="mt-2"
                            TopSideButtons={<SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} />}
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Category Name</th>
                                            <th>Description</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map((category, index) => (
                                                <tr key={category._id}>
                                                    <td>{category.name}</td>
                                                    <td>{category.description}</td>
                                                    <td>
                                                        <button className="btn btn-square btn-ghost" onClick={() => handleEdit(category._id)} >
                                                            <PencilIcon className="w-5" />
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-square btn-ghost" onClick={() => deleteCurrentCategory(category._id, index)} >
                                                            <TrashIcon className="w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No categories found</td>
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

export default CategoryList;
