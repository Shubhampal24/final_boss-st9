import { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import DataTable from "../DataTable";
import NavbarMain from "../NavbarMain";
import NavbarRouting from "../dashboard/NavbarRouting";
import { Toaster } from "react-hot-toast";
import { GoGraph } from "react-icons/go";
import axios from "axios";
import RegionGraph from "./RegionGraph";

const RegionWiseAnalysis = () => {
  const [isGraphView, setIsGraphView] = useState(false);
  const [regionData, setRegionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [topBottomFilter, setTopBottomFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

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
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/regions/statistics/data?date=${date}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRegionData(response.data);
        setFilteredData(response.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to load data.");
        setLoading(false);
      }
    };
    fetchRegionData();
  }, [date]); // Refetch data when the date changes

  // Filter the data based on the selected Top/Bottom filter
  useEffect(() => {
    if (topBottomFilter === "Top Player") {
      const topPlayers = [...regionData]
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, regionData.length);
      setFilteredData(topPlayers);
    } else if (topBottomFilter === "Bottom Player") {
      const bottomPlayers = [...regionData]
        .sort((a, b) => a.totalSales - b.totalSales)
        .slice(0, regionData.length);
      setFilteredData(bottomPlayers);
    } else {
      setFilteredData(regionData); // "All" or no filter, show all data
    }
  }, [topBottomFilter, regionData]);

  // Region options with search filtering
  const regionOptions =
    regionData.length > 0
      ? [
          "All",
          ...new Set(regionData.map((item) => item.regionName || item.name)),
        ]
      : ["All"];

  const filteredRegionOptions = regionOptions.filter((region) =>
    region.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRegionChange = (selected) => {
    setSelectedRegion(selected);
    if (selected === "All") {
      setFilteredData(regionData);
    } else {
      setFilteredData(
        regionData.filter(
          (item) => item.regionName === selected || item.name === selected
        )
      );
    }
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const handleGraphView = () => {
    setIsGraphView((prevState) => !prevState); // Toggle the graph view state
  };

  const columns = [
    { label: "Region ID", key: "regionId" },
    { label: "Region Name", key: "name" },
    { label: "Short Code", key: "shortCode" },
    { label: "Total Clients", key: "totalClients" },
    { label: "Total Sales", key: "totalSales" },
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
            onClick={handleGraphView}
          >
            <h3>{isGraphView ? "Graph View" : "Table View"}</h3>
            <GoGraph size={20} />
          </div>
        </div>
      </div>
      {isGraphView && (
  <>
    <p className="text-2xl mt-6 font-bold mb-5 px-4 inline-block">
      Region Data
    </p>

    <div className="flex w-full justify-between items-center mb-4 px-4">
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

        {/* Region Filter with Search and Scrollable Dropdown */}
        <div className="relative mb-4">
          <h3 className="mb-2">Region Filter</h3>
          <Listbox value={selectedRegion} onChange={handleRegionChange}>
            {({ open }) => (
              <>
                <Listbox.Button className="py-2 px-4 min-w-52 bg-[#1A1A1F] text-left text-white border border-gray-600 rounded-lg">
                  {selectedRegion}
                </Listbox.Button>
                {open && (
                  <div className="absolute mt-1 min-w-52 bg-[#1A1A1F] border border-gray-700 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      <input
                        type="text"
                        placeholder="Search region..."
                        className="w-full px-3 py-2 bg-[#1A1A1F] border border-gray-600 rounded text-white"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        value={searchQuery}
                      />
                    </div>
                    <Listbox.Options className="max-h-60 overflow-y-auto">
                      {filteredRegionOptions.length > 0 ? (
                        filteredRegionOptions.map((region, index) => (
                          <Listbox.Option
                            key={`${region}-${index}`}
                            value={region}
                            className={({ active }) =>
                              `cursor-pointer px-4 py-2 ${
                                active
                                  ? "bg-gray-700 text-white"
                                  : "text-gray-300"
                              }`
                            }
                          >
                            {region}
                          </Listbox.Option>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-400">
                          No results found
                        </div>
                      )}
                    </Listbox.Options>
                  </div>
                )}
              </>
            )}
          </Listbox>
        </div>

        <div className="relative mb-4">
          <h3 className="mb-2">Player Filter</h3>
          <Listbox value={topBottomFilter} onChange={setTopBottomFilter}>
            <Listbox.Button className="py-2 px-4 min-w-52 bg-[#1A1A1F] text-left text-white border border-gray-600 rounded-lg">
              {topBottomFilter === "All"
                ? "Select Filter"
                : topBottomFilter}
            </Listbox.Button>
            <Listbox.Options className="absolute min-w-52 bg-[#1A1A1F] mt-1 border border-gray-700 rounded-lg shadow-lg">
              <Listbox.Option
                value="All"
                className={({ active }) =>
                  `cursor-pointer px-4 py-2 ${
                    active ? "bg-gray-700 text-white" : "text-gray-300"
                  }`
                }
              >
                All
              </Listbox.Option>
              <Listbox.Option
                value="Top Player"
                className={({ active }) =>
                  `cursor-pointer px-4 py-2 ${
                    active ? "bg-gray-700 text-white" : "text-gray-300"
                  }`
                }
              >
                Top Player
              </Listbox.Option>
              <Listbox.Option
                value="Bottom Player"
                className={({ active }) =>
                  `cursor-pointer px-4 py-2 ${
                    active ? "bg-gray-700 text-white" : "text-gray-300"
                  }`
                }
              >
                Bottom Player
              </Listbox.Option>
            </Listbox.Options>
          </Listbox>
        </div>
      </div>
    </div>
  </>
)}


      {isGraphView ? (
        <DataTable columns={columns} data={filteredData} />
        
      ) : (
        <RegionGraph columns={columns} data={filteredData} />
      )}
    </div>
  );
};

export default RegionWiseAnalysis;
