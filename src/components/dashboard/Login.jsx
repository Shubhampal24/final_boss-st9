import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import icon from "../../assets/Images/stranger.png";
import v1 from "../../assets/Images/v1.png";
import toast, { Toaster } from "react-hot-toast"; // Import hot toast

const Login = () => {
  const [loginId, setLoginId] = useState("");
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        { loginId, pin },
        { withCredentials: true }
      );

      const { message, token, user} = response.data;

      if (user.role !== "BSS") {
        toast.error("Access Denied");
        return;
      }

      localStorage.setItem("token", token);
localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error.response?.data?.message || error.message);
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="w-full flex h-screen">
      <Toaster position="top-center" reverseOrder={false} /> {/* Hot Toast Component */}

      <div className="w-[42vw] h-full flex justify-center items-center bg-zinc-900">
        <img className="w-full h-full object-cover" src={v1} alt="" />
      </div>
      <div className="w-[58vw] h-full bg-black flex flex-col justify-center items-center p-20">
        <img className="w-[25vw] h-auto object-contain" src={icon} alt="" />
        <input
          className="text-white mt-10 text-sm border border-white rounded-2xl w-[20vw] px-8 py-4"
          placeholder="Enter UserID"
          type="text"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
        />
        <input
          className="text-white text-sm border border-white rounded-2xl w-[20vw] px-8 py-4 mt-4"
          placeholder="Password"
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <button
          className="text-white text-sm font-semibold rounded-2xl w-[20vw] px-8 py-4 bg-[#6F5FE7] mt-5"
          onClick={handleLogin}
        >
          Log in
        </button>
      </div>
    </div>
  );
};

export default Login;
