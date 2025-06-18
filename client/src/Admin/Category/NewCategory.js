import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import { toast, ToastContainer } from 'react-toastify';

// Regular expressions for validation
const nameRegex = /^[A-Za-z0-9\s]{5,100}$/;
const descriptionRegex = /^.{5,500}$/;

function CreateCategory() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const mainContentRef = useRef(null);

    const [categoryData, setCategoryData] = useState({
        name: '',
        description: '',
    });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCategoryData({ ...categoryData, [name]: value });
    };

    const validateForm = () => {
        if (!nameRegex.test(categoryData.name.trim())) {
            toast.error('Category name must be between 5 and 100 characters and can only contain letters, numbers, and spaces!');
            return false;
        }
        if (!descriptionRegex.test(categoryData.description.trim())) {
            toast.error('Description must be between 5 and 500 characters!');
            return false;
        }
        return true;
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
            setLoading(false);
        } catch (error) {
            setError('Failed to load profile.');
            setLoading(false);
        }
    };

    useEffect(() => {
        getProfile();
    }, []);

    const createCategory = async () => {
        if (!validateForm()) return;

        try {
            const token = sessionStorage.getItem("token");
            const categoryWithUser = { ...categoryData, user: user?._id };

            await axios.post(
                `${process.env.REACT_APP_API}/api/category/new`,
                categoryWithUser,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success('Category created successfully!');
            setTimeout(() => {
                navigate('/admin/category');
            }, 2000);
        } catch (error) {
            toast.error('Failed to create category');
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
                        <div className="max-w-xl w-full mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-8 mt-4">
                            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-[#ed003f]">
                                New Category
                            </h2>
                            <form
                                className="grid grid-cols-1 gap-4 sm:gap-6"
                                onSubmit={e => { e.preventDefault(); createCategory(); }}
                                autoComplete="off"
                            >
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={categoryData.name}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full text-sm"
                                        placeholder="Enter category name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={categoryData.description}
                                        onChange={handleInputChange}
                                        className="textarea textarea-bordered w-full text-sm"
                                        placeholder="Enter category description"
                                    />
                                </div>
                                <div className="mt-2 sm:mt-4">
                                    <button
                                        type="submit"
                                        className="btn w-full text-base font-semibold bg-[#ed003f] text-white border-none hover:bg-red-700 transition"
                                    >
                                        Create Category
                                    </button>
                                </div>
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

export default CreateCategory;