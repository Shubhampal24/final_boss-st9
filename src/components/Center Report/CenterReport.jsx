import axios from "axios";
import React, { useEffect, useState } from 'react';
import { Toaster } from "react-hot-toast";
import { TbReport } from "react-icons/tb";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import NavbarRouting from '../dashboard/NavbarRouting';
import DataTable from '../DataTable';
import Loader from '../Loader';
import NavbarMain from '../NavbarMain';
import ReportPopup from './ReportPopup';

// Define the custom sorting order for regions
const regionSortOrder = [
    "Navi Mumbai",
    "Mumbai",
    "Thane",
    "Kalyan Dombivali",
    "Vasai Virar",
    "Pune",
    "Pimpri Chinchwad",
    "Rest of Maharashtra",
    "Goa",
    "Bengaluru",
    "Karnataka",
    "Delhi",
    "Gujarat",
    "Rajasthan",
    "Uttarpradesh",
    "Uttrakhand",
    "Kerela",
    "Hydrabad"
];

const CenterReport = () => {
    // Format today's date as YYYY-MM-DD for the date input
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];

    const [selectedSection, setSelectedSection] = useState("dashboard");
    const [selectedReport, setSelectedReport] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(formattedToday); // Set today's date as default
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Set the minimum date for the date picker (May 14, 2025)
    const minDate = "2025-05-14";

    useEffect(() => {
        // Add window resize listener
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
            // Adjust items per page based on screen size
            if (window.innerWidth < 640) {
                setItemsPerPage(5);
            } else {
                setItemsPerPage(10);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Authentication token is missing.");
            setLoading(false);
            return;
        }

        const fetchSalesReport = async () => {
            setLoading(true);

            try {
                const url = selectedDate
                    ? `${BASE_URL}/api/customer/centre-sales-report-daily`
                    : `${BASE_URL}/api/customer/centre-sales-report`;

                const response = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: selectedDate ? { selectedDate } : {},
                });
                // console.log("API Response:", response.data);
                if (response.status === 200 && response.data) {
                    const apiData = response.data.data || [];

                    // Create a Map for quick lookup of region sort order
                    const regionOrderMap = new Map(regionSortOrder.map((region, index) => [region, index]));

                    // Sort the data based on the custom region order
                    const sortedData = apiData.sort((a, b) => {
                        // Get the index for region a, defaulting to a high number if not found
                        const indexA = regionOrderMap.has(a.regionName) ? regionOrderMap.get(a.regionName) : Infinity;

                        // Get the index for region b, defaulting to a high number if not found
                        const indexB = regionOrderMap.has(b.regionName) ? regionOrderMap.get(b.regionName) : Infinity;

                        return indexA - indexB;
                    });

                    setData(sortedData);
                    setCurrentPage(1); // Reset to first page when data changes
                } else {
                    throw new Error("Unexpected API response format.");
                }
                console.log("Fetched sales report data:", response.data);
            } catch (error) {
                console.error("Error fetching sales report:", error);
                setError(error.response?.data?.message || "Failed to fetch sales report.");
            } finally {
                setLoading(false);
            }
        };

        fetchSalesReport();
    }, [selectedDate]);

    // Handle date change with validation
    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
    };

    const columns = [
        { label: "Sr no.", key: "srNo" },
        { label: "Centre Code", key: "centreCode" },
        { label: "Center Name", key: "centreName" },
        { label: "Area Name", key: "branchName", hideOnMobile: true },
        { label: "Region Name", key: "regionName", hideOnMobile: true },
        { label: "Customers", key: "totalCustomers" },
        { label: "Total Sales", key: "totalSales" },
        { label: "Cash Collection", key: "totalCash", hideOnMobile: true },
        { label: "Online / Card", key: "totalOnline", hideOnMobile: true },
        { label: "Commissions", key: "totalCommission", hideOnMobile: true },
        { label: "Current Balance", key: "currentbalance" },
        { label: "Report", key: "report" }
    ];

    // Filter visible columns based on screen size
    const visibleColumns = windowWidth < 768
        ? columns.filter(col => !col.hideOnMobile)
        : columns;

    const handleReportClick = async (report) => {
        if (!report?.centreId) {
            setError("Invalid center ID.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Authentication token is missing.");
            return;
        }

        try {
            const response = await axios.get(`${BASE_URL}/api/centres/report/${report.centreId}`, {
                headers: { Authorization: `Bearer ${token}` },
                params: selectedDate ? { selectedDate } : {},
            });

            setSelectedReport({
                report: response.data.data,
                customers: response.data.data.customers || [],
                expenses: response.data.data.expenses || [],
            });
            console.log("Report data:", response.data.data);
        } catch (error) {
            console.error("Error fetching report details:", error);
            setError("Failed to fetch report details.");
        }
    };


    const closeModal = () => {
        setSelectedReport(null);
    };

    // Filter data based on search query
    const filteredData = data.filter((item) => {
        const searchValue = searchQuery.toLowerCase();
        return (
            item.centreCode?.toLowerCase().includes(searchValue) ||
            item.centreName?.toLowerCase().includes(searchValue) ||
            item.branchName?.toLowerCase().includes(searchValue)
        );
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    if (loading) return <Loader />;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="w-full py-5 min-h-screen h-auto bg-[#0D0D11] px-4 md:px-8 lg:px-13">
            <Toaster position="top-center" reverseOrder={false} />
            <NavbarMain />
            <NavbarRouting setSelectedSection={setSelectedSection} />

            <div className="flex flex-wrap gap-4 mt-5 mb-5">

                <div className="relative">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        min={minDate}
                        onKeyDown={(e) => e.preventDefault()} // Disables manual typing
                        className="border bg-zinc-800 border-gray-500 p-2 text-white rounded-lg"
                    />
                    {/* <div className="text-xs text-gray-400 mt-1">
                        Select date (May 14, 2025 or later)
                    </div> */}
                </div>
                <input
                    type="text"
                    placeholder="Search center..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border bg-zinc-800 border-gray-500 p-2 text-white rounded-lg w-full sm:w-1/2 md:w-1/3"
                />
            </div>

            <div className="overflow-x-auto text-white">
                <DataTable
                    columns={visibleColumns}
                    data={currentItems.map((item, index) => ({
                        srNo: indexOfFirstItem + index + 1,
                        centreCode: item.centreCode ? item.centreCode.slice(0, 3) : 'N/A',
                        centreName: item.centreName,
                        branchName: item.branchName,
                        regionName: item.regionName || 'N/A',
                        totalCustomers: item.salesReport?.[0]?.totalCustomers || item.totalCustomers || 0,
                        totalSales: item.totalSales || 0,
                        totalCash: item.totalCash || 0,
                        totalOnline: item.totalOnline || 0,
                        totalCommission: item.salesReport?.[0]?.totalCommission || 0,
                        currentbalance: (item.balance || 0) - (item.totalExpenses || 0) + (item.previousBalance || 0),
                        report: (
                            <TbReport
                                className="text-xl cursor-pointer w-full text-[#6F5FE7] flex justify-center items-center"
                                onClick={() => handleReportClick(item)}
                            />
                        )
                    }))}
                />
            </div>

            {filteredData.length > 0 && (
                <div className="flex flex-wrap items-center justify-between mt-6 mb-4 text-white">
                    <div className="mb-2 sm:mb-0">
                        <p>
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`flex items-center p-2 rounded-md ${currentPage === 1 ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#6F5FE7] hover:bg-[#5A4DD3]'}`}
                        >
                            <FiChevronLeft />
                        </button>
                        <div className="hidden sm:flex space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    // Show immediate pages, first, last and pages around current
                                    if (page === 1 || page === totalPages) return true;
                                    if (Math.abs(page - currentPage) <= 1) return true;
                                    return false;
                                })
                                .map((page, index, array) => {
                                    // Add ellipsis if there are gaps
                                    if (index > 0 && array[index - 1] !== page - 1) {
                                        return (
                                            <React.Fragment key={`ellipsis-${page}`}>
                                                <span className="px-2">...</span>
                                                <button
                                                    onClick={() => handlePageChange(page)}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === page ? 'bg-[#6F5FE7]' : 'bg-gray-700 hover:bg-gray-600'}`}
                                                >
                                                    {page}
                                                </button>
                                            </React.Fragment>
                                        );
                                    }
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-md ${currentPage === page ? 'bg-[#6F5FE7]' : 'bg-gray-700 hover:bg-gray-600'}`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })
                            }
                        </div>

                        <span className="sm:hidden">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`flex items-center p-2 rounded-md ${currentPage === totalPages ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#6F5FE7] hover:bg-[#5A4DD3]'}`}
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                    <div className="mt-2 sm:mt-0">
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1); // Reset to first page when changing items per page
                            }}
                            className="bg-zinc-800 border border-gray-500 text-white p-2 rounded-lg"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={25}>25 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </div>
                </div>
            )}
            {selectedReport && <ReportPopup selectedReport={selectedReport} closeModal={closeModal} />}
        </div>
    );
};

export default CenterReport;