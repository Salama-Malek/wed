import React, { createContext, useContext, useState } from "react";
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
  registerDateField: (name: string, onChange: (value: string) => void) => () => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [calendarType, setCalendarType] = useState<"hijri" | "gregorian">("hijri");
  const [dateInfo, setDateInfo] = useState<IDateInfo>({
    hijri: "",
    gregorian: "",
    dateObject: null
  });
  const [fieldCallbacks, setFieldCallbacks] = useState<Record<string, (value: string) => void>>({});

  const registerDateField = (name: string, onChange: (value: string) => void) => {
    setFieldCallbacks(prev => ({ ...prev, [name]: onChange }));
    return () => {
      setFieldCallbacks(prev => {
        const { [name]: _, ...rest } = prev;
        return rest;
      });
    };
  };

  const setDate = (info: Partial<IDateInfo>) => {
    setDateInfo(prev => {
      const newInfo = { ...prev, ...info };
      
      Object.values(fieldCallbacks).forEach(callback => {
        if (info.hijri) callback(info.hijri);
        if (info.gregorian) callback(info.gregorian);
      });
      
      return newInfo;
    });
  };

  return (
    <DateContext.Provider
      value={{
        calendarType,
        setCalendarType,
        dateInfo,
        setDate,
        registerDateField
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