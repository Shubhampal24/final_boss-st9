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

  const baseClass = "px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap";

  const activeClass = "bg-[#7B5CFA] text-white shadow-md";

  const inactiveClass = "bg-[#2A2A2F] text-[#9F9F9F] hover:bg-[#3A3A40] hover:text-white";

  return (
   <div className="w-full px-6 py-4 rounded-full overflow-x-auto">
      <div className="flex items-center gap-3 min-w-max">

        <NavLink
          to="/dashboard"
          onClick={() => setSelectedSection("dashboard")}
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }>
          Dashboard
        </NavLink>

        <NavLink
          to="/center-report"
          onClick={() => setSelectedSection("center-report")}
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }>
          Center Report
        </NavLink>

        <NavLink
          to="/summary"
          onClick={() => setSelectedSection("summary")}
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }>
          Daily Summary
        </NavLink>

        <NavLink
          to="/arm-user-list"
          onClick={() => setSelectedSection("arm-user-list")}
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }>
          Area Manager Cash
        </NavLink>

        <NavLink
          to="/all-handover-history"
          onClick={() => setSelectedSection("all-handover-history")}
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }>
          Handover History
        </NavLink>

        <NavLink
          to="/region-data"
          onClick={() => setSelectedSection("region-data")}
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }>
          Region Analysis
        </NavLink>

        <NavLink
          to="/branch-data"
          onClick={() => setSelectedSection("branch-data")}
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }>
          Area Analysis
        </NavLink>

        <NavLink
          to="/centre-data"
          onClick={() => setSelectedSection("centre-data")}
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }>
          Centre Analysis
        </NavLink>

        <NavLink
          to="/complaints"
          onClick={() => setSelectedSection("complaints")}
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }>
          Complaints
        </NavLink>

        <NavLink
          to="/expenses-report"
          onClick={() => setSelectedSection("expenses-report")}
          className={({ isActive }) =>
            `${baseClass} ${isActive ? activeClass : inactiveClass}`
          }>
          Expenses
        </NavLink>

      </div>
    </div>
  );
};
export default NavbarRouting;