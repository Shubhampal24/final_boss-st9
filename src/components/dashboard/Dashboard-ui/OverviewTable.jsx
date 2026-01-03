import { useState, useEffect } from "react";
import axios from "axios";
import RegionFilter from "./Filters/RegionFilter";
import DataTable from "../../DataTable";
import { Listbox } from "@headlessui/react";

const OverviewTable = () => {
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [regionData, setRegionData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState("All");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default to today's date
    const [topBottomFilter, setTopBottomFilter] = useState("Top Player");  // Changed from "All" to "Top Player"

    // Fetch region data when component mounts
    useEffect(() => {
        const fetchRegionData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Authentication token is missing.");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const response = await axios.get(`${BASE_URL}/api/centres/full`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Format the data to match the structure expected by the component
                const formattedData = response.data.map(item => ({
                    centreName: item.name,
                    totalCashCollection: item.totalCashCollection || 0,
                    totalOnlineCollection: item.totalOnlineCollection || 0,
                    totalSales: item.totalSales || 0,
                    regionName: item.regionId ? item.regionId.name : "Unknown"
                }));

                setRegionData(formattedData);
                setLoading(false);

                // Load top player data by default
                applyTopBottomFilter("Top Player");
            } catch (error) {
                console.error("Error fetching region data:", error);
                setError("Failed to load region data.");
                setLoading(false);
            }
        };
        fetchRegionData();
    }, [BASE_URL, date]);

    const applyTopBottomFilter = async (filter) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Authentication token is missing.");
            return;
        }

        setLoading(true);

        try {
            if (filter === "Top Player") {
                const response = await axios.get(`${BASE_URL}/api/sales/top-centres`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const formattedData = response.data.topCentres.map(centre => ({
                    centreName: centre.centreName,
                    totalCashCollection: centre.totalCash,
                    totalOnlineCollection: centre.totalOnline,
                    totalSales: centre.totalSales,
                    regionName: centre.regionName || selectedRegion !== "All" ? selectedRegion : ""
                }));

                setFilteredData(formattedData);
            } else if (filter === "Bottom Player") {
                const response = await axios.get(`${BASE_URL}/api/sales/bottom-centres`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log(response.data);
                
                const formattedData = response.data.bottomCentres.map(centre => ({
                    centreName: centre.centreName,
                    totalCashCollection: centre.totalCash,
                    totalOnlineCollection: centre.totalOnline,
                    totalSales: centre.totalSales,
                    // Add region information if available in your data
                    regionName: centre.regionName || selectedRegion !== "All" ? selectedRegion : ""
                }));

                setFilteredData(formattedData);
            } else if (filter === "Hike") {
                const response = await axios.get(`${BASE_URL}/api/sales/hike`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const formattedData = response.data.salesData.map(centre => ({
                    centreName: centre.centreName,
                    totalCashCollection: centre.currentWeekSales - centre.lastWeekSales, // Showing the increase
                    totalOnlineCollection: 0, // This data isn't available in the hike API
                    totalSales: centre.currentWeekSales,
                    lastWeekSales: centre.lastWeekSales,
                    increasePercentage: centre.increasePercentage.toFixed(2) + "%",
                    // Add region information if available in your data
                    regionName: centre.regionName || selectedRegion !== "All" ? selectedRegion : ""
                }));

                setFilteredData(formattedData);
            } else {
                // Reset to all data
                setFilteredData(regionData);
            }
        } catch (error) {
            console.error(`Error fetching ${filter} data:`, error);
            setError(`Failed to load ${filter} data.`);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique region names from the fetched data
    const regionOptions = regionData.length > 0
        ? ["All", ...new Set(regionData.map(item => item.regionName).filter(Boolean))]
        : ["All"];

    const handleRegionChange = (selected) => {
        setSelectedRegion(selected);

        // Keep the current filter when region changes
        if (selected === "All") {
            applyTopBottomFilter(topBottomFilter);
        } else {
            // Apply region filter and maintain the current top/bottom filter
            if (topBottomFilter === "All") {
                setFilteredData(regionData.filter(item => item.regionName === selected));
            } else {
                applyTopBottomFilter(topBottomFilter);
            }
        }
    };

    const getColumns = () => {
        const baseColumns = [
            { label: "Centre Name", key: "centreName" },
            { label: "Total Cash Collection", key: "totalCashCollection" },
            { label: "Total Online Collection", key: "totalOnlineCollection" },
            { label: "Total Sales", key: "totalSales" },
        ];

        if (topBottomFilter === "Hike") {
            return [
                ...baseColumns,
                { label: "Last Week Sales", key: "lastWeekSales" },
                { label: "Increase %", key: "increasePercentage" }
            ];
        }

        return baseColumns;
    };

    // if (loading) return <p className="text-white">Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="w-full py-5 h-auto pb-22 bg-[#0D0D11] text-white">
            <p className="text-2xl mt-6 font-bold mb-5 px-5">Overview</p>

            <div className="flex w-full justify-between items-center">
                <div className="w-full flex gap-4 px-5">
                    <RegionFilter
                        selectedRegion={selectedRegion}
                        onRegionChange={handleRegionChange}
                        regionOptions={regionOptions}
                    />

                    {/* Dropdown for Top/Bottom Player Filter */}
                    <div className="relative mb-4">
                        <h3 className="mb-2">Player Filter</h3>
                        <Listbox value={topBottomFilter} onChange={(filter) => {
                            setTopBottomFilter(filter);
                            applyTopBottomFilter(filter);
                        }}>
                            <Listbox.Button className="py-2 px-4 min-w-52 bg-[#1A1A1F] text-left text-white border border-gray-600 rounded-lg">
                                {topBottomFilter}
                            </Listbox.Button>
                            <Listbox.Options className="absolute min-w-52 bg-[#1A1A1F] mt-1 border border-gray-700 rounded-lg shadow-lg z-10">
                                <Listbox.Option
                                    value="Top Player"
                                    className={({ active }) =>
                                        `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`}>
                                    Top Player
                                </Listbox.Option>
                                <Listbox.Option
                                    value="Bottom Player"
                                    className={({ active }) =>
                                        `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`}>
                                    Bottom Player
                                </Listbox.Option>
                                <Listbox.Option
                                    value="Hike"
                                    className={({ active }) =>
                                        `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`}>
                                    Hike
                                </Listbox.Option>
                            </Listbox.Options>
                        </Listbox>
                    </div>
                </div>
            </div>

            <DataTable columns={getColumns()} data={filteredData} />
        </div>
    );
};

export default OverviewTable;