import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import moment from "moment";
import { useSelector, useDispatch } from 'react-redux';
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
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';  // Add Pencil Icon for Edit
import { useNavigate } from 'react-router-dom'; // Import the hook

function MembersList() {
  const navigate = useNavigate(); // Hook to access navigation
    const dispatch = useDispatch();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [members, setMembers] = useState([]);
    const [filteredMembers, setFilteredMembers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);

    useEffect(() => {
        mainContentRef.current.scroll({
            top: 0,
            behavior: "smooth"
        });
        fetchMembers();
    }, []);

    useEffect(() => {
        applySearch(searchText);
    }, [searchText, members]);

    useEffect(() => {
        if (newNotificationMessage !== "") {
            if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
            if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
            dispatch(removeNotificationMessage());
        }
    }, [newNotificationMessage]);

    const fetchMembers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API}/api/members`);
            if (response.data && Array.isArray(response.data.data)) {
                setMembers(response.data.data);
                setFilteredMembers(response.data.data);
                console.log('Fetched members:', response.data.data);
            } else {
                console.error('Data fetched is not an array:', response.data);
                setMembers([]);
                setFilteredMembers([]);
            }
        } catch (error) {
            console.error('Failed to fetch members', error);
            setMembers([]);
            setFilteredMembers([]);
        }
    };

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = members.filter(member => 
            member.fname.toLowerCase().includes(lowercasedValue) ||
            member.lname.toLowerCase().includes(lowercasedValue) ||
            member.memberId.toLowerCase().includes(lowercasedValue)
        );
        setFilteredMembers(filtered);
    };

    const deleteCurrentMember = async (id, index) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API}/api/members/${id}`);
            console.log('Member deletion response:', response.data);
    
            setMembers(members.filter((_, i) => i !== index));
            setFilteredMembers(filteredMembers.filter((_, i) => i !== index));
        } catch (error) {
            console.error('Failed to delete member', error);
        }
    };

    const handleEdit = (id) => {
      // Redirect to the edit page for the member using the ID
      navigate(`/admin/members/edit/${id}`); // Navigate to edit page with member ID in the URL
  };

    return (
        <>
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard
                            title="All Members"
                            topMargin="mt-2"
                            TopSideButtons={<SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} />}
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Member ID</th>
                                            <th>Edit</th>
                                            <th>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredMembers.length > 0 ? (
                                            filteredMembers.map((member, index) => (
                                                <tr key={member._id}>
                                                    <td>
                                                        <div className="flex items-center space-x-3">
                                                            <div>
                                                                <div className="font-bold">{`${member.fname} ${member.lname}`}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{member.memberId}</td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-square btn-ghost" 
                                                            onClick={() => handleEdit(member._id)} 
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="w-5 text-yellow-500" />
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-square btn-ghost" onClick={() => deleteCurrentMember(member._id, index)}>
                                                            <TrashIcon className="w-5 text-red-500" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No members found</td>
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

export default MembersList;
