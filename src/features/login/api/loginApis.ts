import { api } from "@/config/api";
import { method } from "lodash";

export interface TokenResponse {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}

export interface GetUserTypeResponce {
  GovRepDetails: Array<{
    GovernmentName: string;
    SubGOVTID: string;
    SubGovernmentName: string;
    GOVTID: string;
    RepMobileNumber: string;
    RepNationalid: string;
    EmailAddress: string;
    RepName: string;
  }>;
  UserTypeList: Array<{
    UserTypeLabel: string;
    UserSubType: string;
    PlaintiffTypeList: Array<{
      PlaintiffType: string;
      PlaintiffTypeLabel: string;
    }>;
    ApplicantTypeList: Array<{
      ApplicantType: string;
      ApplicantTypeLabel: string;
    }>;
    UserType: string;
  }>;
  ServiceStatus: string;
  SuccessCode: string;
  SourceSystem: string;
}

export interface ApiResponse {
  GovRepDetails: Array<{
    GovernmentName: string;
    SubGOVTID: string;
    SubGovernmentName: string;
    GOVTID: string;
    RepMobileNumber: string;
    RepNationalid: string;
    EmailAddress: string;
    RepName: string;
  }>;
  UserTypeList: Array<{
    UserTypeLabel: string;
    UserSubType: string;
    PlaintiffTypeList: Array<{
      PlaintiffType: string;
      PlaintiffTypeLabel: string;
    }>;
    ApplicantTypeList: Array<{
      ApplicantType: string;
      ApplicantTypeLabel: string;
    }>;
    UserType: string;
  }>;
  ServiceStatus: string;
  SuccessCode: string;
  SourceSystem: string;
}

export const caseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    GetUserTypeLegalRep: builder.query<ApiResponse, any>({
      query: (params) => ({
        url: `/WeddiServices/V1/GetUserType`,
        params
      }),
    }),
    getUserToken: builder.query<TokenResponse, void>({
      query: () => ({
        url: `/WeddiOauth2/v1/token`,
        method: "POST",
      }),
    })
  }),
});

export const {
  useLazyGetUserTokenQuery,
  useGetUserTypeLegalRepQuery,
  useLazyGetUserTypeLegalRepQuery,
} = caseApi;
