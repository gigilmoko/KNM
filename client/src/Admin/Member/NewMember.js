import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from '../../Layout/Header';
import { toast, ToastContainer } from 'react-toastify';

// Regular expressions for validation
const nameRegex = /^[A-Za-z\s]{2,50}$/;  // Letters and spaces, 2-50 characters
const memberIdRegex = /^[A-Za-z0-9]{5,20}$/; // Letters and numbers, 5-20 characters

function NewMember() {
    const navigate = useNavigate();
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
        if (!nameRegex.test(memberData.fname.trim())) {
            toast.error('First name must be between 2 and 50 characters and can only contain letters and spaces!');
            return false;
        }
        if (!nameRegex.test(memberData.lname.trim())) {
            toast.error('Last name must be between 2 and 50 characters and can only contain letters and spaces!');
            return false;
        }
        if (!memberIdRegex.test(memberData.memberId.trim())) {
            toast.error('Member ID must be between 5 and 20 characters and can only contain letters and numbers!');
            return false;
        }
        return true;
    };

    const createMember = async () => {
        if (!validateForm()) return;
        try {
            const token = sessionStorage.getItem("token");
            await axios.post(`${process.env.REACT_APP_API}/api/members/new`, memberData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Member created successfully');
            setTimeout(() => {
                navigate('/admin/members/list');
            }, 2000);
        } catch (error) {
            toast.error('Failed to create member');
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
                                Create New Member
                            </h2>
                            <form
                                className="grid grid-cols-1 gap-4 sm:gap-6"
                                onSubmit={e => { e.preventDefault(); createMember(); }}
                                autoComplete="off"
                            >
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="fname"
                                        value={memberData.fname}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full text-sm"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="lname"
                                        value={memberData.lname}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full text-sm"
                                        placeholder="Enter last name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Member ID</label>
                                    <input
                                        type="text"
                                        name="memberId"
                                        value={memberData.memberId}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full text-sm"
                                        placeholder="Enter member ID"
                                    />
                                </div>
                                <div className="mt-2 sm:mt-4">
                                    <button
                                        type="submit"
                                        className="btn w-full text-base font-semibold bg-[#ed003f] text-white border-none hover:bg-red-700 transition"
                                    >
                                        Create Member
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

export default NewMember;