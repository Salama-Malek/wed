import { api } from "@/config/api";

export interface GetJobLocationCityLookupRequest {
  LookupType: "CaseElements";
  ModuleKey: string;
  ModuleName: string;
  AcceptedLanguage: string;
  SourceSystem: string;
}

export interface JobLocationCityElement {
  ElementKey: string;
  ElementValue: string;
}

export interface GetJobLocationCityLookupResponse {
  ServiceStatus: string;
  SuccessCode: string;
  DataElements: JobLocationCityElement[];
  SourceSystem: string;
}

export const jobLocationCityLookupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getJobLocationCityLookup: builder.query<GetJobLocationCityLookupResponse, GetJobLocationCityLookupRequest>({
      query: (params) => ({
        url: "/WeddiServices/V1/SubLookup",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetJobLocationCityLookupQuery } = jobLocationCityLookupApi; 