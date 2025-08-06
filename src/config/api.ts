import { TokenClaims } from '@/features/login/components/AuthProvider';
import { APIError } from '@/features/manage-hearings/types';
import { createApi, fetchBaseQuery, BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query/react';
import cookie from "react-cookies";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { startLoading, stopLoading } from '@/redux/slices/loadingSlice';
import { handleApiResponse, ApiResponseWithErrors, ErrorHandlerConfig, SUPPRESSED_ERROR_CODES } from '@/shared/lib/api/errorHandler';

const handleApiResponseLegacy = (result: any, args: string | FetchArgs) => {
  const url = typeof args === 'string' ? args : args.url;

  // Don't toast for NIC details errors, they are handled by a modal in AuthProvider
  if (url?.includes('GetNICDetails')) {
    return;
  }

  // // Don't toast for GetAttorneyDetails errors, they are handled by component-level logic
  // if (url?.includes('GetAttorneyDetails')) {
  //   return;
  // }

  // Use the new centralized error handler
  if (result?.data) {
    const config: ErrorHandlerConfig = {
      showToasts: true,
      redirectOnTokenExpired: true,
      // Don't show toasts for NIC details as they're handled by modal
      customErrorMessages: url?.includes('GetNICDetails') ? {} : undefined
    };
    // Patch: Suppress errors with codes in SUPPRESSED_ERROR_CODES if any toast.error is called here in the future
    // (Currently, handleApiResponse is used, which already suppresses, but this ensures future safety)
    handleApiResponse(result.data as ApiResponseWithErrors, config);
  }
};

const customBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta> = async (args, api, extraOptions) => {
  // Start loading
  api.dispatch(startLoading());

  try {
    const result = await fetchBaseQuery({
      baseUrl: process.env.VITE_API_URL,
      prepareHeaders: (headers) => {
        // Token Should Be Send In The Header
        headers.set('Content-Type', 'application/json');
        // Token Should Be Send In The Header
        const token = cookie.load("token");
        if (token) {
          headers.set('accesstoken', `${token}`);
        }
        const oauthToken = cookie.load("oauth_token"); // The new OAuth token
        if (oauthToken) {
          headers.set('Authorization', `Bearer ${oauthToken}`);
        }


        // the scurity fixed 
        // const accessToken = cookie.load("access_token");
        // if (accessToken ) {
        //   headers.set('Authorization', `${accessToken}`);
        // }



        return headers;
      },
    })(args, api, extraOptions);

    // Enable automatic error handling for all API responses
    if (result.data) {
      handleApiResponseLegacy(result, args);
    }

    // Handle network errors or other fetch errors
    if (result.error && !result.data) {
      try {
        handleApiError(result.error);
      } catch (error) {
        // Dispatch the error to your global error state if needed
        api.dispatch({
          type: 'api/globalError',
          payload: error,
        });
        throw error;
      }
    }

    return result;
  } finally {
    // Stop loading regardless of success or failure
    api.dispatch(stopLoading());
  }
};

const transformRequest = (args: FetchArgs): FetchArgs => {
  const userClaims = cookie.load("userClaims") as TokenClaims;
  const isNICDetailsRequest = args.url?.includes('GetNICDetails');
  const isIncompleteCaseRequest = args.url?.includes('GetIncompleteCase');
  const userType = userClaims?.UserType?.toLowerCase();
  const userTypeOrdinary = cookie.load('userType');
  const mainCategory = cookie.load("mainCategory")?.value;
  const subCategory = cookie.load("subCategory")?.value;
  const userID = cookie.load("userClaims")?.UserID;
  const fileNumber = cookie.load("userClaims")?.File_Number;

  // Skip incomplete case request if userClaims is not available
  if (isIncompleteCaseRequest && !userClaims?.UserID) {
    throw new Error("User claims not available");
  }

  // For NIC details API, add LoggedInUserID while preserving original IDNumber
  if (isNICDetailsRequest) {
    if (args.params) {
      args.params = {
        ...args.params,
        LoggedInUserID: userClaims?.UserID,
        SourceSystem: "E-Services",
        AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || 'EN',
      };
    }
    return args;
  }

  // For all other requests, add common parameters
  if (args.method === 'POST' || args.method === 'PUT' || args.method === 'PATCH') {
    if (args.body) {
      const commonParams: {
        SourceSystem: string;
        IDNumber?: string;
        PlaintiffId?: string;
        AcceptedLanguage: string;
        UserType?: string;
        FileNumber?: string;
        MainGovernment?: string;
        SubGovernment?: string;
      } = {
        SourceSystem: "E-Services",
        IDNumber: userClaims?.UserID,
        AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || 'EN',
        UserType: userTypeOrdinary
      };

      // Only add PlaintiffId for Worker and Agent user types
      if (userType === 'worker' || userType === 'agent' || userType === "embassy user") {
        commonParams.PlaintiffId = userClaims?.UserID;
      }

      // Add FileNumber for Establishment user type
      if (userTypeOrdinary === "Establishment" && fileNumber) {
        commonParams.FileNumber = fileNumber;
      }

      // Add MainGovernment and SubGovernment for Legal representative user type
      if (userTypeOrdinary === "Legal representative" && mainCategory && subCategory) {
        commonParams.MainGovernment = mainCategory;
        commonParams.SubGovernment = subCategory;
      }

      args.body = {
        ...args.body,
        ...commonParams,
      };
    }
  } else {
    if (args.params) {
      const commonParams: {
        SourceSystem: string;
        IDNumber?: string;
        PlaintiffId?: string;
        AcceptedLanguage?: string;
        UserType?: string;
        FileNumber?: string;
        MainGovernment?: string;
        SubGovernment?: string;
      } = {
        SourceSystem: "E-Services",
        IDNumber: userClaims?.UserID,
        // Only set AcceptedLanguage if not already present
        ...(args.params.AcceptedLanguage ? {} : { AcceptedLanguage: userClaims?.AcceptedLanguage?.toUpperCase() || 'EN' }),
        // UserType: userTypeOrdinary
      };

      // Only add PlaintiffId for Worker and Agent user types
      if (userType === 'worker' || userType === 'agent' || userType === "embassy user") {
        commonParams.PlaintiffId = userClaims?.UserID;
      }

      // Add FileNumber for Establishment user type
      if (userTypeOrdinary === "Establishment" && fileNumber) {
        commonParams.FileNumber = fileNumber;
      }

      // Add MainGovernment and SubGovernment for Legal representative user type
      if (userTypeOrdinary === "Legal representative" && mainCategory && subCategory) {
        commonParams.MainGovernment = mainCategory;
        commonParams.SubGovernment = subCategory;
      }

      args.params = {
        ...commonParams,
        ...args.params,
      };
    }
  }

  return args;
};

const tokenQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta> = async (args, api, extraOptions) => {
  // Start loading
  api.dispatch(startLoading());

  try {
    const result = await fetchBaseQuery({
      baseUrl: process.env.VITE_API_URL,
      prepareHeaders: (headers) => {

        headers.set('Content-Type', 'application/x-www-form-urlencoded');

        return headers;
      },
      body: new URLSearchParams({
        client_id: process.env.VITE_OAUTH_CLIENT_ID || '13214757724497106741',
        client_secret: process.env.VITE_OAUTH_CLIENT_SECRET || '77059AC65D87323D8149F51193E978D0',
        grant_type: process.env.VITE_OAUTH_GRANT_TYPE || 'client_credentials'
      })
    })(args, api, extraOptions);

    // Enable automatic error handling for token responses
    if (result.data) {
      handleApiResponseLegacy(result, args);
    }

    if (result.error) {
      try {
        handleApiError(result.error);
      } catch (error) {
        // Dispatch the error to your global error state if needed
        api.dispatch({
          type: 'api/globalError',
          payload: error,
        });
        throw error;
      }
    }

    return result;
  } finally {
    // Stop loading regardless of success or failure
    api.dispatch(stopLoading());
  }
};



export const api = createApi({
  baseQuery: (args, api, extraOptions) => {
    if (args?.url?.includes("token")) {
      return tokenQuery(args, api, extraOptions)
    }
    const transformedArgs = transformRequest(typeof args === 'string' ? { url: args } : args);
    return customBaseQuery(transformedArgs, api, extraOptions);
  },
  keepUnusedDataFor: 60,
  tagTypes: [''],
  endpoints: () => ({}),
});

export const handleApiError = (error: unknown): never => {

  if (!error) throw new Error("Unknown error occurred");

  if (typeof error === 'object' && 'status' in error) {
    const apiError = error as APIError;

    let errorMessage = `Error ${apiError.originalStatus ?? "Unknown"}`;

    if (typeof apiError.data === "string") {
      errorMessage = apiError.data;
    } else if (apiError.error) {
      errorMessage = apiError.error;
    }

    throw new Error(errorMessage);
  }

  throw new Error("Unexpected API error");
};