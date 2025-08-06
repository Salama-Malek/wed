import { api } from "@/config/api";

export interface GetWorkerCityLookupRequest {
  LookupType: "CaseElements";
  ModuleKey: string;
  ModuleName: string;
  AcceptedLanguage: string;
  SourceSystem: string;
}

export interface WorkerCityElement {
  ElementKey: string;
  ElementValue: string;
}

export interface GetWorkerCityLookupResponse {
  ServiceStatus: string;
  SuccessCode: string;
  DataElements: WorkerCityElement[];
  SourceSystem: string;
}

export const workerCityLookupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkerCityLookup: builder.query<GetWorkerCityLookupResponse, GetWorkerCityLookupRequest>({
      query: (params) => ({
        url: "/WeddiServices/V1/SubLookup",
        method: "GET",
        params,
      }),
    }),
  }),
});

export const { useGetWorkerCityLookupQuery } = workerCityLookupApi; 