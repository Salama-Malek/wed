import React, { createContext, useContext, useState, useCallback } from "react";
import { DateObject } from "react-multi-date-picker";

interface IDateInfo {
  hijri: string | null;
  gregorian: string | null;
  dateObject: DateObject | null;
}

interface DateContextType {
  calendarType: "hijri" | "gregorian";
  setCalendarType: (type: "hijri" | "gregorian") => void;
  dateInfo: IDateInfo;
  setDate: (info: Partial<IDateInfo>) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [calendarType, setCalendarType] = useState<"hijri" | "gregorian">("hijri");
  const [dateInfo, setDateInfo] = useState<IDateInfo>({
    hijri: "",
    gregorian: "",
    dateObject: null
  });

  const setDate = useCallback((info: Partial<IDateInfo>) => {
    setDateInfo(prev => ({ ...prev, ...info }));
  }, []);

  return (
    <DateContext.Provider
      value={{
        calendarType,
        setCalendarType,
        dateInfo,
        setDate
      }}
    >
      {children}
    </DateContext.Provider>
  );
};

export const useDateContext = () => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error("useDateContext must be used within a DateProvider");
  }
  return context;
};