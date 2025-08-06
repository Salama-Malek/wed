import { FieldWrapper } from "../form";
import { trim } from "lodash";

interface ConvertedDateDisplayProps {
  gregorianDate?: string | null;  
  notRequired?: boolean;
  label?: string;
  showDateGregorian?:any
}

export const ConvertedDateDisplay = ({
  gregorianDate,
  notRequired = true,
  label,
  showDateGregorian
}: ConvertedDateDisplayProps) => {
  const formatDate = (dateStr: string | null | undefined) => {
    if (dateStr === null || dateStr === undefined || dateStr.trim() === "") {
      return "---:---";
    }

    const trimmed = trim(dateStr);
    if (trimmed.length !== 8) return trimmed; 

    try {
      return `${trimmed.substr(6, 2)}-${trimmed.substr(4, 2)}-${trimmed.substr(0, 4)}`;
    } catch {
      return trimmed; 
    }
  };
  
  const displayDate = formatDate(gregorianDate);
  
  return (
    <div className="w-full rounded-md">
      <FieldWrapper notRequired={notRequired} labelFor="gregorianDate" label={label}>
        <div id="gregorianDate" className="w-full">
          <span className="medium text-sm8">{displayDate}</span>
        </div>
      </FieldWrapper>
    </div>
  );
};