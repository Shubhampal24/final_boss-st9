import React, { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../DataTable";
import Loader from "../Loader";

const CenterActive = () => {
  const [data, setData] = useState([]);
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

    const fetchCenters = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/centres`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const activeCenters = response.data
          .filter((center) => center.status === "active")
          .map((center, index) => ({
            srNo: index + 1,
            centerId: center.centreId,
            centerName: center.name || "N/A",
            branchName: center.branchId?.name || "N/A",
            regionName: center.regionId?.name || "N/A",
            status: "🟢 Active",
          }));

        setData(activeCenters);
      } catch (error) {
        console.error("Error fetching active centers:", error);
        setError("Failed to fetch active centers.");
      } finally {
        setLoading(false);
      }
    };

    fetchCenters();
  }, []);

  const columns = [
    { label: "Sr No.", key: "srNo" },
    { label: "Center ID", key: "centerId" },
    { label: "Center Name", key: "centerName" },
    { label: "Branch Name", key: "branchName" },
    { label: "Region Name", key: "regionName" },
    { label: "Status", key: "status" },
  ];
  if (loading) return <Loader />;

  return (
    <div className="p-5 text-white">
      <h2 className="text-2xl font-bold mb-5">Active Centers</h2>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default CenterActive;
