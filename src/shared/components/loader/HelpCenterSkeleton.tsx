import React from "react";

const HelpCenterSkeleton = () => {
  return (
    <section className=" w-full h-[288px] my-[16px] p-4xl  bg-gradient-to-r from-gray-200 animate-pulse to-gray-200 opacity-50 flex flex-col shadow-md rounded-md">
      <div className="">
        <div className="">
          <div className=" h-[31px] mb-6 border-b animate-pulse border-gray-300">
            <div className="h-4 bg-gray-300 rounded w-20 animate-pulse"></div>
          </div>
          <div className="space-y-6 ">
            {[1, 2].map((_, index) => (
              <div
                key={index}
                className="flex items-center p-4 border bg-gray-100 rounded-md row animate-pulse"
              >
                <div className="bg-gray-300 text-primary-600 p-2 rounded-md w-10 h-10 mr-4"></div>

                <div className="flex items-center gap-2 w-full md:w-10/12 justify-between">
                  <div className="w-full flex">
                    <div className="md:w-5/12">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                    <div className="md:w-7/12 pe-2">
                      <div className="w-full flex">
                        <div className="md:w-5/12 flex pl-3">
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        </div>
                        <div className="md:w-7/12 flex">
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full md:w-2/12 justify-end mr-2">
                  <div className="h-8 bg-gray-300 rounded w-16"></div>
                  <div className="h-8 bg-gray-300 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HelpCenterSkeleton;
