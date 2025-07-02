import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import { CalendarIcon, DocumentArrowDownIcon, ChartBarIcon, CurrencyDollarIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';

// Import and register jsPDF autotable plugin
import autoTable from 'jspdf-autotable';
jsPDF.autoTable = autoTable;

const RevenueReport = () => {
  const mainContentRef = useRef(null);
  const [reportData, setReportData] = useState([]);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    mainContentRef.current?.scroll({
      top: 0,
      behavior: "smooth"
    });
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API}/api/reports/revenue-report`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      setReportData(response.data.reportData || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load revenue report');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
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
    doc.setTextColor('#ed003f');
    const titleText = 'Kababaihan ng Maynila';
    const titleWidth = doc.getTextWidth(titleText);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(titleText, titleX, 20);

    // Centered subtitle: Revenue Report
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor('#000000');
    const subText = 'Revenue Report';
    const subWidth = doc.getTextWidth(subText);
    const subX = (pageWidth - subWidth) / 2;
    doc.text(subText, subX, 30);

    // Date range
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 14, 40);

    // Table data
    const tableColumn = ['Product ID', 'Product Name', 'Quantity Sold', 'Revenue (₱)'];
    const tableRows = reportData.map(item => [
      item.productId?.slice(-6).toUpperCase() || 'N/A',
      item.name,
      item.quantity,
      `₱${item.totalAmount.toFixed(2)}`
    ]);

    jsPDF.autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      headStyles: {
        fillColor: [237, 0, 63],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 249, 249]
      },
      didDrawPage: function (data) {
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Generated on: ${formattedNow}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save(`revenue-report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`);
  };

  const setQuickDateRange = (days) => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);
    
    setStartDate(pastDate);
    setEndDate(today);
  };

  // Calculate statistics
  const getTotalRevenue = () => {
    return reportData.reduce((total, item) => total + item.totalAmount, 0);
  };

  const getTotalQuantity = () => {
    return reportData.reduce((total, item) => total + item.quantity, 0);
  };

  const getAverageRevenue = () => {
    return reportData.length > 0 ? getTotalRevenue() / reportData.length : 0;
  };

  const chartData = {
    labels: reportData.map(item => item.name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: reportData.map(item => item.quantity),
        borderColor: '#ed003f',
        backgroundColor: 'rgba(237,0,63,0.1)',
        yAxisID: 'y',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Revenue (₱)',
        data: reportData.map(item => item.totalAmount),
        borderColor: '#059669',
        backgroundColor: 'rgba(5,150,105,0.1)',
        yAxisID: 'y1',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#ed003f',
          font: { weight: 'bold', size: 12 },
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#ed003f',
        bodyColor: '#374151',
        borderColor: '#ed003f',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        ticks: { 
          color: '#ed003f', 
          font: { weight: 'bold' },
          maxRotation: 45
        },
        grid: { color: 'rgba(237,0,63,0.08)' }
      },
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Quantity Sold',
          color: '#ed003f',
          font: { weight: 'bold' }
        },
        ticks: { color: '#ed003f', font: { weight: 'bold' } },
        grid: { color: 'rgba(237,0,63,0.08)' }
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Revenue (₱)',
          color: '#059669',
          font: { weight: 'bold' }
        },
        ticks: { 
          color: '#059669',
          font: { weight: 'bold' },
          callback: function(value) {
            return '₱' + value.toLocaleString();
          }
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
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
              {/* Header Section */}
              <div className="mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#ed003f]">
                  <h1 className="text-3xl font-bold text-[#ed003f] mb-2 flex items-center">
                    <CurrencyDollarIcon className="w-8 h-8 mr-3" />
                    Revenue Analytics
                  </h1>
                  <p className="text-gray-600">Track revenue performance and sales metrics across your product line.</p>
                </div>
              </div>

              {/* Statistics Cards */}
              {reportData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">₱{getTotalRevenue().toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Items Sold</p>
                        <p className="text-2xl font-bold text-gray-900">{getTotalQuantity().toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <ShoppingCartIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#ed003f]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Average Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">₱{getAverageRevenue().toLocaleString()}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <ChartBarIcon className="w-6 h-6 text-[#ed003f]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Header Controls */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Revenue Performance</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {startDate && endDate ? (
                          `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                        ) : (
                          'Select date range to view data'
                        )}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
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
                          onClick={() => setQuickDateRange(90)}
                          className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          90 Days
                        </button>
                      </div>
                      
                      {/* Date Range Inputs */}
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
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
                      {reportData.length > 0 && (
                        <button
                          className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition-colors flex items-center gap-2"
                          onClick={generatePDF}
                        >
                          <DocumentArrowDownIcon className="w-4 h-4" />
                          Export PDF
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chart Section */}
                {reportData.length > 0 && (
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
                    <div className="relative w-full" style={{ minHeight: 400, height: '50vh', maxHeight: 600 }}>
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  </div>
                )}

                {/* Table Content */}
                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="flex items-center gap-3">
                        <div className="loading loading-spinner loading-md text-[#ed003f]"></div>
                        <span className="text-gray-600">Loading revenue data...</span>
                      </div>
                    </div>
                  ) : reportData.length > 0 ? (
                    <table className="table w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-[#ed003f] font-semibold text-sm">Product ID</th>
                          <th className="text-[#ed003f] font-semibold text-sm">Product Name</th>
                          <th className="text-[#ed003f] font-semibold text-sm">Quantity Sold</th>
                          <th className="text-[#ed003f] font-semibold text-sm">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.map((item, index) => (
                          <tr key={item.productId || index} className="hover:bg-gray-50 transition-colors">
                            <td>
                              <span className="text-sm text-gray-600 font-mono">
                                {item.productId?.slice(-6).toUpperCase() || 'N/A'}
                              </span>
                            </td>
                            <td>
                              <span className="font-semibold text-gray-900">{item.name}</span>
                            </td>
                            <td>
                              <span className="font-bold text-[#ed003f] text-lg">
                                {item.quantity}
                              </span>
                            </td>
                            <td>
                              <span className="font-bold text-green-600">
                                ₱{item.totalAmount.toLocaleString()}
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
                          <CurrencyDollarIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No revenue data found
                        </h3>
                        <p className="text-gray-600 mb-6">
                          No revenue data available for the selected date range. Try adjusting your date filters.
                        </p>
                        <button
                          className="btn bg-[#ed003f] text-white border-none hover:bg-red-700"
                          onClick={() => setQuickDateRange(30)}
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Load Last 30 Days
                        </button>
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

export default RevenueReport;