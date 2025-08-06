import React from "react";
import StepSkeleton from "./StepSkeleton";

const StepperSkeleton = () => {
  return (
    <div className="flex space-x-6 w-full p-6">
      <StepSkeleton />
      <div className="w-full space-y-4">
    <span className="flex gap-6">
    <div className="h-4 w-40 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-4 w-40 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-4 w-40 bg-gray-200 rounded-md animate-pulse"></div>
    </span>
    <div className="h-4 w-[50rem] bg-gray-200 !my-6 rounded-md animate-pulse"></div>
        <div className="h-[23rem] w-full bg-gray-200 rounded-md animate-pulse"></div>

        <div className="h-10 w-32 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    </div>
  );
};

export default React.memo(StepperSkeleton);
