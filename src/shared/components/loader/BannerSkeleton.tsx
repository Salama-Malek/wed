import React from "react";

const BannerSkeleton = () => {
  return (
    <section
      className="relative w-full mt-4 overflow-hidden border border-gray-200 rounded-md h-[240px]"
    >
      <div className="absolute inset-0 w-full h-full bg-gray-200 opacity-20"></div>

      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-200 opacity-50"></div>

      <div className="relative p-11xl z-10 flex flex-col justify-between h-full">
        <div>
          <div className="mb-11 relative z-10 bg-gray-100 rounded-md h-16 p-3xl flex justify-between items-center">
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>

          <div className="relative z-10 flex justify-between items-center">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-[339px]"></div>
              <div className="h-4 bg-gray-200 rounded w-[379px]"></div>
            </div>

            <div className="flex items-center gap-8">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center gap-8">
                  <div className="flex flex-col items-center">
                    <div className="h-8 bg-gray-200 rounded w-8"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 mt-2"></div>
                  </div>

                  {index !== 2 && (
                    <div className="h-12 w-[1px] bg-gray-300 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSkeleton;