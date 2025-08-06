import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
 
export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}
 
interface ReusableTableProps<TData extends object> {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  className?: string;
  PaginationComponent?: React.ComponentType<PaginationProps>;
  hidePagination?: boolean;
  showEdit?: boolean;
}
 
function DefaultPagination({
  page,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const { t } = useTranslation("managehearings");
 
  return (
    <div className="flex justify-end items-center space-x-4 px-4 mt-2 mb-4">
      <button
        className="text-gray-600 disabled:opacity-50"
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        type="button"
        disabled={page === 1}
      >
        {t("pagination.prev")}
      </button>
      <div className="text-gray-600 text-md medium">
        {t("pagination.page_of", { page, totalPages })}
      </div>
      <button
        className="text-gray-600 disabled:opacity-50"
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        type="button"
        disabled={page === totalPages}
      >
        {t("pagination.next")}
      </button>
    </div>
  );
}
 
export function ReusableTable<TData extends object>({
  data,
  columns,
  page,
  totalPages,
  onPageChange,
  className = "",
  PaginationComponent = DefaultPagination,
  hidePagination = false,
  showEdit = false,
}: ReusableTableProps<TData>) {
  const { t } = useTranslation("managehearings");
 
  const filteredColumns = React.useMemo(() => {
    if (!showEdit) {
      return columns.filter((column) => column.id !== "edit");
    }
    return columns;
  }, [columns, showEdit]);
 
  const table = useReactTable({
    data,
    columns: filteredColumns,
    getCoreRowModel: getCoreRowModel(),
  });
 
  return (
    <div className={`w-full bg-white  ${className}`}>
      <div className="rounded-md border border-gray-300 overflow-auto">
        <table className="w-full" style={{ borderSpacing: 0 }}>
          <thead className="bg-gray-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-300 ">
                {headerGroup.headers.map((header) => {
                  let headerContent = flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  );
                  if (typeof headerContent === "string") {
                    headerContent = t(headerContent);
                  }
                  return (
                    <th
                      key={header.id}
                      className="p-3 text-start border-r border-gray-300 last:border-r-0
                      th-min-screen-width"
                    >
                      {headerContent}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex, rowArray) => (
              <tr
                key={row.id}
                className={`border-b border-gray-300 ${
                  rowIndex === rowArray.length - 1 ? "last:border-b-0" : ""
                }`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="p-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
      {!hidePagination && PaginationComponent && (
        <PaginationComponent
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}