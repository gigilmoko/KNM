import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  Download, 
  Users, 
  Mail, 
  Phone,
  Calendar,
  UserCheck,
  Search,
  Filter
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const UserReports = () => {
  const mainContentRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    mainContentRef.current?.scroll({
      top: 0,
      behavior: "smooth"
    });
  }, []);

  useEffect(() => {
    fetchUserReports();
  }, []);

  const fetchUserReports = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      
      // Try the reports endpoint first, if it fails, fallback to users endpoint
      let response;
      try {
        response = await axios.get(`${process.env.REACT_APP_API}/api/reports/user-reports`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data.users || []);
      } catch (reportError) {
        console.log('Reports endpoint not available, trying users endpoint...');
        
        // Fallback to regular users endpoint
        response = await axios.get(`${process.env.REACT_APP_API}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Handle different possible response structures
        const userData = response.data.users || response.data.data || response.data || [];
        setUsers(Array.isArray(userData) ? userData : []);
      }
      
      console.log('Fetched users:', response.data); // Debug log
      
    } catch (error) {
      console.error('Error fetching user reports:', error);
      toast.error('Failed to load user reports');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const setQuickDateRange = (days) => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);
    
    setStartDate(pastDate);
    setEndDate(today);
  };

  // Filter users by date range and search term
// Filter users by date range and search term
const getFilteredUsers = () => {
  return users.filter(user => {
    // Date filter - handle different date field names with better validation
    let userDate;
    if (user.createdAt) {
      userDate = new Date(user.createdAt);
    } else if (user.dateJoined) {
      userDate = new Date(user.dateJoined);
    } else if (user.registeredAt) {
      userDate = new Date(user.registeredAt);
    } else {
      // If no date field exists, include the user (don't filter out)
      userDate = new Date();
    }
    
    // Ensure valid date
    if (isNaN(userDate.getTime())) {
      userDate = new Date(); // Default to current date if invalid
    }
    
    // Set time to start/end of day for proper comparison
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const matchesDate = userDate >= startOfDay && userDate <= endOfDay;
    
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      (user.fname && user.fname.toLowerCase().includes(searchLower)) ||
      (user.lname && user.lname.toLowerCase().includes(searchLower)) ||
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.phone && user.phone.includes(searchTerm));
    
    return matchesDate && matchesSearch;
  });
};
  // Generate KNMUSER pattern
  const generateKNMUserID = (userId) => {
    if (!userId) return 'KNMUSER000000';
    return `KNMUSER${userId.slice(-6).toUpperCase()}`;
  };

  // Calculate statistics
  const getTotalUsers = () => {
    return users.length;
  };

  const getActiveUsers = () => {
    return users.filter(user => user.isActive !== false && user.status !== 'inactive').length;
  };

  const getNewUsersThisMonth = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return users.filter(user => {
      const userDate = new Date(user.createdAt || user.dateJoined || user.registeredAt);
      return userDate >= thirtyDaysAgo;
    }).length;
  };

const generatePDF = () => {
  const filteredUsers = getFilteredUsers();
  
  console.log('Generating PDF with users:', filteredUsers); // Debug log
  
  // Check if there are users to export
  if (filteredUsers.length === 0) {
    toast.error('No users found for the selected criteria. Please adjust your filters.');
    return;
  }

  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    const now = new Date();
    const formattedNow = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Centered title: Kababaihan ng Maynila
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(237, 0, 63); // Use RGB values instead of hex
    const titleText = 'Kababaihan ng Maynila';
    const titleWidth = doc.getTextWidth(titleText);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(titleText, titleX, 20);

    // Centered subtitle: User Report
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Black color
    const subText = 'User Report';
    const subWidth = doc.getTextWidth(subText);
    const subX = (pageWidth - subWidth) / 2;
    doc.text(subText, subX, 30);

    // Date range and statistics
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100); // Gray color
    doc.text(`Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 14, 40);
    doc.text(`Total Users: ${filteredUsers.length}`, 14, 46);

    // Prepare table data with validation
    const tableColumn = ['User ID', 'Name', 'Email', 'Phone', 'Join Date'];
    const tableRows = filteredUsers.map(user => {
      // Ensure all data is properly formatted
      const userId = generateKNMUserID(user._id);
      const userName = `${user.fname || ''} ${user.lname || ''}`.trim() || user.name || 'Unknown';
      const userEmail = user.email || 'N/A';
      const userPhone = user.phone || 'N/A';
      const joinDate = user?.createdAt
        ? new Date(user?.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        : 'N/A';

      return [userId, userName, userEmail, userPhone, joinDate];
    });

    // Generate the table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 52,
      headStyles: {
        fillColor: [237, 0, 63], // RGB format
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        halign: 'center',
        valign: 'middle',
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [249, 249, 249]
      },
      columnStyles: {
        0: { cellWidth: 30 }, // User ID column
        1: { cellWidth: 40 }, // Name column
        2: { cellWidth: 50 }, // Email column
        3: { cellWidth: 30 }, // Phone column
        4: { cellWidth: 30 }  // Join Date column
      },
      didDrawPage: function (data) {
        // Footer with generation timestamp
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Generated on: ${formattedNow}`, 
          data.settings.margin.left, 
          doc.internal.pageSize.height - 10
        );
        
        // Page number
        const pageCount = doc.internal.getNumberOfPages();
        const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
        doc.text(
          `Page ${currentPage} of ${pageCount}`,
          pageWidth - 30,
          doc.internal.pageSize.height - 10
        );
      }
    });

    // Save the PDF with a descriptive filename
    const filename = `user-report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    toast.success(`PDF report generated successfully! (${filteredUsers.length} users exported)`);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Failed to generate PDF report. Please try again.');
  }
};
  const filteredUsers = getFilteredUsers();

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="drawer lg:drawer-open">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto pt-4 px-4 sm:px-6 bg-base-200" ref={mainContentRef}>
            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#ed003f]">
                  <h1 className="text-3xl font-bold text-[#ed003f] mb-2 flex items-center">
                    <Users className="w-8 h-8 mr-3" />
                    User Analytics
                  </h1>
                  <p className="text-gray-600">Monitor user registration and activity patterns across your platform.</p>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{getTotalUsers()}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900">{getActiveUsers()}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#ed003f]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">New This Month</p>
                      <p className="text-2xl font-bold text-gray-900">{getNewUsersThisMonth()}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-[#ed003f]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Debug Info (remove in production) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Debug: Found {users.length} users total, {filteredUsers.length} after filtering
                  </p>
                </div>
              )}

              {/* Main Content */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Header Controls */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {startDate && endDate ? (
                          `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                        ) : (
                          'Select date range to view data'
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                      {/* Search Input */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ed003f] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Quick Date Filters */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setQuickDateRange(7)}
                          className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          7 Days
                        </button>
                        <button
                          onClick={() => setQuickDateRange(30)}
                          className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          30 Days
                        </button>
                        <button
                          onClick={() => setQuickDateRange(365)}
                          className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          All Time
                        </button>
                      </div>
                      
                      {/* Date Range Inputs */}
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          selectsStart
                          startDate={startDate}
                          endDate={endDate}
                          className="border-none bg-transparent text-sm focus:outline-none w-20"
                          dateFormat="MM/dd/yyyy"
                        />
                        <span className="text-gray-400 text-sm">to</span>
                        <DatePicker
                          selected={endDate}
                          onChange={(date) => setEndDate(date)}
                          selectsEnd
                          startDate={startDate}
                          endDate={endDate}
                          minDate={startDate}
                          className="border-none bg-transparent text-sm focus:outline-none w-20"
                          dateFormat="MM/dd/yyyy"
                        />
                      </div>

                      {/* Download Button */}
                      {filteredUsers.length > 0 && (
                        <button
                          className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition-colors flex items-center gap-2"
                          onClick={generatePDF}
                        >
                          <Download className="w-4 h-4" />
                          Export PDF
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="flex items-center gap-3">
                        <div className="loading loading-spinner loading-md text-[#ed003f]"></div>
                        <span className="text-gray-600">Loading users...</span>
                      </div>
                    </div>
                  ) : filteredUsers.length > 0 ? (
                    <table className="table w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-[#ed003f] font-semibold text-sm text-center">User ID</th>
                          <th className="text-[#ed003f] font-semibold text-sm text-center">Name</th>
                          <th className="text-[#ed003f] font-semibold text-sm text-center">Email</th>
                          <th className="text-[#ed003f] font-semibold text-sm text-center">Phone</th>
                          <th className="text-[#ed003f] font-semibold text-sm text-center">Join Date</th>
                          <th className="text-[#ed003f] font-semibold text-sm text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map(user => (
                          <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                            <td className="text-center">
                              <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                {generateKNMUserID(user._id)}
                              </span>
                            </td>
                            <td className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-8 h-8 bg-[#ed003f] text-white rounded-full flex items-center justify-center">
                                  <Users className="w-4 h-4" />
                                </div>
                                <span className="font-semibold">
                                  {`${user.fname || ''} ${user.lname || ''}`.trim() || user.name || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{user.email || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">{user.phone || 'N/A'}</span>
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-sm">
                                  {user.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })
                                    : 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.isActive !== false && user.status !== 'inactive'
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {user.isActive !== false && user.status !== 'inactive' ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-16">
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No users found
                        </h3>
                        <p className="text-gray-600 mb-6">
                          No users found for the selected criteria. Try adjusting your filters or check if users exist in the system.
                        </p>
                        <div className="flex gap-2 justify-center">
                          <button
                            className="btn bg-[#ed003f] text-white border-none hover:bg-red-700"
                            onClick={() => {
                              setSearchTerm('');
                              setQuickDateRange(365); // All time
                            }}
                          >
                            <Filter className="w-4 h-4 mr-2" />
                            Clear Filters
                          </button>
                          <button
                            className="btn btn-outline"
                            onClick={fetchUserReports}
                          >
                            Refresh Data
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="h-16"></div>
          </main>
        </div>
        <LeftSidebar />
      </div>
      <RightSidebar />
      <ModalLayout />
    </>
  );
};

export default UserReports;