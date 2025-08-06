import { api } from "@/config/api";
import { NICDetailsParams } from "../../components/hearing-details/hearing.details.types";
 
/**
 * Response shape for GetNICDetails API.
 * Extend with actual fields returned by the service.
 */
export interface NICDetailsResponse {
  ErrorDetails: any;
  DataElements: Array<{
    ElementKey: string;
    ElementValue: string;
  }>;
  NICDetails: {
    PlaintiffName?: string;
    Region?: string;
    City?: string;
    DateOfBirthHijri?: string;
    DateOfBirthGregorian?: string;
    Occupation?: string;
    Gender?: string;
    Nationality?: string;
    Applicant_Code?: string;
    Applicant?: string;
    PhoneNumber?: string;
    Occupation_Code?: string
    City_Code?: string
    Gender_Code?: string
    Region_Code?: string
    Nationality_Code?: string
 
  };
}
 
/**
 * Parameters for the GetAttorneyDetails API.
 */
export interface AttorneyDetailsParams {
  AgentID: string;
  MandateNumber: string;
  AcceptedLanguage: string;
  SourceSystem: string;
}
 
/**
 * Response shape for GetAttorneyDetails API.
 */
export interface AttorneyDetailsResponse {
  ErrorDetails: boolean;
  Agent: {
    ErrorDescription: string;
    pyErrorMessage: string;
    MandateStatus: string;
    AgentDetails: Array<{ IdentityNumber: string }>;
    AgentNoData: string;
    Error: string;
    GregorianDate: string;
    AgentName: string;
    MandateSource: string;
    MandateDate: string;
  };
  AttorneyService: string;
  SourceSystem: string;
  PartyList: Array<{
    PartySefaTypeName: string;
    FullName: string;
    Gender: string;
    ID: string;
    IdentityTypeName: string;
    Nationality: string;
    IsValid: string;
  }>;
}
 
