import { forwardRef, useId, useEffect, useRef } from "react";
import { FieldWrapper } from "./FieldWrapper";

export type TextAreaFieldProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  value?: string;
  id?: string;
  label?: string;
  className?: string;
  invalidFeedback?: any;
  notRequired?: boolean;
  isLoading?: boolean;
};

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  (props: TextAreaFieldProps, ref) => {
    const {
      isLoading,
      label,
      className,
      invalidFeedback,
      value,
      notRequired,
      ...restProps
    } = props;
    const uniqueId = useId();
    const id = props.id ? props.id : uniqueId;
    const textareaRef:any = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (!textareaRef.current) return;
      
      const textarea = textareaRef.current;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }, [value]);

    return (
      <FieldWrapper
        notRequired={notRequired}
        labelFor={id}
        label={label}
        invalidFeedback={invalidFeedback?.message}
      >
        {isLoading ? (
          <div 
            className={`w-full h-18 rounded-xs p-2 mt-1 bg-gray-100 animate-pulse ${
              className ?? ""
            }`}
          >
            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            
          </div>
        ) : (
          <textarea
            ref={(el) => {
              if (typeof ref === "function") {
                ref(el);
              } else if (ref) {
                ref.current = el;
              }
              textareaRef.current = el;
            }}
            id={id}
            className={`w-full h-auto overflow-hidden border rounded-xs p-2 mt-1 focus:outline-none focus:ring-[1px] ${
              invalidFeedback
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-300"
            } ${className ?? ""}`}
            value={value}
            style={{ resize: "none" }} 
            {...restProps}
          />
        )}
      </FieldWrapper>
    );
  }
);

TextAreaField.displayName = "TextAreaField";