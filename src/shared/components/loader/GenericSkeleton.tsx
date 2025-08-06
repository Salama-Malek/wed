const GenericSkeleton = ({ isTwo }: { isTwo?: boolean }) => {
  return (
    <div role="status" className="max-w-full animate-pulse relative z-50">
      <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-4" />
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-2.5" />
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5" />
      
      {!isTwo && (
        <>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5" />
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5" />
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-4" />
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-2.5" />
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5" />
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5" />
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5" />
          <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-4" />
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full mb-2.5" />
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5" />
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5" />
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5" />
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-full" />
        </>
      )}
    </div>
  );
};

export default GenericSkeleton;