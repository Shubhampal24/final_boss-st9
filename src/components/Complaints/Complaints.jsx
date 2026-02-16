import React, { useState, useEffect, useCallback } from "react";
import NavbarMain from "../NavbarMain";
import { Toaster, toast } from "react-hot-toast";
import NavbarRouting from "../dashboard/NavbarRouting";
import DataTable from "../DataTable";
import axios from "axios";
import { Listbox } from "@headlessui/react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VissionIssueMaster = () => {
    const today = new Date().toISOString().split('T')[0];

    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [centerOptions, setCenterOptions] = useState(["All"]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedCenter, setSelectedCenter] = useState("All");
    const [selectedDate, setSelectedDate] = useState(today);

    const columns = [
        { label: "Sr no.", key: "srNo" },
        { label: "Customer ID", key: "issueId" },
        { label: "Issue Date", key: "issueDate" },
        { label: "Center ID", key: "centerId" },
        { label: "Area", key: "branchName" },
        { label: "Issue Detail", key: "issueDetail" },
    ];

    // Filter function
    const filterData = useCallback((center, date, data) => {  
        
        if (!data || !Array.isArray(data)) {
            setFilteredCustomers([]);
            return;
        }

        let filtered = [...data];
        
        // Exclude records where status is "null" or "All ok"
        filtered = filtered.filter((item) => {
            const isValid = item.status !== "null" && item.status !== "All ok";
            if (!isValid) {
                console.log("  - Filtering out:", item.name, "status:", item.status);
            }
            return isValid;
        })
        // Filter by center
        if (center !== "All") {
            filtered = filtered.filter((item) => {
                const centerMatch = item.centreId === center;
                return centerMatch;
            });
        }

        // Filter by date
        if (date) {
            filtered = filtered.filter((item) => {
                const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
                const dateMatch = itemDate === date;
                return dateMatch;
            });
        }

        // Update center options from ALL data (not filtered)
        const centers = ["All", ...new Set(data.map((item) => item.centreId).filter(Boolean))];
        setCenterOptions(centers);
        setFilteredCustomers(filtered);
    }, []);

    // Fetch customers from API
    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            
            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await axios.get(
                `${BASE_URL}/api/customers/fast?date=${selectedDate}`, 
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            console.log("API Response:", response.data);

            // Handle response structure
            let customerData;
            
            if (response.data.customers && Array.isArray(response.data.customers)) {
                customerData = response.data.customers;
            } else if (Array.isArray(response.data)) {
                customerData = response.data;
            } else {
                throw new Error("Invalid response format");
            }
            if (customerData[0]) {
            }

            if (customerData.length === 0) {
                // toast.info("No records found for this date");
            } else {
                toast.success(`Loaded ${customerData.length} records`);
            }

            setCustomers(customerData);

            // Always reset to "All" center on new data fetch
            setSelectedCenter("All");
            filterData("All", selectedDate, customerData);

        } catch (err) {
            console.error("ERROR:", err);
            
            let errorMessage = "Failed to fetch data";
            
            if (err.response) {
                console.error("Response Error:", err.response.status, err.response.data);
                errorMessage = err.response.data?.message || `Error ${err.response.status}`;
            } else if (err.request) {
                console.error("No Response:", err.request);
                errorMessage = "No response from server";
            } else {
                // console.error("Request Error:", err.message);
                errorMessage = err.message;
            }

            setError(errorMessage);
            toast.error(errorMessage);
            
            setCustomers([]);
            setFilteredCustomers([]);
            
        } finally {
            setLoading(false);
        }
    }, [selectedDate, filterData]);

    // Fix useEffect dependency
    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    // Handle center change
    const handleCenterChange = (center) => {
        setSelectedCenter(center);
        filterData(center, selectedDate, customers);
    };

    // Handle date change
    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
    };


    return (
        <div className="w-full py-5 min-h-screen h-auto bg-[#0D0D11] px-24">
            <Toaster position="top-center" reverseOrder={false} />
            <NavbarMain />
            <NavbarRouting />

            <div className="flex justify-between mt-8 items-center mb-5">
                {/* Date Filter */}
                <div>
                    <h3 className="mb-2 text-white">Select Date</h3>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="py-2 px-4 bg-[#1A1A1F] border border-gray-800 rounded-xl text-white focus:outline-none focus:border-[#6F5FE7] [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70"
                    />
                </div>

                {/* Center Filter */}
                <div className="relative">
                    <h3 className="mb-2 text-white">Select Center</h3>
                    <Listbox value={selectedCenter} onChange={handleCenterChange}>
                        <Listbox.Button className="py-2 px-4 min-w-52 bg-[#1A1A1F] text-left text-white border border-gray-800 rounded-xl hover:border-[#6F5FE7] transition-all">
                            {selectedCenter}
                        </Listbox.Button>
                        <Listbox.Options className="absolute min-w-52 bg-[#1A1A1F] mt-1 border border-gray-800 rounded-xl shadow-lg z-10 max-h-60 overflow-auto">
                            {centerOptions.map((center, index) => (
                                <Listbox.Option
                                    key={`${center}-${index}`}
                                    value={center}
                                    className={({ active }) =>
                                        `cursor-pointer px-4 py-2 ${
                                            active ? "bg-[#6F5FE7] text-white" : "text-gray-300"
                                        }`
                                    }
                                >
                                    {center}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Listbox>
                </div>
            </div>


            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-xl text-red-400">
                     {error}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="text-center text-white py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-[#6F5FE7]"></div>
                    <p className="mt-4 text-gray-400">Loading data...</p>
                </div>
            ) : (
                <>
                    <DataTable
                        columns={columns}
                        data={filteredCustomers?.map((item, index) => ({
                            srNo: index + 1,
                            issueId: item.name || "N/A",
                            issueDate: item.createdAt 
                                ? new Date(item.createdAt).toLocaleDateString() 
                                : "N/A",
                            centerId: item.centreId || "N/A",
                            branchName: item.branchName || "N/A",
                            issueDetail: item.remark || "N/A",
                        }))}
                    />

                    {/* Empty State */}
                    {filteredCustomers.length === 0 && (
                        <div className="text-center text-gray-400 py-20">
                            <p className="text-xl">No records found</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default VissionIssueMaster;