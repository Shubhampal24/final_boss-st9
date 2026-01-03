import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import DataTable from "../DataTable";
import Loader from "../Loader";

const CenterInactive = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fallbackDate = new Date().toISOString().split("T")[0];
  const storedDate = localStorage.getItem("centerStatusDate");
  const initialDateRef = useRef(storedDate || fallbackDate);

  const [inactiveData, setInactiveData] = useState([]);
  const [activeData, setActiveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(initialDateRef.current);

  useEffect(() => {
    const fetchCenters = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(
          `${BASE_URL}/api/centres/zero-entry-centres?date=${initialDateRef.current}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDate(response.data.date);

        const inactiveCenters = response.data.inactiveCentres.map((center, index) => ({
          srNo: index + 1,
          centerId: center.centreId,
          centerName: center.name || "N/A",
          branchName: center.branchName || "N/A",
          regionName: center.regionId?.name || "N/A",
          status: "No Entries Today",
        }));

        const activeCenters = response.data.activeCentres.map((center, index) => ({
          srNo: index + 1,
          centerId: center.centreId,
          centerName: center.name || "N/A",
          branchName: center.branchName || "N/A",
          regionName: center.regionId?.name || "N/A",
          balance: center.balance || 0,
        }));

        setInactiveData(inactiveCenters);
        setActiveData(activeCenters);
      } catch (err) {
        console.error("Error fetching center data:", err);
        setError("Failed to fetch center activity data.");
      } finally {
        setLoading(false);
        localStorage.removeItem("centerStatusDate");
      }
    };

    fetchCenters();
  }, [BASE_URL]);

  const inactiveColumns = [
    { label: "Sr No.", key: "srNo" },
    { label: "Center ID", key: "centerId" },
    { label: "Center Name", key: "centerName" },
    { label: "Branch Name", key: "branchName" },
    { label: "Region Name", key: "regionName" },
    { label: "Status", key: "status" },
  ];

  const activeColumns = [
    { label: "Sr No.", key: "srNo" },
    { label: "Center ID", key: "centerId" },
    { label: "Center Name", key: "centerName" },
    { label: "Branch Name", key: "branchName" },
    { label: "Region Name", key: "regionName" },
    { label: "Balance", key: "balance" },
  ];

  if (loading) return <Loader />;

  return (
    <div className="p-5 text-white text-sm">
      <h2 className="text-2xl font-bold mb-4">Center Activity Summary</h2>
      {date && <p className="mb-4">Date: {date}</p>}
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="flex flex-wrap gap-6">
          <div className="flex-1 min-w-[300px]">
            <div className="bg-gray-800 p-3 rounded-t border border-gray-600">
              <h3 className="text-xl font-semibold">Inactive Centers</h3>
            </div>
            <div className="h-[500px] overflow-auto rounded-b border-x border-b border-gray-600">
              <div className="sticky top-0 z-10">
                <DataTable
                  columns={inactiveColumns}
                  data={inactiveData}
                  className="w-full"
                  headerClassName="bg-gray-700 text-white font-semibold sticky top-0"
                  rowClassName="hover:bg-gray-700 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-[300px]">
            <div className="bg-gray-800 p-3 rounded-t border border-gray-600">
              <h3 className="text-xl font-semibold">Active Centers</h3>
            </div>
            <div className="h-[500px] overflow-auto rounded-b border-x border-b border-gray-600">
              <div className="sticky top-0 z-10">
                <DataTable
                  columns={activeColumns}
                  data={activeData}
                  className="w-full"
                  headerClassName="bg-gray-700 text-white font-semibold sticky top-0"
                  rowClassName="hover:bg-gray-700 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterInactive;
