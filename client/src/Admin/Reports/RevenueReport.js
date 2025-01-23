import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import TitleCard from '../../Layout/components/Cards/TitleCard';

const RevenueReport = () => {
  const [reportData, setReportData] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const chartRef = useRef();

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

  const generatePDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Kababaihan ng Maynila', 14, 20);
    doc.text('Revenue Report', 14, 30);

    const tableColumn = ['Product ID', 'Product Name', 'Quantity', 'Total Amount'];
    const tableRows = reportData.map(item => [
      item.productId,
      item.name,
      item.quantity,
      item.totalAmount.toFixed(2)
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40
    });

    if (chartRef.current) {
      try {
        // Ensure charts are fully rendered before capturing
        await new Promise((resolve) => setTimeout(resolve, 500)); 

        const chartCanvas = await html2canvas(chartRef.current, { scale: 2 });
        const imgWidth = 190;
        const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;

        doc.addPage();
        doc.text('Charts', 14, 20);
        doc.addImage(chartCanvas.toDataURL('image/png'), 'PNG', 10, 30, imgWidth, imgHeight);
      } catch (error) {
        console.error('Error capturing charts:', error);
      }
    }

    doc.save('Revenue_Report.pdf');
  };

  const chartData = {
    labels: reportData.map(item => item.name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: reportData.map(item => item.quantity),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y'
      },
      {
        label: 'Total Amount',
        data: reportData.map(item => item.totalAmount),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Quantity Sold'
        }
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Total Amount'
        },
        grid: {
          drawOnChartArea: false // only want the grid lines for one axis to show up
        }
      }
    }
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <main className="flex-1 p-6 bg-base-200">
            <TitleCard title="Revenue Report" TopSideButtons={
              <button className="btn btn-primary" onClick={generatePDF}>
                Download PDF
              </button>
            }>
              <div className="flex justify-end space-x-4 mb-4">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="input input-bordered"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="input input-bordered"
                />
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <div ref={chartRef}>
                  <Line data={chartData} options={chartOptions} />
                </div>
                <table className="table w-full mt-6">
                  <thead>
                    <tr>
                      <th>Product ID</th>
                      <th>Product Name</th>
                      <th>Quantity</th>
                      <th>Total Amount</th>
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