import React from "react";

const CaseRecordsSkeleton = () => {
  const timelineItems = [
    {
      id: 1,
      circleClass: "bg-gray-300",
      borderClass: "border-l border-gray-300",
      content: [
        { type: "button", width: "w-16", height: "h-6" },
        { type: "text", width: "w-24", height: "h-4" },
      ],
    },
    {
      id: 2,
      circleClass: "bg-gray-300",
      borderClass: "border-l border-gray-300",
      content: [
        { type: "button", width: "w-24", height: "h-6" },
        { type: "text", width: "w-24", height: "h-4" },
      ],
    },
    {
      id: 3,
      circleClass: "border-4 border-gray-300",
      borderClass: "border-l border-gray-300",
      content: [
        { type: "button", width: "w-28", height: "h-6" },
        { type: "text", width: "w-24", height: "h-4" },
        { type: "text", width: "w-24", height: "h-4" },
      ],
    },
    {
      id: 4,
      circleClass: "bg-gray-300",
      borderClass: "",
      content: [{ type: "button", width: "w-16", height: "h-6" }],
    },
  ];

  return (
    <aside className="w-[100%] h-[580px] mb-5xl bg-gradient-to-r from-gray-200 animate-pulse to-gray-200 relative opacity-50 rounded-md shadow-md p-4">
      <div className="flex justify-between items-center mb-2">
        <div className="h-6 bg-gray-300 rounded w-1/4"></div>
      </div>

      <hr className="border-t border-gray-300 animate-pulse my-[6px] mt-4 mb-5" />

      <div className="space-y-2">
        <div className="h-4 bg-gray-300 animate-pulse rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 animate-pulse rounded w-1/2"></div>
      </div>

      <div className="ml-6 mt-16">
        {timelineItems.map((item) => (
          <div
            key={item.id}
            className={`relative ${item.borderClass} ${
              item.id !== 4 ? "h-[82px]" : ""
            } pl-6 mt-${item.id === 1 ? 0 : item.id === 4 ? 9 : 8}`}
          >
            <div
              className={`w-5 h-5 rounded-full absolute -left-[10.5px] -top-7 ${item.circleClass}`}
            ></div>

            <div className="relative -top-7 space-y-4">
              {item.content.map((content, index) => (
                <div
                  key={index}
                  className={`${content.height} bg-gray-300 animate-pulse rounded ${content.width}`}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default React.memo(CaseRecordsSkeleton);