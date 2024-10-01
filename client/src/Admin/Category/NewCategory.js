import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import { removeNotificationMessage } from '../../Layout/common/headerSlice';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';

// Regular expressions for validation
const nameRegex = /^[A-Za-z0-9\s]{5,100}$/;  // Letters, numbers, spaces, 5-100 characters
const descriptionRegex = /^.{5,500}$/;       // Description up to 500 characters (optional)

function CreateCategory() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const mainContentRef = useRef(null);

    const [categoryData, setCategoryData] = useState({
        name: '',
        description: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCategoryData({ ...categoryData, [name]: value });
    };

    const validateForm = () => {
        // Validate category name
        if (!nameRegex.test(categoryData.name.trim())) {
            NotificationManager.error('Category name must be between 5 and 100 characters and can only contain letters, numbers, and spaces!', 'Error');
            return false;
        }

        // Validate description (optional, max 500 characters)
        if (!descriptionRegex.test(categoryData.description.trim())) {
            NotificationManager.error('Description can be up to 500 characters!', 'Error');
            return false;
        }

        return true;
    };

    const createCategory = async () => {
        // Perform validation before submitting
        if (!validateForm()) {
            return; // Stop the function if validation fails
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API}/api/category/new`, categoryData);
            NotificationManager.success('Category created successfully', 'Success');
            navigate('/admin/category');
        } catch (error) {
            NotificationManager.error('Failed to create category', 'Error');
        }
    };

    return (
        <>
            <div className="drawer lg:drawer-open">
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
                                        placeholder="Enter category description "
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
