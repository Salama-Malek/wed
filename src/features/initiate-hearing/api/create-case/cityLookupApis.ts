import { api } from "@/config/api";

export interface GetCityLookupRequest {
  LookupType: "CaseElements";
  ModuleKey: string;
  ModuleName: string;
  AcceptedLanguage: string;
  SourceSystem: string;
}

export interface CityElement {
  ElementKey: string;
  ElementValue: string;
}

export interface GetCityLookupResponse {
  ServiceStatus: string;
  SuccessCode: string;
  DataElements: CityElement[];
  SourceSystem: string;
}

export const cityLookupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCityLookup: builder.query<GetCityLookupResponse, GetCityLookupRequest>({
      query: (params) => ({
        url: "/WeddiServices/V1/SubLookup",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetCityLookupQuery } = cityLookupApi; 