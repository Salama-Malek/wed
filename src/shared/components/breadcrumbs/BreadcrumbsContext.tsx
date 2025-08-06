import React, { createContext, ReactElement, ReactNode, useContext } from 'react';

interface BreadcrumbsContextProps {
  separator: string | ReactElement;
}

const BreadcrumbsContext = createContext<BreadcrumbsContextProps | undefined>(undefined);

export const useBreadcrumbsContext = (): BreadcrumbsContextProps => {
  const context = useContext(BreadcrumbsContext);
  if (!context) {
    throw new Error('useBreadcrumbsContext must be used within a BreadcrumbsProvider');
  }
  return context;
};

interface BreadcrumbsProviderProps {
  separator: string | ReactElement;
  children: ReactNode;
}

export const BreadcrumbsProvider: React.FC<BreadcrumbsProviderProps> = ({ separator, children }) => {
  return (
    <BreadcrumbsContext.Provider value={{ separator }}>
      {children}
    </BreadcrumbsContext.Provider>
  );
};
