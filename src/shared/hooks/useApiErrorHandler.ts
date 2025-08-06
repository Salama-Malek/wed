import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  handleApiResponse, 
  hasApiErrors, 
  extractApiErrors, 
  createErrorResponse,
  ApiResponseWithErrors,
  ErrorHandlerConfig 
} from '@/shared/lib/api/errorHandler';

export const useApiErrorHandler = () => {
  const { t } = useTranslation();

  const handleResponse = useCallback((
    response: ApiResponseWithErrors,
    config: ErrorHandlerConfig = {}
  ): boolean => {
    return handleApiResponse(response, config);
  }, []);

  const hasErrors = useCallback((response: ApiResponseWithErrors): boolean => {
    return hasApiErrors(response);
  }, []);

  const getErrors = useCallback((response: ApiResponseWithErrors) => {
    return extractApiErrors(response);
  }, []);

  const createError = useCallback((
    errorCode: string,
    errorDesc: string,
    additionalData: Record<string, any> = {}
  ): ApiResponseWithErrors => {
    return createErrorResponse(errorCode, errorDesc, additionalData);
  }, []);

  const handleErrorsWithTranslation = useCallback((
    response: ApiResponseWithErrors,
    config: ErrorHandlerConfig = {}
  ): void => {
    const errors = extractApiErrors(response);
    
    if (errors.length === 0) return;

    const translatedConfig: ErrorHandlerConfig = {
      ...config,
      customErrorMessages: {
        ...config.customErrorMessages,
        'API_ERROR': t('api_error_generic') || 'An API error occurred',
        'VALIDATION_ERROR': t('validation_error') || 'Validation error',
        'NETWORK_ERROR': t('network_error') || 'Network error',
        'UNAUTHORIZED': t('unauthorized') || 'Unauthorized access',
        'NOT_FOUND': t('not_found') || 'Resource not found',
      }
    };

    handleApiResponse(response, translatedConfig);
  }, [t]);

  const withErrorHandling = useCallback(async <T>(
    apiCall: () => Promise<T>,
    config: ErrorHandlerConfig = {}
  ): Promise<T | null> => {
    try {
      const result = await apiCall();
      
      if (result && typeof result === 'object' && ('ErrorCodeList' in result || 'ErrorDetails' in result)) {
        const success = handleApiResponse(result as ApiResponseWithErrors, config);
        return success ? result : null;
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      const errorResponse = createErrorResponse('UNEXPECTED_ERROR', errorMessage);
      handleApiResponse(errorResponse, config);
      return null;
    }
  }, []);

  return {
    handleResponse,
    hasErrors,
    getErrors,
    createError,
    handleErrorsWithTranslation,
    withErrorHandling
  };
}; 

/*
import { toast } from "react-toastify";
import { useCallback } from "react";

export function useApiErrorHandler() {
  return useCallback((message?: string) => {
    toast.error(message || "Unexpected response from server. Please try again later.");
  }, []);
} 
*/