import React, { useEffect, useState } from 'react';
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

// Import and register jsPDF autotable plugin
import autoTable from 'jspdf-autotable';
jsPDF.autoTable = autoTable;

const RevenueReport = () => {
  const [reportData, setReportData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchReportData = async () => {
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
        setReportData(response.data.reportData);
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };

    fetchReportData();
  }, [startDate, endDate]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Centered title: Kababaihan ng Maynila
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#ed003f');
    const titleText = 'Kababaihan ng Maynila';
    const titleWidth = doc.getTextWidth(titleText);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(titleText, titleX, 20);

    // Centered subtitle: Revenue Report
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(15);
    doc.setTextColor('#000000');
    const subText = 'Revenue Report';
    const subWidth = doc.getTextWidth(subText);
    const subX = (pageWidth - subWidth) / 2;
    doc.text(subText, subX, 35);

    // Table data
    const tableColumn = ['Product ID', 'Product Name', 'Quantity', 'Total Amount'];
    const tableRows = reportData.map(item => [
      item.productId,
      item.name,
      item.quantity,
      item.totalAmount.toFixed(2)
    ]);

    jsPDF.autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      styles: {
        textColor: '#000000'
      },
      headStyles: {
        fillColor: [237, 0, 63], // #ed003f
        textColor: 255
      }
    });

    doc.save('Revenue_Report.pdf');
  };

  const chartData = {
    labels: reportData.map(item => item.name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: reportData.map(item => item.quantity),
        borderColor: '#ed003f',
        backgroundColor: 'rgba(237,0,63,0.1)',
        yAxisID: 'y'
      },
      {
        label: 'Total Amount',
        data: reportData.map(item => item.totalAmount),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153,102,255,0.1)',
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#ed003f',
          font: { weight: 'bold' }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#ed003f', font: { weight: 'bold' } },
        grid: { color: 'rgba(237,0,63,0.08)' }
      },
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Quantity Sold',
          color: '#ed003f'
        },
        ticks: { color: '#ed003f' },
        grid: { color: 'rgba(237,0,63,0.08)' }
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Total Amount',
          color: '#ed003f'
        },
        ticks: { color: '#ed003f' },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-2 sm:p-6 bg-base-200">
            <TitleCard
              title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>Revenue Report</span>}
              TopSideButtons={
                <button
                  className="btn"
                  style={{ backgroundColor: '#ed003f', borderColor: '#ed003f', color: '#ffffff' }}
                  onClick={generatePDF}
                >
                  Download PDF
                </button>
              }
            >
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mb-4">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="input input-bordered w-full sm:w-auto"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="input input-bordered w-full sm:w-auto"
                />
              </div>
              <div className="overflow-x-auto">
                <div className="bg-white rounded-lg p-2 sm:p-4 border border-[#ed003f]">
                  <div className="h-64 sm:h-80">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
                <table className="table w-full mt-6 text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Product ID</th>
                      <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Product Name</th>
                      <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Quantity</th>
                      <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map(item => (
                      <tr key={item.productId}>
                        <td>{item.productId}</td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TitleCard>
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