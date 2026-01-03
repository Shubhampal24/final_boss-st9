import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";

const NavbarRouting = ({ setSelectedSection }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="w-full rounded-4xl bg-[#1F1F24] py-6 px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col sm:flex-row items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6 text-sm sm:text-base">

      {/* Dashboard */}
      <NavLink
        to="/dashboard"
        onClick={() => setSelectedSection("dashboard")}
        className={({ isActive }) =>
          isActive
            ? "text-white font-semibold underline"
            : "text-[#9F9F9F] hover:text-white transition-colors"
        }>
        Dashboard
      </NavLink>
      <NavLink to="/center-report" onClick={() => setSelectedSection("center-report")} className={({ isActive }) => isActive ? "text-white font-semibold underline" : "text-[#9F9F9F]"}>
        Center Daily Report
      </NavLink>
      <NavLink
        to="/summary"
        onClick={() => setSelectedSection("summary")}
        className={({ isActive }) =>
          isActive
            ? "text-white font-semibold underline"
            : "text-[#9F9F9F] hover:text-white transition-colors"
        }>
        Daily Center Summary
      </NavLink>

          <NavLink
        to="/arm-user-list"
        onClick={() => setSelectedSection("arm-user-list")}
        className={({ isActive }) =>
          isActive
            ? "text-white font-semibold underline"
            : "text-[#9F9F9F] hover:text-white transition-colors"
        }>
        Area Manager Cash 
      </NavLink>

      <NavLink to="/all-handover-history" onClick={() => setSelectedSection("all-handover-history")} className={({ isActive }) => isActive ? "text-white font-semibold underline" : "text-[#9F9F9F]"}>
        Cash Handover History
      </NavLink>

      {/* Region Wise Analysis */}
      <NavLink
        to="/region-data"
        onClick={() => setSelectedSection("region-data")}
        className={({ isActive }) =>
          isActive
            ? "text-white font-semibold underline"
            : "text-[#9F9F9F] hover:text-white transition-colors"
        }>
        Region Wise Analysis
      </NavLink>

      {/* Branch Wise Analysis */}
      <NavLink
        to="/branch-data"
        onClick={() => setSelectedSection("branch-data")}
        className={({ isActive }) =>
          isActive
            ? "text-white font-semibold underline"
            : "text-[#9F9F9F] hover:text-white transition-colors"
        }>
        Area Wise Analysis
      </NavLink>

      {/* Centre Wise Analysis */}
      <NavLink
        to="/centre-data"
        onClick={() => setSelectedSection("centre-data")}
        className={({ isActive }) =>
          isActive
            ? "text-white font-semibold underline"
            : "text-[#9F9F9F] hover:text-white transition-colors"
        }>
        Centre Wise Analysis
      </NavLink>

      {/* Complaints */}
      <NavLink
        to="/complaints"
        onClick={() => setSelectedSection("complaints")}
        className={({ isActive }) =>
          isActive
            ? "text-white font-semibold underline"
            : "text-[#9F9F9F] hover:text-white transition-colors"
        }>
        Complaints
      </NavLink>
      {/* Expenses Report */}
      <NavLink
        to="/expenses-report"
        onClick={() => setSelectedSection("expenses-report")}
        className={({ isActive }) =>
          isActive
            ? "text-white font-semibold underline"
            : "text-[#9F9F9F] hover:text-white transition-colors"
        }>
        Expenses Report
      </NavLink>
      {/* Customers */}
      {/* <NavLink
        to="/customer-data"
        onClick={() => setSelectedSection("customers")}
        className={({ isActive }) =>
          isActive
            ? "text-white font-semibold underline"
            : "text-[#9F9F9F] hover:text-white transition-colors"
        }>
        Customers
      </NavLink> */}

    </div>
  );
};

export default NavbarRouting;