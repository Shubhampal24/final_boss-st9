import React, { useEffect, useState } from "react";
import "./RainEffect.css"; // Import CSS for animation

const ActiveMembers = () => {
  const [raindrops, setRaindrops] = useState([]);

  useEffect(() => {
    const generateRaindrops = () => {
      const drops = Array.from({ length: 100 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}vw`,
        animationDuration: `${Math.random() * 1.5 + 1.5}s`,
        wind: `${Math.random() * 20 - 10}px`, // Wind effect
      }));
      setRaindrops(drops);
    };

    generateRaindrops();
  }, []);

  return (
    <div className="relative flex justify-center items-center min-h-[72vh] overflow-hidden">
      {/* Rain Container */}
      <div className="rain-container">
        {raindrops.map((drop) => (
          <div
            key={drop.id}
            className="raindrop"
            style={{
              left: drop.left,
              animationDuration: drop.animationDuration,
              "--wind": drop.wind,
            }}
          ></div>
        ))}
      </div>

      {/* Maintenance Text */}
      <p className="text-3xl font-bold text-white relative z-10 animate-bounce">
        Under Maintenance
      </p>
    </div>
  );
};

export default ActiveMembers;
