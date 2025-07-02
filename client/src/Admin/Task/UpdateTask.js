import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import { toast, ToastContainer } from 'react-toastify';
import { ArrowLeftIcon, UserPlusIcon, XMarkIcon, CalendarIcon, DocumentTextIcon, UserIcon } from '@heroicons/react/24/outline';

function UpdateTask() {
    const navigate = useNavigate();
    const { id } = useParams();
    const mainContentRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [taskData, setTaskData] = useState({
        name: "",
        description: "",
        members: [],
        deadline: "",
    });
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState("");
    const [memberError, setMemberError] = useState("");

    useEffect(() => {
        fetchMembers();
        fetchTaskDetails();
        // eslint-disable-next-line
    }, []);

    const fetchMembers = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API}/api/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Members response:', response.data);
            setMembers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching members:', error);
            toast.error('Failed to load members');
            setMembers([]);
        }
    };

    const fetchTaskDetails = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API}/api/tasks/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data && response.data.task) {
                setTaskData({
                    name: response.data.task.name || "",
                    description: response.data.task.description || "",
                    members: response.data.task.members ? response.data.task.members.map(m => m._id) : [],
                    deadline: response.data.task.deadline ? response.data.task.deadline.split('T')[0] : "",
                });
            }
        } catch (error) {
            toast.error('Failed to load task details.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTaskData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddMember = () => {
        if (!selectedMember) {
            setMemberError("Please select a member");
            return;
        }
        if (taskData.members.includes(selectedMember)) {
            setMemberError("Member already added");
            return;
        }
        setTaskData(prev => ({
            ...prev,
            members: [...prev.members, selectedMember],
        }));
        setSelectedMember("");
        setMemberError("");
    };

    const handleRemoveMember = (id) => {
        setTaskData(prev => ({
            ...prev,
            members: prev.members.filter(memberId => memberId !== id),
        }));
        setMemberError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!taskData.name.trim()) {
            toast.error('Task name is required!');
            return;
        }
        if (!taskData.description.trim()) {
            toast.error('Task description is required!');
            return;
        }
        if (!taskData.members.length) {
            toast.error('At least one member must be assigned!');
            return;
        }
        if (!taskData.deadline) {
            toast.error('Deadline is required!');
            return;
        }

        // Check if deadline is not in the past
        const selectedDate = new Date(taskData.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            toast.error('Deadline cannot be in the past!');
            return;
        }

        setLoading(true);
        
        try {
            const token = sessionStorage.getItem("token");
            console.log('Updating task data:', taskData);
            
            const response = await axios.put(`${process.env.REACT_APP_API}/api/tasks/${id}`, taskData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });
            
            console.log('Task update response:', response.data);
            toast.success('Task updated successfully!');
            setTimeout(() => navigate('/admin/tasks'), 1500);
        } catch (error) {
            console.error('Task update error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update task. Please try again.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate('/admin/tasks');
    };

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto pt-4 px-4 sm:px-6 bg-base-200" ref={mainContentRef}>
                        <div className="max-w-7xl mx-auto">
                            {/* Header with Back Button */}
                            <div className="mb-6">
                                <button
                                    onClick={handleGoBack}
                                    className="btn btn-ghost mb-4 text-[#ed003f] hover:bg-red-50 flex items-center gap-2"
                                >
                                    <ArrowLeftIcon className="w-5 h-5" />
                                    Back to Tasks
                                </button>
                                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#ed003f]">
                                    <h1 className="text-3xl font-bold text-[#ed003f] mb-2">Update Task</h1>
                                    <p className="text-gray-600">Modify the task details and update team member assignments.</p>
                                </div>
                            </div>

                            {/* Main Content - Landscape Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Panel - Task Details */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                        <div className="bg-gradient-to-r from-[#ed003f] to-red-600 px-6 py-4">
                                            <h2 className="text-xl font-semibold text-white flex items-center">
                                                <DocumentTextIcon className="w-6 h-6 mr-2" />
                                                Task Details
                                            </h2>
                                        </div>
                                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Task Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={taskData.name}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed003f] focus:border-[#ed003f] transition-colors"
                                                    placeholder="Enter a descriptive task name"
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description *
                                                </label>
                                                <textarea
                                                    id="description"
                                                    name="description"
                                                    value={taskData.description}
                                                    onChange={handleChange}
                                                    rows={6}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed003f] focus:border-[#ed003f] transition-colors resize-none"
                                                    placeholder="Provide detailed information about the task, including objectives and requirements"
                                                    required
                                                />
                                            </div>
                                            
                                            <div>
                                                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                                                    <CalendarIcon className="w-4 h-4 inline mr-1" />
                                                    Deadline *
                                                </label>
                                                <input
                                                    type="date"
                                                    id="deadline"
                                                    name="deadline"
                                                    value={taskData.deadline}
                                                    onChange={handleChange}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed003f] focus:border-[#ed003f] transition-colors"
                                                    required
                                                />
                                            </div>

                                            {/* Form Actions */}
                                            <div className="border-t border-gray-200 pt-6">
                                                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={handleGoBack}
                                                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={loading || taskData.members.length === 0}
                                                        className="px-8 py-3 bg-[#ed003f] text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        {loading ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                Updating Task...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <DocumentTextIcon className="w-4 h-4" />
                                                                Update Task
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Right Panel - Team Assignment */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-4">
                                        <div className="bg-gradient-to-r from-[#ed003f] to-red-600 px-6 py-4">
                                            <h2 className="text-xl font-semibold text-white flex items-center">
                                                <UserIcon className="w-6 h-6 mr-2" />
                                                Team Assignment
                                            </h2>
                                        </div>
                                        <div className="p-6 space-y-6">
                                            {/* Add Member Section */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                                    Add Team Member *
                                                </label>
                                                <div className="space-y-3">
                                                    <select
                                                        value={selectedMember}
                                                        onChange={e => {
                                                            setSelectedMember(e.target.value);
                                                            setMemberError("");
                                                        }}
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed003f] focus:border-[#ed003f] transition-colors"
                                                    >
                                                        <option value="">Select a team member</option>
                                                        {members
                                                            .filter(m => !taskData.members.includes(m._id))
                                                            .map(member => (
                                                                <option key={member._id} value={member._id}>
                                                                    {member.fname} {member.lname}
                                                                </option>
                                                            ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={handleAddMember}
                                                        disabled={!selectedMember}
                                                        className="w-full px-4 py-3 bg-[#ed003f] text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        <UserPlusIcon className="w-4 h-4" />
                                                        Add Member
                                                    </button>
                                                </div>
                                                {memberError && (
                                                    <p className="text-red-500 text-sm mt-2">{memberError}</p>
                                                )}
                                            </div>

                                            {/* Selected Members */}
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center justify-between">
                                                    <span>Assigned Members</span>
                                                    {taskData.members.length > 0 && (
                                                        <span className="bg-[#ed003f] text-white text-xs px-2 py-1 rounded-full">
                                                            {taskData.members.length}
                                                        </span>
                                                    )}
                                                </h3>
                                                
                                                {taskData.members.length > 0 ? (
                                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                                        {taskData.members.map(id => {
                                                            const member = members.find(m => m._id === id);
                                                            return member ? (
                                                                <div
                                                                    key={id}
                                                                    className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 bg-[#ed003f] text-white rounded-full flex items-center justify-center text-sm font-medium">
                                                                            {member.fname[0]}{member.lname[0]}
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-gray-900">
                                                                                {member.fname} {member.lname}
                                                                            </p>
                                                                            <p className="text-xs text-gray-500">{member.email}</p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleRemoveMember(id)}
                                                                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                                        title={`Remove ${member.fname} ${member.lname}`}
                                                                    >
                                                                        <XMarkIcon className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            ) : null;
                                                        })}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <UserIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                                        <p className="text-sm">No team members assigned yet</p>
                                                        <p className="text-xs">Add at least one member to continue</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Task Summary */}
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <h3 className="text-sm font-medium text-gray-700 mb-2">Task Summary</h3>
                                                <div className="space-y-2 text-sm text-gray-600">
                                                    <div className="flex justify-between">
                                                        <span>Name:</span>
                                                        <span className="text-right">{taskData.name || 'Not set'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Deadline:</span>
                                                        <span className="text-right">{taskData.deadline || 'Not set'}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Members:</span>
                                                        <span className="text-right">{taskData.members.length} assigned</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="h-16"></div>
                    </main>
                </div>
                <LeftSidebar />
                <RightSidebar />
                <ModalLayout />
            </div>
        </>
    );
}

export default UpdateTask;