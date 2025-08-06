import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { createContext, useContext, useEffect, useState } from "react";

type UserTypeContextType = {
  userType: string | null;
  setUserType: (type: string | null) => void;
};

const UserTypeContext = createContext<UserTypeContextType | undefined>(undefined);

export function UserTypeProvider({ children }: { children: React.ReactNode }) {
  const [userType, setUserType] = useState<string | null>(null);
  const [getCookie, setCookie] = useCookieState({ userType: "" });

useEffect(()=>{
  if(userType){
    setCookie("legalRepType",userType)
  }
},[userType])

  return (
    <UserTypeContext.Provider
      value={{
        userType,
        setUserType,
        
      }}
    >
      {children}
    </UserTypeContext.Provider>
  );
}

export function useUserType() {
  const context = useContext(UserTypeContext);
  if (context === undefined) {
    throw new Error("useUserType must be used within a UserTypeProvider");
  }
  return context;
}