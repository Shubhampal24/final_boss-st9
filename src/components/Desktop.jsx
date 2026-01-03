import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import icon from "../assets/Images/stranger_icon.png";

const Desktop = () => {
  const navigate = useNavigate();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        navigate("/login");
      }, 1000); // Match the duration of the fade-out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <motion.div
      className="w-full bg-zinc-800 flex justify-center items-center h-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 1 }}>
      <img className="w-2/6 h-full object-contain" src={icon} alt="Icon" />
    </motion.div>
  );
};

export default Desktop;
