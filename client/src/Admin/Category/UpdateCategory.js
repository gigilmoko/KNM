import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import { removeNotificationMessage } from '../../Layout/common/headerSlice';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import { toast, ToastContainer } from 'react-toastify'; // Importing toast

// Regular expressions for validation
const nameRegex = /^[A-Za-z0-9\s]{5,100}$/;  // Letters, numbers, spaces, 5-100 characters
const descriptionRegex = /^.{5,500}$/;       // Description must be between 5 and 500 characters

function UpdateCategory() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams(); // Get category ID from URL
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const mainContentRef = useRef(null);
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

    const [categoryData, setCategoryData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        getProfile();
        fetchCategory();
    }, []);

    useEffect(() => {
        if (newNotificationMessage !== "") {
            if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
            if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
            dispatch(removeNotificationMessage());
        }
    }, [newNotificationMessage]);

    const fetchCategory = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/api/category/${id}`);
            if (response.data && response.data.category) {
                setCategoryData(response.data.category);
            } else {
                console.error('Category not found:', response.data);
            }
        } catch (error) {
            console.error('Failed to fetch category', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCategoryData({ ...categoryData, [name]: value });
    };

    const validateForm = () => {
        // Validate category name
        if (!nameRegex.test(categoryData.name.trim())) {
            toast.error('Category name must be between 5 and 100 characters and can only contain letters, numbers, and spaces!');
            return false;
        }
    
        // Validate description (must be between 5 and 500 characters)
        if (!descriptionRegex.test(categoryData.description.trim())) {
            toast.error('Description must be between 5 and 500 characters!');
            return false;
        }
    
        return true;
    };
    
    const updateCategory = async () => {
        if (!validateForm()) return;
    
        try {
            const token = sessionStorage.getItem("token");
            const categoryWithUser = { ...categoryData, user: user?._id };
    
            await axios.put(
                `${process.env.REACT_APP_API}/api/category/update/${id}`,
                categoryWithUser,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
    
            toast.success('Category updated successfully!');
            setTimeout(() => {
                navigate('/admin/category');
            }, 3000);
        } catch (error) {
            console.error('Failed to update category', error);
            toast.error('Failed to update category');
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
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard title="Update Category" topMargin="mt-2">
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
                                        onClick={updateCategory}
                                    >
                                        Update Category
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

export default UpdateCategory;
