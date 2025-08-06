
const HearingCardSkeleton = () => {
    return (
      <section className="flex gap-3xl  opacity-50">
        {[1, 2].map((card) => (
          <div
            key={card}
            className="w-1/2 overflow-hidden  h-[276px] p-4xl bg-gradient-to-r from-gray-200 animate-pulse to-gray-200 rounded-md flex flex-col items-center justify-between relative shadow-md"
          >
            <div className="absolute top-[28px] left-[16px] bg-gray-300 p-3 rounded-md w-10 h-10"></div>
  
            <div className="text-start mt-8 flex justify-start items-center h-full w-full">
              <div className="flex flex-col space-y-[14px] w-full">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
  
            <div className="w-full flex justify-end items-center pb-2">
              <div className="h-10 bg-gray-300 rounded w-24"></div>
            </div>
          </div>
        ))}
      </section>
    );
  };
  
  export default HearingCardSkeleton;