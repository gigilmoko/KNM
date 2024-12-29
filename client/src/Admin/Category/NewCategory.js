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
            toast.error('Description can be up to 500 characters!');
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
            }, 3000);
        } catch (error) {
            console.error('Failed to create category', error);
            toast.error('Failed to create category');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer />
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard title="Create New Category" topMargin="mt-2">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={categoryData.name}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                        placeholder="Enter category name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        name="description"
                                        value={categoryData.description}
                                        onChange={handleInputChange}
                                        className="textarea textarea-bordered w-full"
                                        placeholder="Enter category description"
                                    />
                                </div>
                                <div className="mt-4">
                                    <button
                                        className="btn btn-primary"
                                        onClick={createCategory}
                                    >
                                        Create Category
                                    </button>
                                </div>
                            </div>
                        </TitleCard>
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

export default CreateCategory;