export const caseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // National ID lookup with hijri DOB
    getNICDetails: builder.query<NICDetailsResponse, NICDetailsParams>({
      query: ({ IDNumber, DateOfBirth, AcceptedLanguage, SourceSystem }) => ({
        url: `WeddiServices/V1/GetNICDetails`,
        params: { IDNumber, DateOfBirth, AcceptedLanguage, SourceSystem },
      }),
      keepUnusedDataFor: 300,
    }),
 
    // National ID lookup with hijri DOB
    getNICDetailsForEmbasy: builder.query<NICDetailsResponse, NICDetailsParams>({
      query: ({ IDNumber, DateOfBirth, AcceptedLanguage, SourceSystem }) => ({
        url: `WeddiServices/V1/GetNICDetails`,
        params: { IDNumber, DateOfBirth, AcceptedLanguage, SourceSystem },
      }),
      keepUnusedDataFor: 300,
    }),
 
    // Worker region dropdown
    GetWorkerRegionLookupData: builder.query<any, {
      AcceptedLanguage: string; SourceSystem:
      string, ModuleKey: string, ModuleName: string
    }>({
      query: ({ AcceptedLanguage, SourceSystem, ModuleKey, ModuleName }) => ({
        url: `/WeddiServices/V1/MainLookUp`,
        params: {
          LookupType: "CaseElements",
          ModuleKey: ModuleKey,
          ModuleName: ModuleName,
          AcceptedLanguage,
          SourceSystem,
        },
      }),
    }),
 
    // Worker city dropdown based on selected region
    GetWorkerCityLookupData: builder.query<
      any,
      {
        AcceptedLanguage: string;
        SourceSystem: string;
        selectedWorkerRegion: any,
        ModuleName: string
      }>({
        query: ({ AcceptedLanguage, SourceSystem, selectedWorkerRegion, ModuleName }) => ({
          url: `/WeddiServices/V1/SubLookup`,
          params: {
            LookupType: "CaseElements",
            ModuleKey: typeof selectedWorkerRegion === 'object' ? selectedWorkerRegion.value : selectedWorkerRegion,
            ModuleName: ModuleName,
            AcceptedLanguage,
            SourceSystem,
          },
        }),
      }),
 
    // Closest labor office dropdown based on selected city
    GetLaborOfficeLookupData: builder.query<any,
      {
        AcceptedLanguage: string; SourceSystem: string;
        selectedWorkerCity: any
      }>({
        query: ({ AcceptedLanguage, SourceSystem, selectedWorkerCity }) => ({
          url: `/WeddiServices/V1/SubLookup`,
          params: {
            LookupType: "CaseElements",
            ModuleKey: typeof selectedWorkerCity === 'object' ? selectedWorkerCity.value : selectedWorkerCity,
            ModuleName: "ClosestLabourOffice",
            AcceptedLanguage,
            SourceSystem,
          },
        }),
      }),
 
    // Occupation dropdown
    GetOccupationLookupData: builder.query<any, { AcceptedLanguage: string; SourceSystem: string }>({
      query: ({ AcceptedLanguage, SourceSystem }) => ({
        url: `/WeddiServices/V1/MainLookUp`,
        params: {
          LookupType: "CaseElements",
          ModuleKey: "Occupation",
          ModuleName: "Occupation",
          AcceptedLanguage,
          SourceSystem,
        },
      }),
    }),
 
    // Gender dropdown
    GetGenderLookupData: builder.query<any, { AcceptedLanguage: string; SourceSystem: string }>({
      query: ({ AcceptedLanguage, SourceSystem }) => ({
        url: `/WeddiServices/V1/MainLookUp`,
        params: {
          LookupType: "DataElements",
          ModuleKey: "MGD1",
          ModuleName: "Gender",
          AcceptedLanguage,
          SourceSystem,
        },
      }),
    }),
 
    // Nationality dropdown
    GetNationalityLookupData: builder.query<any, { AcceptedLanguage: string; SourceSystem: string }>({
      query: ({ AcceptedLanguage, SourceSystem }) => ({
        url: `/WeddiServices/V1/MainLookUp`,
        params: {
          LookupType: "CaseElements",
          ModuleKey: "Nationality",
          ModuleName: "Nationality",
          AcceptedLanguage,
          SourceSystem,
        },
      }),
    }),
 
    // Country code dropdown
    GetCountryCodeLookupData: builder.query<any, { AcceptedLanguage: string; SourceSystem: string }>({
      query: ({ AcceptedLanguage, SourceSystem }) => ({
        url: `/WeddiServices/V1/MainLookUp`,
        params: {
          LookupType: "CaseElements",
          ModuleKey: "CountryCode",
          ModuleName: "CountryCode",
          AcceptedLanguage,
          SourceSystem,
        },
      }),
    }),
 
    // Send OTP for phone verification
    SendOtp: builder.mutation<any, any>({
      query: (data) => ({
        url: "/WeddiCreateCaseServices/V1/GlobalOtp",
        method: "POST",
        body: data,
      }),
    }),
 
    // Attorney details lookup for agent flow
    getAttorneyDetails: builder.query<AttorneyDetailsResponse, AttorneyDetailsParams>({
      query: ({ AgentID, MandateNumber, AcceptedLanguage, SourceSystem }) => ({
        url: `/WeddiServices/V1/GetAttorneyDetails`,
        params: { AgentID, MandateNumber, AcceptedLanguage, SourceSystem },
      }),
      keepUnusedDataFor: 300,
    }),
 
    GetEmbassyUserDetails: builder.query<any, {
      AcceptedLanguage: string,
      EmbassyUserId: string,
      SourceSystem: string
    }>({
      query: ({ AcceptedLanguage, SourceSystem, EmbassyUserId }) => ({
        url: "/WeddiServices/V1/GetEmbassyUserDetails",
        params: { AcceptedLanguage, SourceSystem, EmbassyUserId }
      })
    })
 
  }),
});
 
export const {
  useGetNICDetailsQuery,
  useLazyGetNICDetailsQuery,
  // hassan add this
  useGetNICDetailsForEmbasyQuery,
  useLazyGetNICDetailsForEmbasyQuery,
  useGetWorkerRegionLookupDataQuery,
  useGetWorkerCityLookupDataQuery,
  useGetLaborOfficeLookupDataQuery,
  useGetOccupationLookupDataQuery,
  useGetGenderLookupDataQuery,
  useGetNationalityLookupDataQuery,
  useGetCountryCodeLookupDataQuery,
  useSendOtpMutation,
  useGetAttorneyDetailsQuery,
  useGetEmbassyUserDetailsQuery
} = caseApi;
 
// Backward compatibility: alias for old hook name
export const useGetAgentInfoDataQuery = useGetAttorneyDetailsQuery;
 