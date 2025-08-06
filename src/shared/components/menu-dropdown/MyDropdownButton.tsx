import { MyDropdownContext } from "@/providers";
import { ReactNode, useContext } from "react";
import Button from "../button";
import { GoChevronDown } from "react-icons/go";
import { ApplyStyle } from "@/features/dashboard/components/home.styles";
import { ArrowDown01Icon } from "hugeicons-react";

export const MyDropdownButton: React.FC<{ children: ReactNode,applyStyle?:ApplyStyle,className?:string }> = ({
    children,
    applyStyle,
    className
  }) => {
    const { toggle } = useContext(MyDropdownContext);
  
    return (
      <Button
        onClick={toggle}
        variant={applyStyle?.variant}
        typeVariant={applyStyle?.typeVariant}
        size={applyStyle?.size}
        className={`h-8 w-24 px-3 regular text-gray-500 text-sm border border-gray-400 ${className}`}
      >
        {children}
        <ArrowDown01Icon size={22} className="pt-2xs !m-0 mx-xs" />
      </Button>
    );
  };