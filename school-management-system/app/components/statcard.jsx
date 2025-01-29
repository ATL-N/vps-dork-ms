import { useState } from "react";

const StatCard = ({ icon, title, value, isButton = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses =
    "p-4 rounded shadow flex items-center transition-all duration-300";
  const textClasses = "text-lg font-semibold";
  const valueClasses = "text-2xl font-bold";

  const getClasses = () => {
    if (isButton) {
      return isHovered
        ? "bg-cyan-600 text-gray-100 cursor-pointer"
        : "bg-cyan-600 text-white cursor-pointer";
    }
    return "bg-white text-cyan-700 ";
  };

  return (
    <div
      className={`${baseClasses} ${getClasses()}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`text-3xl mr-4 ${
          isButton && isHovered ? "text-white" : "text-cyan-500"
        }`}
      >
        {icon}
      </div>
      <div>
        <h3 className={textClasses}>{title}</h3>
        <p className={valueClasses}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
