import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface NICServiceErrorContextType {
  showServiceErrorModal: boolean;
  serviceErrorMessage: string;
  handleNICResponse: (response: any) => boolean;
  handleTryAgain: () => void;
  closeServiceErrorModal: () => void;
  setTryAgainCallback: (callback: () => void) => void;
}

const NICServiceErrorContext = createContext<NICServiceErrorContextType | undefined>(undefined);

interface NICServiceErrorProviderProps {
  children: ReactNode;
}

export const NICServiceErrorProvider: React.FC<NICServiceErrorProviderProps> = ({ children }) => {
  const [showServiceErrorModal, setShowServiceErrorModal] = useState(false);
  const [serviceErrorMessage, setServiceErrorMessage] = useState('');
  const [tryAgainCallback, setTryAgainCallback] = useState<(() => void) | null>(null);
  const navigate = useNavigate();

  const handleNICResponse = useCallback((response: any): boolean => {
    // Check if response has the specific error structure
    if (response?.ErrorDetails && Array.isArray(response.ErrorDetails)) {
      const errorDetail = response.ErrorDetails.find(
        (detail: any) => detail.ErrorCode === 'ER4054'
      );
      
      if (errorDetail) {
        setServiceErrorMessage(errorDetail.ErrorDesc || 'The service is not working / The entered ID does not match the date of birth');
        setShowServiceErrorModal(true);
        return true; // Error was handled
      }
    }
    
    return false; // No error or different error
  }, []);

  const handleTryAgain = useCallback(() => {
    if (tryAgainCallback) {
      tryAgainCallback();
    }
    setShowServiceErrorModal(false);
  }, [tryAgainCallback]);

  const closeServiceErrorModal = useCallback(() => {
    setShowServiceErrorModal(false);
  }, []);

  const setTryAgainCallbackFn = useCallback((callback: () => void) => {
    setTryAgainCallback(() => callback);
  }, []);

  const value: NICServiceErrorContextType = {
    showServiceErrorModal,
    serviceErrorMessage,
    handleNICResponse,
    handleTryAgain,
    closeServiceErrorModal,
    setTryAgainCallback: setTryAgainCallbackFn,
  };

  return (
    <NICServiceErrorContext.Provider value={value}>
      {children}
    </NICServiceErrorContext.Provider>
  );
};

export const useNICServiceErrorContext = (): NICServiceErrorContextType => {
  const context = useContext(NICServiceErrorContext);
  if (context === undefined) {
    throw new Error('useNICServiceErrorContext must be used within a NICServiceErrorProvider');
  }
  return context;
}; 