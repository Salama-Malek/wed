import React, { createContext, useContext } from 'react';
import { useFormReset } from '@/shared/hooks/useFormReset';

interface FormResetContextType {
  resetField: (fieldName: string) => void;
  resetFields: (fields: string[]) => void;
  resetAll: () => void;
  fieldDependencies: Record<string, any>;
}

const FormResetContext = createContext<FormResetContextType | null>(null);

interface FormResetProviderProps {
  children: React.ReactNode;
  setValue: any;
  clearErrors?: any;
}

export const FormResetProvider: React.FC<FormResetProviderProps> = ({ 
  children, 
  setValue, 
  clearErrors 
}) => {
  const resetUtils = useFormReset(setValue, clearErrors);

  return (
    <FormResetContext.Provider value={resetUtils}>
      {children}
    </FormResetContext.Provider>
  );
};

export const useFormResetContext = () => {
  const context = useContext(FormResetContext);
  if (!context) {
    throw new Error('useFormResetContext must be used within a FormResetProvider');
  }
  return context;
}; 