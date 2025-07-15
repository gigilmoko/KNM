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
import { PlusIcon, CheckIcon, XMarkIcon, UserGroupIcon, ClockIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import moment from 'moment';

function MembersList() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
  
  // State for different member types
  const [activeMembers, setActiveMembers] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [referenceMembersList, setReferenceMembersList] = useState([]);
  
  // UI State
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Action states
  const [itemToDelete, setItemToDelete] = useState(null);
  const [memberToEdit, setMemberToEdit] = useState(null);
  
  // Form state for creating/editing reference members
  const [memberForm, setMemberForm] = useState({
    fname: '',
    lname: '',
    memberId: ''
  });
  
  const mainContentRef = useRef(null);

  useEffect(() => {
    mainContentRef.current?.scroll({
      top: 0,
      behavior: "smooth"
    });
    fetchAllData();
  }, []);

  useEffect(() => {
    if (newNotificationMessage !== "") {
      if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
      if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
      dispatch(removeNotificationMessage());
    }
  }, [newNotificationMessage, newNotificationStatus, dispatch]);

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchActiveMembers(),
      fetchPendingApplications(),
      fetchReferenceMembers()
    ]);
    setLoading(false);
  };

  // Fetch users with role 'member'
  const fetchActiveMembers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API}/api/all-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data.users)) {
        const members = response.data.users.filter(user => user.role === 'member');
        setActiveMembers(members);
      }
    } catch (error) {
      console.error('Error fetching active members:', error);
      setActiveMembers([]);
    }
  };

  // Fetch users applying for membership
  const fetchPendingApplications = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API}/api/fetchusermember`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data.data)) {
        setPendingApplications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pending applications:', error);
      setPendingApplications([]);
    }
  };

  // Fetch reference members list
  const fetchReferenceMembers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API}/api/members`);
      if (response.data && Array.isArray(response.data.data)) {
        setReferenceMembersList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reference members:', error);
      setReferenceMembersList([]);
    }
  };

  // Filter data based on search
  const getFilteredData = (data) => {
    if (!searchText) return data;
    
    const lowercasedValue = searchText.toLowerCase();
    return data.filter(item => {
      const firstName = item.fname?.toLowerCase() || '';
      const lastName = item.lname?.toLowerCase() || '';
      const email = item.email?.toLowerCase() || '';
      const memberId = item.memberId?.toLowerCase() || '';
      
      return firstName.includes(lowercasedValue) ||
             lastName.includes(lowercasedValue) ||
             email.includes(lowercasedValue) ||
             memberId.includes(lowercasedValue);
    });
  };

  // Action handlers
  const handleApproveApplication = async (userId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${process.env.REACT_APP_API}/api/users/approve-apply-member/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Member application approved successfully!');
      await fetchAllData();
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error('Failed to approve member application');
    }
  };

  const handleDenyApplication = async (userId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${process.env.REACT_APP_API}/api/users/deny-apply-member/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Member application denied successfully!');
      await fetchPendingApplications();
    } catch (error) {
      console.error('Error denying application:', error);
      toast.error('Failed to deny member application');
    }
  };

  const handleDeleteActiveMember = async (userId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${process.env.REACT_APP_API}/api/users/${userId}`, 
        { role: 'user' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Member role removed successfully!');
      await fetchActiveMembers();
    } catch (error) {
      console.error('Error removing member role:', error);
      toast.error('Failed to remove member role');
    }
  };

  const handleDeleteReferenceMember = async (memberId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API}/api/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Reference member deleted successfully!');
      await fetchReferenceMembers();
    } catch (error) {
      console.error('Error deleting reference member:', error);
      toast.error('Failed to delete reference member');
    }
  };

  const handleCreateReferenceMember = async () => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${process.env.REACT_APP_API}/api/members/new`, memberForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Reference member created successfully!');
      setMemberForm({ fname: '', lname: '', memberId: '' });
      setShowCreateModal(false);
      await fetchReferenceMembers();
    } catch (error) {
      console.error('Error creating reference member:', error);
      toast.error('Failed to create reference member');
    }
  };

  const handleUpdateReferenceMember = async () => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(`${process.env.REACT_APP_API}/api/members/${memberToEdit._id}`, memberForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Reference member updated successfully!');
      setMemberForm({ fname: '', lname: '', memberId: '' });
      setMemberToEdit(null);
      setShowEditModal(false);
      await fetchReferenceMembers();
    } catch (error) {
      console.error('Error updating reference member:', error);
      toast.error('Failed to update reference member');
    }
  };

  // Modal handlers
  const confirmDelete = (item, type) => {
    setItemToDelete({ ...item, type });
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    
    switch (itemToDelete.type) {
      case 'active':
        await handleDeleteActiveMember(itemToDelete._id);
        break;
      case 'reference':
        await handleDeleteReferenceMember(itemToDelete._id);
        break;
      default:
        break;
    }
    
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  const handleEditReferenceMember = (member) => {
    setMemberToEdit(member);
    setMemberForm({
      fname: member.fname,
      lname: member.lname,
      memberId: member.memberId
    });
    setShowEditModal(true);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="drawer lg:drawer-open">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-base-200">
            <div className="flex justify-center items-center h-64">
              <div className="flex items-center gap-3">
                <div className="loading loading-spinner loading-lg text-[#ed003f]"></div>
                <span className="text-lg text-gray-600">Loading member data...</span>
              </div>
            </div>
          </main>
        </div>
        <LeftSidebar />
        <RightSidebar />
        <ModalLayout />
      </div>
    );
  }

  const filteredActiveMembers = getFilteredData(activeMembers);
  const filteredPendingApplications = getFilteredData(pendingApplications);
  const filteredReferenceMembers = getFilteredData(referenceMembersList);

  return (
    <>
      <div className="drawer lg:drawer-open">
        <ToastContainer />
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-gray-50" ref={mainContentRef}>
            
            {/* Header Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-[#ed003f] to-red-600 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <UserGroupIcon className="w-8 h-8" />
                  <h1 className="text-3xl font-bold">Members Management</h1>
                </div>
                <p className="text-red-100 text-lg">
                  Manage active members, pending applications, and reference member list
                </p>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">{activeMembers.length}</div>
                    <div className="text-red-100 text-sm">Active Members</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">{pendingApplications.length}</div>
                    <div className="text-red-100 text-sm">Pending Applications</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="text-2xl font-bold">{referenceMembersList.length}</div>
                    <div className="text-red-100 text-sm">Reference Members</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <SearchBar 
                    searchText={searchText} 
                    setSearchText={setSearchText}
                    styleClass="flex-1 max-w-md"
                    inputProps={{
                      placeholder: "Search by name, email, or member ID...",
                      className: "input input-bordered w-full focus:ring-2 focus:ring-[#ed003f] focus:border-[#ed003f]"
                    }}
                  />
                  <button
                    className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition flex items-center gap-2"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <PlusIcon className="w-4 h-4" />
                    Add Reference Member
                  </button>
                </div>
              </div>
            </div>

            {/* Active Members Section */}
            <div className="mb-8">
              <TitleCard
                title={
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <UserGroupIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#ed003f]">Active Members</h2>
                      <p className="text-sm text-gray-600">Users with member role</p>
                    </div>
                  </div>
                }
                topMargin="mt-2"
              >
                <div className="overflow-x-auto">
                  {filteredActiveMembers.length > 0 ? (
                    <table className="table w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-[#ed003f] font-semibold">Avatar</th>
                          <th className="text-[#ed003f] font-semibold">Name</th>
                          <th className="text-[#ed003f] font-semibold">Member ID</th>
                          <th className="text-[#ed003f] font-semibold">Email</th>
                          <th className="text-[#ed003f] font-semibold">Phone</th>
                          <th className="text-[#ed003f] font-semibold">Date Joined</th>
                          <th className="text-[#ed003f] font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActiveMembers.map((member) => (
                          <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                            <td>
                              <div className="avatar">
                                <div className="mask mask-squircle w-12 h-12">
                                  <img 
                                    src={member.avatar || "/noimage.png"} 
                                    alt="Avatar" 
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="font-semibold">
                              {`${member.fname} ${member.middlei ? `${member.middlei}. ` : ''}${member.lname}`}
                            </td>
                            <td>
                              <span className="badge badge-outline">{member.memberId || 'N/A'}</span>
                            </td>
                            <td>{member.email}</td>
                            <td>{member.phone || 'N/A'}</td>
                            <td>{moment(member.createdAt).format("MMM DD, YYYY")}</td>
                            <td>
                              <button
                                className="btn btn-sm bg-red-500 text-white hover:bg-red-600 border-none"
                                onClick={() => confirmDelete(member, 'active')}
                                title="Remove Member Role"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Members</h3>
                      <p className="text-gray-600">No members found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </TitleCard>
            </div>

            {/* Pending Applications Section */}
            <div className="mb-8">
              <TitleCard
                title={
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <ClockIcon className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#ed003f]">Pending Applications</h2>
                      <p className="text-sm text-gray-600">Users applying for membership</p>
                    </div>
                  </div>
                }
                topMargin="mt-2"
              >
                <div className="overflow-x-auto">
                  {filteredPendingApplications.length > 0 ? (
                    <table className="table w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-[#ed003f] font-semibold">Avatar</th>
                          <th className="text-[#ed003f] font-semibold">Name</th>
                          <th className="text-[#ed003f] font-semibold">Member ID</th>
                          <th className="text-[#ed003f] font-semibold">Email</th>
                          <th className="text-[#ed003f] font-semibold">Applied Date</th>
                          <th className="text-[#ed003f] font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPendingApplications.map((application) => (
                          <tr key={application._id} className="hover:bg-gray-50 transition-colors">
                            <td>
                              <div className="avatar">
                                <div className="mask mask-squircle w-12 h-12">
                                  <img 
                                    src={application.avatar || "/noimage.png"} 
                                    alt="Avatar" 
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="font-semibold">
                              {`${application.fname} ${application.middlei ? `${application.middlei}. ` : ''}${application.lname}`}
                            </td>
                            <td>
                              <span className="badge badge-outline">{application.memberId || 'N/A'}</span>
                            </td>
                            <td>{application.email}</td>
                            <td>{moment(application.createdAt).format("MMM DD, YYYY")}</td>
                            <td>
                              <div className="flex gap-2">
                                <button
                                  className="btn btn-sm bg-green-500 text-white hover:bg-green-600 border-none"
                                  onClick={() => handleApproveApplication(application._id)}
                                  title="Approve Application"
                                >
                                  <CheckIcon className="w-4 h-4" />
                                </button>
                                <button
                                  className="btn btn-sm bg-red-500 text-white hover:bg-red-600 border-none"
                                  onClick={() => handleDenyApplication(application._id)}
                                  title="Deny Application"
                                >
                                  <XMarkIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Applications</h3>
                      <p className="text-gray-600">No pending applications found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </TitleCard>
            </div>

            {/* Reference Members Section */}
            <div className="mb-8">
              <TitleCard
                title={
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <DocumentDuplicateIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#ed003f]">Reference Members List</h2>
                      <p className="text-sm text-gray-600">Master list of member references</p>
                    </div>
                  </div>
                }
                topMargin="mt-2"
              >
                <div className="overflow-x-auto">
                  {filteredReferenceMembers.length > 0 ? (
                    <table className="table w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-[#ed003f] font-semibold">Name</th>
                          <th className="text-[#ed003f] font-semibold">Member ID</th>
                          <th className="text-[#ed003f] font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredReferenceMembers.map((member) => (
                          <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                            <td className="font-semibold">
                              {`${member.fname} ${member.lname}`}
                            </td>
                            <td>
                              <span className="badge badge-outline">{member.memberId}</span>
                            </td>
                            <td>
                              <div className="flex gap-2">
                                <button
                                  className="btn btn-sm btn-ghost border border-[#ed003f] text-[#ed003f] hover:bg-[#ed003f] hover:text-white"
                                  onClick={() => handleEditReferenceMember(member)}
                                  title="Edit"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  className="btn btn-sm btn-ghost border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                  onClick={() => confirmDelete(member, 'reference')}
                                  title="Delete"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12">
                      <DocumentDuplicateIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Reference Members</h3>
                      <p className="text-gray-600">No reference members found matching your search criteria.</p>
                    </div>
                  )}
                </div>
              </TitleCard>
            </div>

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
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XMarkIcon className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-900">Confirm Action</h2>
              <p className="text-gray-600 mb-6">
                {itemToDelete?.type === 'active' 
                  ? 'Are you sure you want to remove member role from this user?' 
                  : 'Are you sure you want to delete this reference member?'
                }
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 border-none"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn bg-red-500 text-white hover:bg-red-600 border-none"
                  onClick={executeDelete}
                >
                  {itemToDelete?.type === 'active' ? 'Remove Role' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Reference Member Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#ed003f] rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Create New Reference Member</h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                className="input input-bordered w-full focus:ring-2 focus:ring-[#ed003f] focus:border-[#ed003f]"
                value={memberForm.fname}
                onChange={(e) => setMemberForm({ ...memberForm, fname: e.target.value })}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="input input-bordered w-full focus:ring-2 focus:ring-[#ed003f] focus:border-[#ed003f]"
                value={memberForm.lname}
                onChange={(e) => setMemberForm({ ...memberForm, lname: e.target.value })}
              />
              <input
                type="text"
                placeholder="Member ID"
                className="input input-bordered w-full focus:ring-2 focus:ring-[#ed003f] focus:border-[#ed003f]"
                value={memberForm.memberId}
                onChange={(e) => setMemberForm({ ...memberForm, memberId: e.target.value })}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                className="btn flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border-none"
                onClick={() => {
                  setShowCreateModal(false);
                  setMemberForm({ fname: '', lname: '', memberId: '' });
                }}
              >
                Cancel
              </button>
              <button
                className="btn flex-1 bg-[#ed003f] text-white hover:bg-red-700 border-none"
                onClick={handleCreateReferenceMember}
                disabled={!memberForm.fname || !memberForm.lname || !memberForm.memberId}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reference Member Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <PencilIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Edit Reference Member</h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                className="input input-bordered w-full focus:ring-2 focus:ring-[#ed003f] focus:border-[#ed003f]"
                value={memberForm.fname}
                onChange={(e) => setMemberForm({ ...memberForm, fname: e.target.value })}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="input input-bordered w-full focus:ring-2 focus:ring-[#ed003f] focus:border-[#ed003f]"
                value={memberForm.lname}
                onChange={(e) => setMemberForm({ ...memberForm, lname: e.target.value })}
              />
              <input
                type="text"
                placeholder="Member ID"
                className="input input-bordered w-full focus:ring-2 focus:ring-[#ed003f] focus:border-[#ed003f]"
                value={memberForm.memberId}
                onChange={(e) => setMemberForm({ ...memberForm, memberId: e.target.value })}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                className="btn flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border-none"
                onClick={() => {
                  setShowEditModal(false);
                  setMemberToEdit(null);
                  setMemberForm({ fname: '', lname: '', memberId: '' });
                }}
              >
                Cancel
              </button>
              <button
                className="btn flex-1 bg-[#ed003f] text-white hover:bg-red-700 border-none"
                onClick={handleUpdateReferenceMember}
                disabled={!memberForm.fname || !memberForm.lname || !memberForm.memberId}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MembersList;