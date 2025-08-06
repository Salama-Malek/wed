export function TableSkeletonLoader() {
    return (
      <div className="w-full animate-pulse mb-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </th>
              <th className="px-4 py-3 text-left">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-gray-200">
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </td>
                <td className="px-4 py-3">
                  <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }