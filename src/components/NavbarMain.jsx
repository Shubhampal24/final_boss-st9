import React, { useState, useEffect } from 'react';
import icon from "../assets/Images/stranger.png";
import { useNavigate } from "react-router-dom";
import { IoMdLogOut } from "react-icons/io";
import { PiGameControllerThin } from "react-icons/pi";
import { LuBellDot } from "react-icons/lu";
import { FaCaretDown } from "react-icons/fa";
import v1 from "../assets/Images/v1.png";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";
import { HandCoins, Wallet } from 'lucide-react';

const NavbarMain = () => {
    const location = useLocation();
    const [employeeName, setEmployeeName] = useState("XXXXXXXXXXX");
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("No token found in localStorage");
            return;
        }

        try {
            const decodedToken = jwtDecode(token);
            if (decodedToken.exp * 1000 < Date.now()) {
                console.warn("Token is expired");
                handleLogout();
                return;
            }
            setEmployeeName(decodedToken.name || "Not Found");
        } catch (error) {
            console.error("Invalid token", error);
            handleLogout();
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className='w-full h-auto md:h-[14vh] text-white bg-[#0D0D11]'>
            <div className="w-full h-full flex flex-col md:flex-row justify-between items-center px-4 py-4 md:py-0">

                {/* Logo Section - Top on mobile, left on desktop */}
                <div className="w-full md:w-auto flex justify-center md:justify-start items-center mb-4 md:mb-0">
                    <img className='h-[5vh] w-auto object-contain' src={icon} alt="icon" />
                </div>

                {/* Navigation & Actions */}
                <div className="w-full md:w-auto flex flex-wrap justify-center md:justify-end items-center gap-3">

                    {/* Game Icon */}
                    <div
                        onClick={() => navigate('/tictactoe')}
                        className="w-10 h-10 md:w-12 md:h-12 cursor-pointer flex justify-center items-center rounded-2xl bg-[#6F5FE7]">
                        <PiGameControllerThin size={20} className="md:size-6" />
                    </div>

                    {/* Bell Icon */}
                    {/* <div onClick={() => navigate('/cash-in-hand')} className="w-12 cursor-pointer flex justify-center items-center h-12 rounded-2xl bg-[#6F5FE7]">

                        <Wallet size={24} />
                    </div> */}
                    <div
                 
                        onClick={() => navigate('/extra-cash')}
                        className="p-3 bg-[#6F5FE7] rounded-2xl hover:bg-[#5a4bc4] transition-all shadow-lg shadow-[#6F5FE7]/20"
                        title="Add Extra Cash">
                        <HandCoins size={20} className="md:size-6" />
                
                    </div>

                    <div
                        onClick={() => navigate('/cash-in-hand')}
                        className="w-10 h-10 md:w-12 md:h-12 cursor-pointer flex justify-center items-center rounded-2xl bg-[#6F5FE7]">
                        <Wallet size={20} className="md:size-6" />
                    </div>

                    {/* User Info */}
                    <div
                        className="flex items-center gap-2 px-3 h-10 md:h-12 rounded-2xl bg-[#6F5FE7] cursor-pointer"
                        onClick={() => setShowDropdown(!showDropdown)}>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white">
                            <img className='w-full h-full object-cover' src={v1} alt="user avatar" />
                        </div>
                        <h3 className="hidden sm:block text-sm md:text-base">{employeeName}</h3>
                        <FaCaretDown size={18} className="md:size-6" />
                    </div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-10 h-10 md:w-12 md:h-12 flex justify-center items-center rounded-2xl bg-[#6F5FE7] cursor-pointer">
                        <IoMdLogOut size={20} className="md:size-6" />
                    </button>
                </div>
            </div>
        </div>

    );
};

export default NavbarMain;
