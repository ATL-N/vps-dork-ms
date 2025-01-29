import React from "react";

const LoadingPage = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-700"></div>
    </div>
  );
};

export default LoadingPage;
