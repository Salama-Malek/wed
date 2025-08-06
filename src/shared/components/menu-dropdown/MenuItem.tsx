import { MyDropdownContext, MyDropdownItemsProps } from "@/providers";
import { useContext } from "react";

export const MyDropdownItems: React.FC<MyDropdownItemsProps> = ({ items }) => {
    const { isOpen, toggle } = useContext(MyDropdownContext);
  
    const handleClick = (onClick: () => void) => {
      onClick();
      toggle();
    };
  
    return isOpen ? (
      <ul className="border p-2 absolute z-40 bg-white">
        {items.map((item, index) => (
          <li
            key={index}
            className="cursor-pointer hover:bg-gray-100"
          >
            {item.label}
          </li>
        ))}
      </ul>
    ) : null;
  };