import React from "react";

const StepSkeleton = () => {
  return (
    <div className="flex justify-start flex-col w-[25%]">
       <div className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex items-start space-x-4 space-y-16">
          <div className="h-8 w-8 relative top-[62px] bg-gray-200 rounded-full animate-pulse "></div>
          <div className="flex flex-col space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-3 w-48 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(StepSkeleton);
