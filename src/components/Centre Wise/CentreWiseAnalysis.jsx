import React, { useEffect, useState } from "react";
import axios from "axios";
import { Listbox } from "@headlessui/react";
import DataTable from "../DataTable";
import NavbarMain from "../NavbarMain";
import NavbarRouting from "../dashboard/NavbarRouting";
import { Toaster } from "react-hot-toast";
import { GoGraph } from "react-icons/go";
import CenterGraph from "./CenterGraph";

const CentreWiseAnalysis = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [isGraphView, setIsGraphView] = useState(false);
  const [centerData, setCenterData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCenter, setSelectedCenter] = useState("All");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [topBottomFilter, setTopBottomFilter] = useState("All");  // New filter for Top/Bottom

  useEffect(() => {
    const fetchCenterData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/centres/statistics?date=${date}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCenterData(response.data);
        setFilteredData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching center data:", error);
        setError("Failed to load data.");
        setLoading(false);
      }
    };
    fetchCenterData();
  }, [date]);

  // Filter the data based on the selected Top/Bottom filter
  useEffect(() => {
    if (topBottomFilter === "Top Player") {
      const topPlayers = [...centerData].sort((a, b) => b.totalSales - a.totalSales).slice(0, centerData.length);  // Top 5 based on totalSales
      setFilteredData(topPlayers);
    } else if (topBottomFilter === "Bottom Player") {
      const bottomPlayers = [...centerData].sort((a, b) => a.totalSales - b.totalSales).slice(0, centerData.length);  // Bottom 5 based on totalSales
      setFilteredData(bottomPlayers);
    } else {
      setFilteredData(centerData); // "All" or no filter, show all data
    }
  }, [topBottomFilter, centerData]);  // Apply the filter whenever the filter or centerData changes

  const centerOptions = centerData.length > 0
    ? ["All", ...new Set(centerData.map((item) => item.centerName || item.name))]
    : ["All"];

  const handleCenterChange = (selected) => {
    setSelectedCenter(selected);
    if (selected === "All") {
      setFilteredData(centerData);
    } else {
      setFilteredData(centerData.filter((item) => item.centerName === selected || item.name === selected));
    }
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleGraphView = () => {
    setIsGraphView((prevState) => !prevState);  // Toggle the graph view state
  };

  const columns = [
    { label: "Center ID", key: "code" },
    { label: "Center Name", key: "name" },
    { label: "Short Code", key: "shortCode" },
    { label: "Total Clients", key: "totalClients" },
    { label: "Total Revenue", key: "totalSales" },
    { label: "Balance", key: "balance" },
    { label: "Previous Balance", key: "previousBalance" },
  ];

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full py-5 min-h-screen h-auto bg-[#0D0D11] px-24 text-white">
      <Toaster position="top-center" reverseOrder={false} />
      <NavbarMain />
      <NavbarRouting />

      <div className="flex justify-end items-center p-4">
        <div className="w-auto">
          <div
            className="p-3 px-5 flex justify-between items-center w-42 rounded-lg bg-[#6F5FE7] cursor-pointer"
            onClick={handleGraphView}>
            <h3>{isGraphView ? "Table View" : "Graph View"}</h3>
            <GoGraph size={20} />
          </div>
        </div>
      </div>

      {!isGraphView && (
        <>
          <p className="text-2xl mt-6 font-bold mb-5 px-5 inline-block">Center Data</p>
          <div className="flex w-full justify-a items-center px-5">
            <div className="w-full flex gap-4">
              <div className="mb-4">
                <h3 className="mb-2">Select Date</h3>
                <input
                  type="date"
                  value={date}
                  onChange={handleDateChange}
                  className="py-2 px-4 bg-[#1A1A1F] border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div className="relative mb-4">
                <h3 className="mb-2">Center Filter</h3>
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
                          `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`
                        }
                      >
                        {center}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Listbox>
              </div>

              {/* New Filter Dropdown for Top/Bottom Players */}
              <div className="relative mb-4">
                <h3 className="mb-2">Player Filter</h3>
                <Listbox value={topBottomFilter} onChange={setTopBottomFilter}>
                  <Listbox.Button className="py-2 px-4 min-w-52 bg-[#1A1A1F] text-left text-white border border-gray-600 rounded-lg">
                    {topBottomFilter === "All" ? "Select Filter" : topBottomFilter}
                  </Listbox.Button>
                  <Listbox.Options className="absolute min-w-52 bg-[#1A1A1F] mt-1 border border-gray-700 rounded-lg shadow-lg">
                    <Listbox.Option
                      value="All"
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`}>
                      All
                    </Listbox.Option>
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
                  </Listbox.Options>
                </Listbox>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Conditionally render either the graph view or the table */}
      {isGraphView ? (
        <CenterGraph data={filteredData} />
      ) : (
        <DataTable columns={columns} data={filteredData} />
      )}

    </div>
  );
};

export default CentreWiseAnalysis;
