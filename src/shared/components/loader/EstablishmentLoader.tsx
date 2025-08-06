import React from 'react';

const EstablishmentSelectionSkeleton = () => {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="min-w-52 max-w-44 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="min-w-52 max-w-44 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
      
      <div className="min-w-52 max-w-44 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="min-w-52 max-w-44 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
      
      <div className="min-w-52 max-w-44 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
      <div className="min-w-52 max-w-44 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
    </div>
  );
};

export default React.memo(EstablishmentSelectionSkeleton);