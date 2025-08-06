import React, { createContext, useContext, useEffect } from 'react';

interface UserContextType {
    isLegalRep: boolean;
    isEstablishment: boolean;
    openModule: boolean;
    setOpenModule: (value: boolean) => void;

    setLegelRepState: (value: boolean) => void;

    setEstablishmentState: (value: boolean) => void;
    selected: string | null;
    setSelected: (value: string | null) => void;
    userType: string | null;
    setUserType: (value: string | null) => void;
    isMenueCahngeFlag: boolean;
    setIsMenueCahngeFlag: (value: boolean) => void;
}

interface UserProviderProps {
    children: React.ReactNode;
    openModule: boolean;
    setOpenModule: (value: boolean) => void;
    isLegalRep: boolean;
    isEstablishment: boolean;

    setLegelRepState: (value: boolean) => void;
    setEstablishmentState: (value: boolean) => void;
    selected: string | null;
    setSelected: (value: string | null) => void;
    userType: string | null;
    setUserType: (value: string | null) => void;
    isMenueCahngeFlag: boolean;
    setIsMenueCahngeFlag: (value: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider: React.FC<UserProviderProps> = ({
    children,
    openModule,
    setOpenModule,
    isLegalRep,
    setLegelRepState,
    isEstablishment,
    setEstablishmentState,
    selected,
    setSelected,
    userType,
    setUserType,
    isMenueCahngeFlag,
    setIsMenueCahngeFlag
}) => {
    return (
        <UserContext.Provider value={{
            isLegalRep,
            isEstablishment,
            openModule,
            setOpenModule,
            setLegelRepState,
            setEstablishmentState,
            selected,
            setSelected,
            userType,
            setUserType,
            isMenueCahngeFlag,
            setIsMenueCahngeFlag
        }}>
            {children}
        </UserContext.Provider>
    );
}; 