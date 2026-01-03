import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../DataTable";
import Loader from "../Loader";

const Commission = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication token is missing.");
      setLoading(false);
      return;
    }

    const fetchSalesReport = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/customer/centre-sales-report`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const formattedData = (response.data.data || []).map((item, index) => {
          const formatValue = (value) => {
            if (value === null || value === undefined) return "0";
            return typeof value === "number"
              ? value.toLocaleString()
              : value.toString();
          };

          return {
            srNo: index + 1,
            centreName: item.centreName || "N/A",
            centreCode: item.centreCode || "N/A",
            payCriteria: item.payCriteria || "N/A",
            totalCashCommission: formatValue(item.totalCashCommission),
            totalOnlineCommission: formatValue(item.totalOnlineCommission),
            totalCommission: formatValue(item.totalCommission),
          };
        });

        setData(formattedData);
        setFilteredData(formattedData);
      } catch (error) {
        console.error("Error fetching sales report:", error);
        setError("Failed to fetch sales report.");
      } finally {
        setLoading(false);
      }
    };

    fetchSalesReport();
  }, []);

  useEffect(() => {
    const lowercasedSearch = search.toLowerCase();
    const filtered = data.filter((item) =>
      Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(lowercasedSearch)
      )
    );
    setFilteredData(filtered);
  }, [search, data]);

  const columns = [
    { label: "Sr No.", key: "srNo" },
    { label: "Center Name", key: "centreName" },
    { label: "Center Code", key: "centreCode" },
    { label: "Pay Criteria", key: "payCriteria" },
    { label: "Total Cash Commission", key: "totalCashCommission" },
    { label: "Total Online Commission", key: "totalOnlineCommission" },
    { label: "Total Commission", key: "totalCommission" },
  ];

  if (loading) return <Loader />;

  return (
    <div className="p-5 text-white min-h-screen">
      <p className="text-2xl font-bold mb-5">Commission</p>
      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        placeholder="Search..."
        className="mb-4 px-4 py-2 text-white w-full max-w-md rounded-md border border-gray-300 focus:outline-none"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="overflow-auto max-h-[600px]">
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
};

export default Commission;
