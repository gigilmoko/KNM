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
import { toast, ToastContainer } from 'react-toastify';

function CategoryList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);

    const [sortOrder, setSortOrder] = useState("asc");

    // Modal state for delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
    const [categoryToDeleteIndex, setCategoryToDeleteIndex] = useState(null);

    const toggleSortOrder = () => {
        const sortedCategories = [...filteredCategories].sort((a, b) => {
            return sortOrder === "asc" 
                ? a.name.localeCompare(b.name)
                : b.name.localeCompare(a.name);
        });

        setFilteredCategories(sortedCategories);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    useEffect(() => {
        mainContentRef.current?.scroll({
            top: 0,
            behavior: "smooth"
        });
        fetchCategories();
    }, []);

    useEffect(() => {
        applySearch(searchText);
    }, [searchText, categories]);

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
                setCategories(response.data.categories);
                setFilteredCategories(response.data.categories);
            } else {
                setCategories([]);
                setFilteredCategories([]);
            }
        } catch (error) {
            setCategories([]);
            setFilteredCategories([]);
        }
    };

    const confirmDeleteCategory = (id, index) => {
        setCategoryToDelete(id);
        setCategoryToDeleteIndex(index);
        setShowDeleteModal(true);
    };

    const deleteCurrentCategory = async () => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_API}/api/category/delete/${categoryToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setCategories(categories.filter((_, i) => i !== categoryToDeleteIndex));
            setFilteredCategories(filteredCategories.filter((_, i) => i !== categoryToDeleteIndex));
            toast.success('Category deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete category');
        }
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        setCategoryToDeleteIndex(null);
    };

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = categories.filter(category =>
            category.name.toLowerCase().includes(lowercasedValue) ||
            category.description.toLowerCase().includes(lowercasedValue)
        );
        setFilteredCategories(filtered);
    };

    const handleEdit = (id) => {
        navigate(`/admin/category/update/${id}`);
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
                            title={<span className="text-[#ed003f] font-bold">All Categories</span>}
                            topMargin="mt-2"
                            TopSideButtons={
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                    <SearchBar searchText={searchText} styleClass="mr-0 sm:mr-4" setSearchText={setSearchText} />
                                    <button 
                                        className="btn bg-[#ed003f] text-white font-bold border-none hover:bg-red-700 transition"
                                        onClick={toggleSortOrder}
                                    >
                                        {sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
                                    </button>
                                </div>
                            }
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full min-w-[400px]">
                                    <thead>
                                        <tr>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Category Name</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Description</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Edit</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map((category, index) => (
                                                <tr key={category._id} className="hover:bg-[#fff0f4] transition">
                                                    <td className="text-xs sm:text-base">{category.name}</td>
                                                    <td className="text-xs sm:text-base">{category.description}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-square btn-ghost border border-[#ed003f] hover:bg-[#fff0f4] transition"
                                                            onClick={() => handleEdit(category._id)}
                                                            style={{ color: "#ed003f" }}
                                                        >
                                                            <PencilIcon className="w-5" style={{ color: "#ed003f" }} />
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-square btn-ghost border border-[#ed003f] hover:bg-[#fff0f4] transition"
                                                            onClick={() => confirmDeleteCategory(category._id, index)}
                                                            style={{ color: "#ed003f" }}
                                                        >
                                                            <TrashIcon className="w-5" style={{ color: "#ed003f" }} />
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-4 text-[#ed003f]">Confirm Deletion</h2>
                        <p className="mb-6">Are you sure you want to delete this category?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="btn"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition"
                                onClick={deleteCurrentCategory}
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

export default CategoryList;