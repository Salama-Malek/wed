import { MultiplicationSignIcon } from "hugeicons-react";

interface FileAttachmentProps {
  fileName: string;
  onView?: () => void;
  onRemove?: () => void;
  isClaimant?: boolean;
  fileSize?: string | number;
  fileType?: string;
  className?: string;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  fileName,
  onView,
  onRemove,
  isClaimant,
  fileSize,
  fileType,
  className,
}) => {
  return (
    <div className={`flex gap-2 ${isClaimant && "mt-7"} items-center w-80 bg-gray-100 h-auto p-2 border border-gray-300 rounded-sm max-w-md ${className}`}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clipRule="evenodd"
          d="M10 19.1693C15.0626 19.1693 19.1667 15.0652 19.1667 10.0026C19.1667 4.93999 15.0626 0.835938 10 0.835938C4.93743 0.835938 0.833374 4.93999 0.833374 10.0026C0.833374 15.0652 4.93743 19.1693 10 19.1693Z"
          fill="white"
        />
        <path
          fill-rule="evenodd"
          clipRule="evenodd"
          d="M10 19.1693C15.0626 19.1693 19.1667 15.0652 19.1667 10.0026C19.1667 4.93999 15.0626 0.835938 10 0.835938C4.93743 0.835938 0.833374 4.93999 0.833374 10.0026C0.833374 15.0652 4.93743 19.1693 10 19.1693ZM5.87522 9.27037C5.54978 9.59581 5.54978 10.1234 5.87522 10.4489L8.23224 12.8059C8.55768 13.1313 9.08532 13.1313 9.41076 12.8059L14.1248 8.09186C14.4502 7.76642 14.4502 7.23878 14.1248 6.91335C13.7994 6.58791 13.2717 6.58791 12.9463 6.91335L8.8215 11.0381L7.05373 9.27037C6.7283 8.94493 6.20066 8.94493 5.87522 9.27037Z"
          fill="#067647"
        />
      </svg>

      <div className="flex-1 truncate">
        <p className="medium text-gray-900 truncate">
          {fileName}
        </p>
        {fileSize && (
          <p className="text-xs text-gray-500">
            {typeof fileSize === 'number' 
              ? fileSize > 1024 * 1024 
                ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB` 
                : `${(fileSize / 1024).toFixed(2)} KB`
              : fileSize}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onView}
        className="text-gray-600 hover:text-gray-800"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.33337 5.33333C1.33337 5.33333 4.31814 2 8.00004 2C11.6819 2 14.6667 5.33333 14.6667 5.33333"
            stroke="#6C737F"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
          <path
            d="M14.3627 8.69406C14.5654 8.97826 14.6667 9.1204 14.6667 9.33073C14.6667 9.54106 14.5654 9.6832 14.3627 9.9674C13.452 11.2445 11.1262 13.9974 8.00004 13.9974C4.87389 13.9974 2.54811 11.2445 1.6374 9.9674C1.43471 9.6832 1.33337 9.54106 1.33337 9.33073C1.33337 9.1204 1.43471 8.97826 1.6374 8.69406C2.54811 7.417 4.87389 4.66406 8.00004 4.66406C11.1262 4.66406 13.452 7.417 14.3627 8.69406Z"
            stroke="#6C737F"
            strokeWidth="1.25"
          />
          <path
            d="M10 9.33594C10 8.23134 9.1046 7.33594 8 7.33594C6.8954 7.33594 6 8.23134 6 9.33594C6 10.4405 6.8954 11.3359 8 11.3359C9.1046 11.3359 10 10.4405 10 9.33594Z"
            stroke="#6C737F"
            strokeWidth="1.25"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={onRemove}
        className="hover:text-gray-600"
      >
        <MultiplicationSignIcon size={16} />
      </button>
    </div>
  );
};

export default FileAttachment;