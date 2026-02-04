import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState, useMemo } from "react";
import { HiCollection } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { FaWallet } from "react-icons/fa";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const CashCollectionScreen = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [name, setName] = useState("");
  const [centres, setCentres] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loadingCentres, setLoadingCentres] = useState(false);
  const [centreIssues, setCentreIssues] = useState([]);
  // Deduplicate centres by combined key id + centreId to avoid duplicate keys in React
  const uniqueCentres = useMemo(() => {
    const seen = new Set();
    return centres.filter((centre) => {
      const key = `${centre.id}_${centre.centreId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [centres]);

  // Extract unique regions for filters from uniqueCentres
  const regions = useMemo(() => {
    const regionMap = {};
    uniqueCentres.forEach((c) => {
      const regionName = c.regionId?.name || "Unknown";
      regionMap[regionName] = true;
    });
    return Object.keys(regionMap);
  }, [uniqueCentres]);

  // Extract unique branches for filters from uniqueCentres
  const branches = useMemo(() => {
    const branchMap = {};
    uniqueCentres.forEach((c) => {
      const branchName = c.branchId?.name || "Unknown";
      branchMap[branchName] = true;
    });
    return Object.keys(branchMap);
  }, [uniqueCentres]);

  const fetchAllCentres = async (token) => {
    try {
      setLoadingCentres(true);

      const response = await axios.get(`${BASE_URL}/api/centres/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const centreList = response.data || []; // This returns the array of all centres
      setCentres(centreList);
    } catch (error) {
      console.error(
        "Error fetching centres:",
        error.response?.data || error.message
      );
    } finally {
      setLoadingCentres(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      const decoded = jwtDecode(storedToken);
      setName(decoded.name);
      fetchAllCentres(storedToken);
    }
  }, []);
  // Fetch issues after fetching centres
  useEffect(() => {
    const run = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        setToken(storedToken);
        const decoded = jwtDecode(storedToken);
        setName(decoded.name);

        await fetchAllCentres(storedToken);

        // Fetch issue counts (wait for centres)
        const issuesData = await fetchCentreIssues(storedToken, decoded.id);
        setCentreIssues(issuesData);
      }
    };
    run();
  }, []);
  const fetchCentreIssues = async (token, userId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/customers/users/${userId}/assigned-centre-issues`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("Centre Issues Data:", response.data.centres);
      return response.data.centres;
    } catch (error) {
      console.error(
        "Error fetching centre issues:",
        error.response?.data || error.message
      );
      return [];
    }
  };
  const issueCountMap = useMemo(() => {
    const map = {};
    centreIssues.forEach((item) => {
      map[item.centre.id] = item.issues.length;
    });
    return map;
  }, [centreIssues]);

  // Prepare region select options
  const regionOptions = useMemo(
    () =>
      [{ value: "", label: "All Regions" }].concat(
        regions.map((r) => ({ value: r, label: r }))
      ),
    [regions]
  );

  // Prepare branch select options, filter by selected region
  const branchOptions = useMemo(
    () =>
      [{ value: "", label: "All Branches" }].concat(
        branches
          .filter((branch) => {
            if (!selectedRegion) return false;
            return uniqueCentres.some((c) => {
              const regionName = c.regionId?.name || "";
              const branchName = c.branchId?.name || "";
              return regionName === selectedRegion && branchName === branch;
            });
          })
          .map((b) => ({ value: b, label: b }))
      ),
    [branches, uniqueCentres, selectedRegion]
  );

  // Filter centres based on search, region, and branch filters
  const filteredCentres = useMemo(() => {
    const searchLower = (searchTerm || "").toLowerCase();
    const selectedRegionNormalized = (selectedRegion || "")
      .toLowerCase()
      .trim();
    const selectedBranchNormalized = (selectedBranch || "")
      .toLowerCase()
      .trim();

    return uniqueCentres.filter((centre) => {
      const centreName = centre.name || "";
      const regionName = centre.regionId?.name || "";
      const branchName = centre.branchId?.name || "";
      const shortCode = centre.shortCode || "";
      const centreId = centre.centreId || "";

      const matchesSearch =
        centreName.toLowerCase().includes(searchLower) ||
        regionName.toLowerCase().includes(searchLower) ||
        branchName.toLowerCase().includes(searchLower) ||
        shortCode.toLowerCase().includes(searchLower) ||
        centreId.toLowerCase().includes(searchLower);

      const matchesRegion = selectedRegion
        ? regionName.toLowerCase().trim() === selectedRegionNormalized
        : true;
      const matchesBranch = selectedBranch
        ? branchName.toLowerCase().trim() === selectedBranchNormalized
        : true;

      return matchesSearch && matchesRegion && matchesBranch;
    });
  }, [uniqueCentres, searchTerm, selectedRegion, selectedBranch]);

  return (
    <div className="flex flex-col font-[Plus] w-full min-h-screen bg-[#131318] text-white">
      {/* Header */}
      <div className="flex w-full h-auto items-center justify-between px-6 p-4">
        <button onClick={() => navigate(-1)} className="text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div className="text-xl font-semibold">Assigned Centres</div>
        <div style={{ width: 64 }}></div>
        {/* <button onClick={() => navigate("/cash-collection-history")} className="text-white">
            <FaWallet className="h-6 w-6" />
          </button> */}
      </div>

      {/* Search and Filters - Sticky */}
      <div className="px-6 py-4 space-y-4 sticky top-0 z-10 bg-[#131318] border-b border-gray-700">
        <input
          type="text"
          placeholder="Search Centres..."
          className="w-full p-3 rounded-lg bg-[#1E1D1D] border border-gray-600 text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loadingCentres}
        />

        <div className="flex gap-4">
          <div className="flex-1">
            <Select
              options={regionOptions}
              value={
                regionOptions.find((opt) => opt.value === selectedRegion) ||
                regionOptions[0]
              }
              onChange={(selected) => {
                const val = selected ? selected.value : "";
                setSelectedRegion(val);
                setSelectedBranch("");
              }}
              isClearable={false}
              isDisabled={loadingCentres}
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "#1E1D1D",
                  borderColor: "#4B5563",
                  borderRadius: 8,
                  color: "white",
                  minHeight: 48,
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "white",
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: "#1E1D1D",
                  color: "white",
                  maxHeight: 200,
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? "#6F5FE7" : "#1E1D1D",
                  color: "white",
                  cursor: "pointer",
                }),
              }}
              theme={(theme) => ({
                ...theme,
                borderRadius: 8,
                colors: {
                  ...theme.colors,
                  primary25: "#6F5FE7",
                  primary: "#6F5FE7",
                  neutral0: "#1E1D1D",
                },
              })}
            />
          </div>

          <div className="flex-1">
            <Select
              options={branchOptions}
              value={
                branchOptions.find((opt) => opt.value === selectedBranch) ||
                branchOptions[0]
              }
              onChange={(selected) => {
                const val = selected ? selected.value : "";
                setSelectedBranch(val);
              }}
              isClearable={false}
              isDisabled={!selectedRegion || loadingCentres}
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "#1E1D1D",
                  borderColor: "#4B5563",
                  borderRadius: 8,
                  color: "white",
                  minHeight: 48,
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "white",
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: "#1E1D1D",
                  color: "white",
                  maxHeight: 200,
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? "#6F5FE7" : "#1E1D1D",
                  color: "white",
                  cursor: "pointer",
                }),
              }}
              theme={(theme) => ({
                ...theme,
                borderRadius: 8,
                colors: {
                  ...theme.colors,
                  primary25: "#6F5FE7",
                  primary: "#6F5FE7",
                  neutral0: "#1E1D1D",
                },
              })}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Centres List */}
      <div className="flex-1 overflow-y-auto p-4 px-6">
        {loadingCentres ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full w-12 h-12 border-t-4 border-b-4 border-white"></div>
          </div>
        ) : filteredCentres.length ? (
          filteredCentres.map((centre) => {
            const uniqueKey = `${centre.id}_${centre.centreId}`;
            return (
              <div className="mb-4" key={uniqueKey}>
                <div
                  className="p-6 bg-[#1E1D1D] rounded-lg flex flex-row gap-4 items-center mb-1 cursor-pointer"
                  onClick={() => navigate(`/center-details/${centre.id}`)}
                >
                  {/* Issues Badge - Left */}
                  <div className="flex flex-col justify-center items-center h-full">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-xs font-medium text-white bg-[#6F5FE7] rounded-full px-3 py-1 mb-1">
                        Issues
                      </span>
                      <span className="text-sm text-white bg-[#5C49C1] rounded-full px-2 py-1 min-w-[28px] text-center">
                        {issueCountMap[centre.id] || 0}
                      </span>
                    </div>
                  </div>

                  {/* Center Info - Middle */}
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold text-white leading-tight">
                      {centre.name}
                    </div>
                    <div className="text-sm text-gray-400 mt-1 truncate">
                      Region: {centre.regionId?.name || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      Branch: {centre.branchId?.name || "Unknown"}
                    </div>
                    <div className="text-sm text-gray-400 truncate">
                      {`Code: ${centre.centreId}`}
                    </div>
                  </div>

                  {/* Icon - Right */}
                  <div className="w-12 h-12 text-[#6F5FE7] flex items-center justify-center bg-white rounded-lg shrink-0">
                    <HiCollection size={30} />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 mt-10">
            No centres match your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default CashCollectionScreen;
