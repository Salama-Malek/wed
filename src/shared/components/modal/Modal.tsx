import React, { useRef } from "react";
import clsx from "clsx";
import { classes } from "@/shared/lib/clsx";
import { MultiplicationSignIcon } from "hugeicons-react";
import useOutsideClick from "@/shared/hooks/useOutsideClick";

/**
 *
 * @param {React.ReactNode} children - Modal content
 * @param {string} className - Modal classes
 *
 * @returns {JSX.Element} Renders Modal UI
 */
const Modal = ({
  children,
  className,
  header,
  close,
  modalWidth,
  preventOutsideClick,
}: {
  children: React.ReactNode;
  className?: string;
  modalWidth?: number;
  header?: string;
  close: () => void;
  preventOutsideClick?: boolean;
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useOutsideClick(modalRef, preventOutsideClick ? () => {} : close);
  return (
    <div className="!m-0 fixed inset-0 h-screen w-screen flex items-center justify-center z-10 bg-gray-600 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-[10%] overflow-y-scroll">
      <div
      ref={modalRef}
        style={{ width: modalWidth }}
        className={classes(
          "max-h-[600px] bg-white rounded-sm overflow-y-auto overflowY p-6",
          "flex flex-col items-center justify-start",
          "shadow-lg",
          className
        )}
      >
      <div className="w-full d-right mb-3">
      <MultiplicationSignIcon
      size={12}
      strokeWidth={1.35}
            className="size-6 text-300 cursor-pointer hover:text-400 transition-all duration-300"
            onClick={close}
          />
      </div>
        {/* Header */}
        <div className={classes("w-full flex mb-4 items-start justify-between")}>
          <h2 className="text-lg semibold">{header}</h2>
          
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
