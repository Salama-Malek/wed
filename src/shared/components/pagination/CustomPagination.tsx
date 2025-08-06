import React from "react";
import LArrow from "@/assets/l_arrow.svg";
import RArrow from "@/assets/r_arrow.svg";
import { useTranslation } from "react-i18next";

interface IPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const CustomPagination: React.FC<IPaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const getPagesArray = (): (number | string)[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    return [1, 2, 3, "...", totalPages];
  };

  const pages = getPagesArray();

  return (
    <div
      className={`flex items-center space-x-4 px-4 mt-4 mb-4 ${
        isRTL ? "justify-start" : "justify-end"
      }`}
    >
      <button
        className={`text-[#161616] disabled:opacity-50`}
        onClick={() => onPageChange(Math.max(page - 1, 1))}
        type="button"
        disabled={page === 1}
      >
        <img
        className={`${isRTL ? "!ml-6":""}`}
          src={isRTL ? RArrow : LArrow} 
          alt="Previous"
        />
      </button>

      {pages.map((item, index) => {
        if (item === "...") {
          return (
            <span
              key={index}
              className="text-[#161616] border rounded-sm border-[#1f1f1f] px-2 py-1 text-sm medium"
            >
              ...
            </span>
          );
        }

        const pageNum = item as number;
        const isActive = pageNum === page;

        return (
          <button
            key={index}
            className={`text-[#161616] text-md  normal !px-3 relative ${
              isActive
                ? "bold after:content-[''] after:absolute after:bottom-[-3px] after:left-0 after:w-full after:h-[3px] after:bg-[#1B8354]"
                : "hover:text-primary-600"
            }`}
            type="button"
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        className="text-[#161616] disabled:opacity-50"
        onClick={() => onPageChange(Math.min(page + 1, totalPages))}
        type="button"
        disabled={page === totalPages}
      >
        <img
          src={isRTL ? LArrow : RArrow}
          alt="Next"
        />
      </button>
    </div>
  );
};
