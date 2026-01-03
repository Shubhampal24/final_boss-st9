import { useState, useEffect } from "react";
import { Combobox } from "@headlessui/react";

const SearchableDropdown = ({
  tableData,
  selectedBranchCode,
  setSelectedBranchCode,
}) => {
  const [queryRegion, setQueryRegion] = useState("");
  const [queryBranch, setQueryBranch] = useState("");
  const [queryCentre, setQueryCentre] = useState("");

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  const [regionDropdownOpen, setRegionDropdownOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [centreDropdownOpen, setCentreDropdownOpen] = useState(false);

  const regions = [
    ...new Set(
      tableData.map((item) => item.regionId?.name).filter(Boolean)
    ),
  ];

  const branches = [
    ...new Set(
      tableData.map((item) => item.centreId?.branch_name).filter(Boolean)
    ),
  ];

  const centres = [
    ...new Set(
      tableData.map((item) => item.centreId?.centre_id).filter(Boolean)
    ),
  ];

  const filteredRegions = queryRegion
    ? regions.filter((region) =>
        region.toLowerCase().includes(queryRegion.toLowerCase())
      )
    : regions;

  // Filtered Branches - Show all if query is empty or selectedRegion is not set
  const filteredBranches = queryBranch
    ? branches.filter(
        (branch) =>
          tableData.some(
            (item) =>
              item.centreId?.branch_name === branch &&
              item.regionId?.name === selectedRegion &&
              item.centreId?.branch_name
                .toLowerCase()
                .includes(queryBranch.toLowerCase())
          )
      )
    : branches.filter(
        (branch) =>
          tableData.some(
            (item) =>
              item.centreId?.branch_name === branch &&
              item.regionId?.name === selectedRegion
          )
      );

  // Filtered Centres - Show all if query is empty or selectedBranch is not set
  const filteredCentres = queryCentre
    ? centres.filter(
        (centre) =>
          tableData.some(
            (item) =>
              item.centreId?.centre_id === centre &&
              item.centreId?.branch_name === selectedBranch &&
              item.centreId?.centre_id
                .toLowerCase()
                .includes(queryCentre.toLowerCase())
          )
      )
    : centres.filter(
        (centre) =>
          tableData.some(
            (item) =>
              item.centreId?.centre_id === centre &&
              item.centreId?.branch_name === selectedBranch
          )
      );

  useEffect(() => {
    // Reset branch and centre selections when region changes
    setSelectedBranch("");
    setSelectedBranchCode("");
  }, [selectedRegion]);

  useEffect(() => {
    // Reset centre selection when branch changes
    setSelectedBranchCode("");
  }, [selectedBranch]);

  return (
    <div className="w-auto px-4  flex gap-4 h-auto relative">
      {/* Region Dropdown */}
      <Combobox value={selectedRegion} onChange={(region) => setSelectedRegion(region)}>
        <div className="relative">
          <Combobox.Input
            className="w-52 px-4 text-white bg-[#1F1F24] border border-zinc-200 rounded-xl h-12 focus:outline-none"
            placeholder="Select Region"
            onClick={() => setRegionDropdownOpen(true)} // Open dropdown on click
            onChange={(event) => setQueryRegion(event.target.value)}
          />
          {regionDropdownOpen && (
            <Combobox.Options className="absolute z-10 mt-1 w-full bg-[#1F1F24] border border-zinc-200 rounded-xl shadow-lg max-h-60 overflow-auto">
              {filteredRegions.map((region) => (
                <Combobox.Option
                  key={region}
                  className="px-4 py-2 text-white border-b border-zinc-200 cursor-pointer hover:bg-zinc-700"
                  value={region}
                  onClick={() => setRegionDropdownOpen(false)} // Close dropdown after selection
                >
                  {region}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>

      {/* Branch Dropdown */}
      {selectedRegion && (
        <Combobox value={selectedBranch} onChange={(branch) => setSelectedBranch(branch)}>
          <div className="relative">
            <Combobox.Input
              className="w-52 px-4 text-white bg-[#1F1F24] border border-zinc-200 rounded-xl h-12 focus:outline-none"
              placeholder="Select Branch"
              onClick={() => setBranchDropdownOpen(true)} // Open dropdown on click
              onChange={(event) => setQueryBranch(event.target.value)}
            />
            {branchDropdownOpen && (
              <Combobox.Options className="absolute z-10 mt-1 w-full bg-[#1F1F24] border border-zinc-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                {filteredBranches.map((branch) => (
                  <Combobox.Option
                    key={branch}
                    className="px-4 py-2 text-white border-b border-zinc-200 cursor-pointer hover:bg-zinc-700"
                    value={branch}
                    onClick={() => setBranchDropdownOpen(false)} // Close dropdown after selection
                  >
                    {branch}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </div>
        </Combobox>
      )}

      {/* Centre Dropdown */}
      {selectedBranch && (
        <Combobox value={selectedBranchCode} onChange={setSelectedBranchCode}>
          <div className="relative">
            <Combobox.Input
              className="w-52 px-4 text-white bg-[#1F1F24] border border-zinc-200 rounded-xl h-12 focus:outline-none"
              placeholder="Select Centre"
              onClick={() => {
                setCentreDropdownOpen(true); // Ensure dropdown opens
                setQueryCentre(""); // Reset query so all options show
              }}             
              onChange={(event) => setQueryCentre(event.target.value)}
            />
            {centreDropdownOpen && (
              <Combobox.Options className="absolute z-10 mt-1 w-full bg-[#1F1F24] border border-zinc-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                {filteredCentres.map((centre) => (
                  <Combobox.Option
                    key={centre}
                    className="px-4 py-2 text-white border-b border-zinc-200 cursor-pointer hover:bg-zinc-700"
                    value={centre}
                    onClick={() => setCentreDropdownOpen(false)} // Close dropdown after selection
                  >
                    {centre}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            )}
          </div>
        </Combobox>
      )}
    </div>
  );
};

export default SearchableDropdown;
