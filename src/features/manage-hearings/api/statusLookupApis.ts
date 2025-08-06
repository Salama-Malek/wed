import { api } from "@/config/api";

export interface GetStatusWorkLookupRequest {
  LookupType: "DataElements";
  ModuleKey: string; // e.g. "MSTA1"
  ModuleName: string; // e.g. "StatusWork"
  AcceptedLanguage: string;
  SourceSystem: string;
}

export interface StatusElement {
  ElementKey: string;
  ElementValue: string;
}

export interface GetStatusWorkLookupResponse {
  ServiceStatus: string;
  SuccessCode: string;
  DataElements: StatusElement[];
  SourceSystem: string;
}

export const statusLookupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStatusWorkLookup: builder.query<GetStatusWorkLookupResponse, GetStatusWorkLookupRequest>({
      query: ({
        LookupType,
        ModuleKey,
        ModuleName,
        AcceptedLanguage,
        SourceSystem,
      }) => ({
        url: "/WeddiServices/V1/MainLookUp",
        params: {
          LookupType,
          ModuleKey,
          ModuleName,
          AcceptedLanguage,
          SourceSystem,
        },
      }),
    }),
  }),
});

export const { useGetStatusWorkLookupQuery } = statusLookupApi;
