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
const nameRegex = /^[A-Za-z\s]{2,50}$/;  // Letters and spaces, 2-50 characters
const memberIdRegex = /^[A-Za-z0-9]{1,20}$/; // Letters and numbers, 5-20 characters

function NewMember() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const mainContentRef = useRef(null);

    const [memberData, setMemberData] = useState({
        fname: '',
        lname: '',
        memberId: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMemberData({ ...memberData, [name]: value });
    };

    const validateForm = () => {
        // Validate first name
        if (!nameRegex.test(memberData.fname.trim())) {
            NotificationManager.error('First name must be between 2 and 50 characters and can only contain letters and spaces!', 'Error');
            return false;
        }

        // Validate last name
        if (!nameRegex.test(memberData.lname.trim())) {
            NotificationManager.error('Last name must be between 2 and 50 characters and can only contain letters and spaces!', 'Error');
            return false;
        }

        // Validate member ID
        if (!memberIdRegex.test(memberData.memberId.trim())) {
            NotificationManager.error('Member ID must be between 5 and 20 characters and can only contain letters and numbers!', 'Error');
            return false;
        }

        return true;
    };

    const createMember = async () => {
        // Perform validation before submitting
        if (!validateForm()) {
            return; // Stop the function if validation fails
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API}/api/members/new`, memberData);
            NotificationManager.success('Member created successfully', 'Success');
            navigate('/admin/members/list');
        } catch (error) {
            NotificationManager.error('Failed to create member', 'Error');
        }
    };

    return (
        <>
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard title="Create New Member" topMargin="mt-2">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        name="fname"
                                        value={memberData.fname}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="lname"
                                        value={memberData.lname}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Member ID</label>
                                    <input
                                        type="text"
                                        name="memberId"
                                        value={memberData.memberId}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                        placeholder="Enter member ID"
                                    />
                                </div>
                                <div className="mt-4">
                                    <button
                                        className="btn btn-primary"
                                        onClick={createMember}
                                    >
                                        Create Member
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

export default NewMember;
