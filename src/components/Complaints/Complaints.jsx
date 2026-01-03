import React, { useState, useEffect, useCallback } from "react";
import NavbarMain from "../NavbarMain";
import { Toaster } from "react-hot-toast";
import NavbarRouting from "../dashboard/NavbarRouting";
import DataTable from "../DataTable";
import axios from "axios";
import { Listbox } from "@headlessui/react"; // Make sure to import Listbox from Headless UI

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VissionIssueMaster = () => {
    // Format today's date as YYYY-MM-DD for the date input
    const today = new Date().toISOString().split('T')[0];

    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [centerOptions, setCenterOptions] = useState(["All"]);

    const [selectedCenter, setSelectedCenter] = useState("All");
    const [selectedDate, setSelectedDate] = useState(today); // Set today as default

    const columns = [
        { label: "Sr no.", key: "srNo" },
        { label: "Customer ID", key: "issueId" },
        { label: "Issue Date", key: "issueDate" },
        { label: "Center ID", key: "centerId" },
        { label: "Area", key: "branchName" },
        { label: "Issue Detail", key: "issueDetail" },
    ];

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${BASE_URL}/api/customer/filtered-customers`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const customerData = response.data;

                // Extract unique center IDs from the API response
                const centers = ["All", ...new Set(customerData.map((item) => item.centreId?.centreId).filter(Boolean))];

                setCustomers(customerData);
                setCenterOptions(centers); // Update dropdown options dynamically

                // Apply filter immediately after fetching with today's date
                filterData("All", today, customerData); // Default to "All" center and today's date
                console.log("Fetched customers:", customerData);

            } catch (error) {
                console.error("Error fetching customers:", error);
            }
        };

        fetchCustomers();
    }, []); // Runs once when component mounts

    const filterData = useCallback((center, date, data = customers) => {
        let filtered = data;

        // Exclude records where status is "null" or "All ok"
        filtered = filtered.filter((item) => item.status !== "null" && item.status !== "All ok");

        if (center !== "All") {
            filtered = filtered.filter((item) => item.centreId?.centreId === center);
        }

        if (date) {
            filtered = filtered.filter((item) => new Date(item.createdAt).toISOString().split('T')[0] === date);
        }

        const centers = ["All", ...new Set(filtered.map((item) => item.centreId?.centreId).filter(Boolean))];
        setCenterOptions(centers);

        setFilteredCustomers(filtered);
    }, [customers]);

    const handleCenterChange = (center) => {
        setSelectedCenter(center);
        filterData(center, selectedDate);
    };

    const handleDateChange = (e) => {
        const date = e.target.value;
        setSelectedDate(date);
        filterData(selectedCenter, date);
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
                        className="py-2 px-4 bg-[#4f4f5a] border border-gray-600 rounded-lg text-white"
                    />
                </div>

                {/* Center Filter */}
                <div className="relative">
                    <h3 className="mb-2 text-white">Select Center</h3>
                    <Listbox value={selectedCenter} onChange={handleCenterChange}>
                        <Listbox.Button className="py-2 px-4 min-w-52 bg-[#1A1A1F] text-left text-white border border-gray-600 rounded-lg">
                            {selectedCenter}
                        </Listbox.Button>
                        <Listbox.Options className="absolute min-w-52 bg-[#1A1A1F] mt-1 border border-gray-700 rounded-lg shadow-lg">
                            {centerOptions.map((center, index) => (
                                <Listbox.Option
                                    key={`${center}-${index}`}
                                    value={center}
                                    className={({ active }) =>
                                        `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`}>
                                    {center}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Listbox>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredCustomers?.map((item, index) => ({
                    srNo: index + 1,
                    issueId: item.name || "N/A",
                    issueDate: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A",
                    centerId: item.centreId?.centreId || "N/A",
                    branchName: item.centreId?.branchName || item.branchName || "N/A",
                    issueDetail: item.remark || "N/A",
                }))}
            />
        </div>
    );
};

export default VissionIssueMaster;