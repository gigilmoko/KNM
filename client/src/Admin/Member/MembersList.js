import { useEffect, useState, useRef } from "react";
import axios from 'axios';
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
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

function MembersList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('fname');
  const [sortByDate, setSortByDate] = useState('desc');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [memberToDeleteIndex, setMemberToDeleteIndex] = useState(null);
  const mainContentRef = useRef(null);

  useEffect(() => {
    mainContentRef.current?.scroll({
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
  }, [newNotificationMessage, newNotificationStatus, dispatch]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/members`);
      if (response.data && Array.isArray(response.data.data)) {
        setMembers(response.data.data);
        setFilteredMembers(response.data.data);
      } else {
        setMembers([]);
        setFilteredMembers([]);
      }
    } catch (error) {
      setMembers([]);
      setFilteredMembers([]);
    }
  };

  const applySearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    const filtered = members.filter(member =>
      member.fname.toLowerCase().includes(lowercasedValue) ||
      member.lname.toLowerCase().includes(lowercasedValue) ||
      (member.memberId && member.memberId.toLowerCase().includes(lowercasedValue))
    );
    setFilteredMembers(filtered);
  };

  const handleEdit = (id) => {
    navigate(`/admin/members/edit/${id}`);
  };

  const handleNewMember = () => {
    navigate('/admin/members/new');
  };

  const handleSort = (column) => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    setSortBy(column);

    const sortedMembers = [...filteredMembers].sort((a, b) => {
      if (a[column] < b[column]) return sortOrder === 'asc' ? -1 : 1;
      if (a[column] > b[column]) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredMembers(sortedMembers);
  };

  const toggleSortByDate = () => {
    const sortedMembers = [...filteredMembers].sort((a, b) =>
      sortByDate === 'desc'
        ? new Date(b.createdAt) - new Date(a.createdAt)
        : new Date(a.createdAt) - new Date(b.createdAt)
    );
    setFilteredMembers(sortedMembers);
    setSortByDate(sortByDate === 'desc' ? 'asc' : 'desc');
  };

  const confirmDeleteMember = (id, index) => {
    setMemberToDelete(id);
    setMemberToDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const deleteCurrentMember = async () => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API}/api/members/${memberToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Member deleted successfully!');
      setMembers(members.filter((_, i) => i !== memberToDeleteIndex));
      setFilteredMembers(filteredMembers.filter((_, i) => i !== memberToDeleteIndex));
    } catch (error) {
      toast.error('Failed to delete member');
    }
    setShowDeleteModal(false);
    setMemberToDelete(null);
    setMemberToDeleteIndex(null);
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <ToastContainer />
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-base-200" ref={mainContentRef}>
            <TitleCard
              title={<span className="text-[#ed003f] font-bold">All Members</span>}
              topMargin="mt-2"
              TopSideButtons={
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <SearchBar searchText={searchText} styleClass="mr-0 sm:mr-4" setSearchText={setSearchText} />
                  <button
                    className="btn bg-[#ed003f] text-white font-bold border-none hover:bg-red-700 transition"
                    onClick={toggleSortByDate}
                  >
                    {sortByDate === 'desc' ? 'Sort by Date Ascending' : 'Sort by Date Descending'}
                  </button>
                  <button
                    className="btn bg-[#ed003f] text-white font-bold border-none hover:bg-red-700 transition flex items-center gap-2"
                    onClick={handleNewMember}
                  >
                    <PlusIcon className="w-4 h-4" />
                    New Member
                  </button>
                </div>
              }
            >
              <div className="overflow-x-auto w-full">
                <table className="table w-full min-w-[400px]">
                  <thead>
                    <tr>
                      <th>
                        <button
                          onClick={() => handleSort('fname')}
                          className="bg-transparent border-none font-bold text-xs sm:text-sm text-[#ed003f] hover:underline"
                        >
                          Name {sortBy === 'fname' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                      </th>
                      <th>
                        <button
                          onClick={() => handleSort('memberId')}
                          className="bg-transparent border-none font-bold text-xs sm:text-sm text-[#ed003f] hover:underline"
                        >
                          Member ID {sortBy === 'memberId' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                      </th>
                      <th className="text-[#ed003f] text-xs sm:text-sm">Edit</th>
                      <th className="text-[#ed003f] text-xs sm:text-sm">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member, index) => (
                        <tr key={member._id} className="hover:bg-[#fff0f4] transition">
                          <td>
                            <div className="flex items-center space-x-2">
                              <div className="font-bold text-xs sm:text-base">{`${member.fname} ${member.lname}`}</div>
                            </div>
                          </td>
                          <td className="text-xs sm:text-base">{member.memberId}</td>
                          <td>
                            <button
                              className="btn btn-square btn-ghost border border-[#ed003f] hover:bg-[#fff0f4] transition"
                              onClick={() => handleEdit(member._id)}
                              title="Edit"
                              style={{ color: "#ed003f" }}
                            >
                              <PencilIcon className="w-5" style={{ color: "#ed003f" }} />
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-square btn-ghost border border-[#ed003f] hover:bg-[#fff0f4] transition"
                              onClick={() => confirmDeleteMember(member._id, index)}
                              style={{ color: "#ed003f" }}
                            >
                              <TrashIcon className="w-5" style={{ color: "#ed003f" }} />
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-[#ed003f]">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this member?</p>
            <div className="flex justify-end space-x-2">
              <button
                className="btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition"
                onClick={deleteCurrentMember}
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

export default MembersList;