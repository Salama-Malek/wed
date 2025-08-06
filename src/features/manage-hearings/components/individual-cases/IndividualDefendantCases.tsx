// import React, { useState } from "react";
// import { ReusableTable } from "@/shared/components/table/ReusableTable";
// import TableLoader from "@/shared/components/loader/TableLoader";
// import { CustomPagination } from "@/shared/components/pagination/CustomPagination";
// import { useMyCasesData } from "../../services/myCaseService"; 
// import { useMyCasesColumns } from "./myCasesColumns";

// const IndividualDefendantCases: React.FC = () => {
//   const [page, setPage] = useState(1);
//   const { data, isLoading, totalPages } = useMyCasesData({
//     TableFor: "Defendant",
//     PageNumber: page,
//   });

//   const columns = useMyCasesColumns(); // no role passed


//   return (
//     <div className="p-4">
//       {isLoading ? (
//         <TableLoader />
//       ) : (
//         <ReusableTable
//           data={data}
//           columns={columns}
//           page={page}
//           totalPages={totalPages}
//           onPageChange={setPage}
//           PaginationComponent={CustomPagination}
//         />
//       )}
//     </div>
//   );
// };

// export default IndividualDefendantCases;
