import React, { useState, useMemo, useRef, useEffect } from "react";

const CenterFilterDropdown = ({ centers, selectedCenter, setSelectedCenter }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter centers by searchTerm (case-insensitive) and include "All Centers" option on top
  const filteredCenters = useMemo(() => {
    const filtered = !searchTerm
      ? centers
      : centers.filter(c =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    // Prepend the "All Centers" option
    return [{ _id: null, name: "All Centers" }, ...filtered];
  }, [searchTerm, centers]);

  const handleSelect = (center) => {
    if (center._id === null) {
      setSelectedCenter(null); // Clear selected center on choosing "All Centers"
    } else {
      setSelectedCenter(center);
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-56 text-white" ref={dropdownRef}>
      <label className="text-white text-sm mb-1 block">Centers:</label>
      <div
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer border bg-zinc-800 border-gray-500 rounded-lg p-2 flex justify-between items-center"
      >
        <span>{selectedCenter?.name || "All Centers"}</span>
        <svg
          className={`w-4 h-4 ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-zinc-900 border border-gray-600 shadow-lg">
          <input
            type="text"
            placeholder="Search centers..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 border-b border-gray-700 bg-zinc-800 text-white focus:outline-none rounded-t-md"
          />
          {filteredCenters.length === 0 ? (
            <div className="px-3 py-2 text-gray-400">No centers found.</div>
          ) : (
            filteredCenters.map(center => (
              <div
                key={center._id ?? "all-centers"}
                onClick={() => handleSelect(center)}
                className="cursor-pointer px-3 py-2 hover:bg-[#6F5FE7]"
              >
                {center.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CenterFilterDropdown;
