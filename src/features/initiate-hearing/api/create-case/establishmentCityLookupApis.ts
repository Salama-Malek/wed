import { api } from "@/config/api";

export interface GetEstablishmentCityLookupRequest {
  LookupType: "CaseElements";
  ModuleKey: string;
  ModuleName: string;
  AcceptedLanguage: string;
  SourceSystem: string;
}

export interface EstablishmentCityElement {
  ElementKey: string;
  ElementValue: string;
}

export interface GetEstablishmentCityLookupResponse {
  ServiceStatus: string;
  SuccessCode: string;
  DataElements: EstablishmentCityElement[];
  SourceSystem: string;
}

export const establishmentCityLookupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getEstablishmentCityLookup: builder.query<GetEstablishmentCityLookupResponse, GetEstablishmentCityLookupRequest>({
      query: (params) => ({
        url: "/WeddiServices/V1/SubLookup",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetEstablishmentCityLookupQuery } = establishmentCityLookupApi; 