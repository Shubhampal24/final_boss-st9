import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DataTable from "../DataTable";
import { Listbox } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Loader from "../Loader";

const TotalCollection = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranchCode, setSelectedBranchCode] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchSalesReport = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/customer/centre-sales-report`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setData(response.data.data);
      } catch (error) {
        console.error("Error fetching sales report:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesReport();
  }, []);

  const columns = [
    { label: "Sr No.", key: "srNo" },
    { label: "Center Name", key: "centreName" },
    { label: "Pay Criteria", key: "payCriteria" },
    { label: "Total Cash", key: "totalCash" },
    { label: "Total Online", key: "totalOnline" },
    { label: "Total Sales", key: "totalSales" },
  ];

  // Filtered centers based on the search term, memoized
  const filteredCenters = useMemo(() => {
    return [...new Set(data.map((item) => item.centreId || ""))].filter((centreId) => {
      const centreData = data.find((item) => item.centreId === centreId);
      return (
        centreData &&
        centreData.centreCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [data, searchTerm]);

  const filteredCentersWithNames = useMemo(() => {
    return filteredCenters.map((centreId) => {
      const centreData = data.find((item) => item.centreId === centreId);
      return centreData ? centreData.centreCode : "Unknown Center";
    });
  }, [filteredCenters, data]);

  // Filter data based on selected branch code (centreId)
  const filteredData = data.filter((item) => {
    if (!selectedBranchCode) return true;
    return item.centreId === selectedBranchCode;
  });

  if (loading) return <Loader />;

  return (
    <div className="p-5 text-white min-h-screen">
      <p className="text-2xl font-bold mb-5">Total Collection</p>
      <>
        <div className="flex gap-4 mb-4 flex-wrap">
          
          <div className="relative z-30">
            <h3 className="mb-2">Center Filter</h3>
            <Listbox value={selectedBranchCode} onChange={setSelectedBranchCode}>
              <Listbox.Button className="py-2 min-w-52 px-4 bg-[#0D0D11] text-left text-white border border-gray-600 rounded-lg">
                {selectedBranchCode
                  ? data.find((item) => item.centreId === selectedBranchCode)?.centreCode || "Unknown Center"
                  : "Select Center"}
              </Listbox.Button>

              <Listbox.Options className="absolute max-h-60 overflow-auto min-w-52 z-40 bg-[#0D0D11] mt-1 border border-gray-700 rounded-lg shadow-lg left-1/2 transform -translate-x-1/2">
                
                <div className="sticky top-0 bg-[#0D0D11] z-50">
                  <input
                    type="text"
                    placeholder="Search centers"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 px-4 text-white bg-[#1a1a1a] border-b border-gray-600 focus:outline-none"
                  />
                </div>

                <Listbox.Option
                  value=""
                  className="cursor-pointer px-4 py-2 text-gray-300 hover:bg-gray-700"
                >
                  All Centers
                </Listbox.Option>

                {filteredCentersWithNames.map((centreName, index) => (
                  <Listbox.Option
                    key={filteredCenters[index]}
                    value={filteredCenters[index]}
                    className={({ active }) =>
                      `cursor-pointer px-4 py-2 text-gray-300 ${active ? "bg-gray-700" : ""}`
                    }
                  >
                    {centreName}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Listbox>
          </div>
        </div>
        <div className="overflow-auto max-w-full">
          <DataTable
            columns={columns}
            data={filteredData.map((item, index) => ({
              srNo: index + 1,
              centreName: item.centreCode,
              payCriteria: item.payCriteria,
              totalCash: item.totalCash.toLocaleString(),
              totalOnline: item.totalOnline.toLocaleString(),
              totalSales: item.totalSales.toLocaleString(),
            }))}
          />
        </div>
      </>
    </div>
  );
};

export default TotalCollection;
