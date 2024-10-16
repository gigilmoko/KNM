import { useState, useEffect, useRef } from 'react';
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
import { toast, ToastContainer } from 'react-toastify'

// Regular expressions for validation
const nameRegex = /^[A-Za-z\s]{2,50}$/;  // Letters and spaces, 2-50 characters
const memberIdRegex = /^[A-Za-z0-9]{5,20}$/; // Letters and numbers, 5-20 characters

function UpdateMember() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { memberId } = useParams();  // Get the member ID from the URL
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const mainContentRef = useRef(null);

    const [memberData, setMemberData] = useState({
        fname: '',
        lname: '',
        memberId: ''
    });

    useEffect(() => {
        fetchMemberData();
    }, []);

    useEffect(() => {
        if (newNotificationMessage !== "") {
            if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
            if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
            dispatch(removeNotificationMessage());
        }
    }, [newNotificationMessage]);

    const fetchMemberData = async () => {
        try {
            console.log(`Fetching data for member with ID: ${memberId}`);  // Log the memberId to ensure it's correctly passed
            const response = await axios.get(`${process.env.REACT_APP_API}/api/members/${memberId}`);
            
            // Check if the response is as expected
            console.log("Response:", response);
    
            // Assuming the member data is inside response.data.data
            if (response.data && response.data.data) {
                console.log("Fetched member data:", response.data.data);
                setMemberData({
                    fname: response.data.data.fname,
                    lname: response.data.data.lname,
                    memberId: response.data.data.memberId
                });
            } else {
                console.error('Member not found in response:', response.data);
                NotificationManager.error('Member not found', 'Error');
                // Optionally, navigate away if needed:
                // navigate('/admin/members');  
            }
        } catch (error) {
            console.error('Error fetching member data:', error);
            NotificationManager.error('Failed to fetch member data', 'Error');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setMemberData({ ...memberData, [name]: value });
    };

    const validateForm = () => {
        // Validate first name
        if (!nameRegex.test(memberData.fname.trim())) {
            toast.error('First name must be between 2 and 50 characters and can only contain letters and spaces!');
            return false;
        }
    
        // Validate last name
        if (!nameRegex.test(memberData.lname.trim())) {
            toast.error('Last name must be between 2 and 50 characters and can only contain letters and spaces!');
            return false;
        }
    
        // Validate member ID
        if (!memberIdRegex.test(memberData.memberId.trim())) {
            toast.error('Member ID must be between 5 and 20 characters and can only contain letters and numbers!');
            return false;
        }
    
        return true;
    };
    
    const updateMember = async () => {
        // Perform validation before submitting
        if (!validateForm()) {
            return; // Stop the function if validation fails
        }
    
        try {
            await axios.put(`${process.env.REACT_APP_API}/api/members/${memberId}`, memberData);
            toast.success('Member updated successfully');
            setTimeout(() => {
                navigate('/admin/members/list');
              }, 3000); 
        } catch (error) {
            toast.error('Failed to update member');
        }
    };
    

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer/>
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard title="Update Member" topMargin="mt-2">
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
                                        onClick={updateMember}
                                    >
                                        Update Member
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

export default UpdateMember;
