import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface NICServiceErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorMessage: string;
}

const NICServiceErrorModal: React.FC<NICServiceErrorModalProps> = ({ 
  isOpen, 
  onClose, 
  errorMessage
}) => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();

  const handleHomePage = () => {
    onClose();
    navigate('/');
  };

  const handleTryAgain = () => {
    onClose();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-orange-100">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-orange-700">
            {t("nic_service_error.title", "Service Error")}
          </h3>
          <p className="text-gray-600 text-sm">{errorMessage}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleTryAgain}
            className="w-full py-2 px-4 rounded-md text-white font-medium transition-colors bg-primary-600 hover:bg-primary-700"
          >
            {t("nic_service_error.try_again", "Try Again")}
          </button>
          <button
            onClick={handleHomePage}
            className="w-full py-2 px-4 rounded-md text-white font-medium transition-colors bg-gray-600 hover:bg-gray-700"
          >
            {t("nic_service_error.home_page", "Home Page")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NICServiceErrorModal; 