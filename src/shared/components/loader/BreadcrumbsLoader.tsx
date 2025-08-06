import React from "react";

const BreadcrumbsLoader = () => {
  return (
    <div className="flex items-center gap-2 py-2 px-4">
      {[...Array(3)].map((_, index) => (
        <React.Fragment key={index}>
          <span className="h-4 w-16 bg-gray-300 rounded-sm animate-pulse"></span>
          {index < 2 && <span className="text-gray-400">›</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

export default React.memo(BreadcrumbsLoader);
