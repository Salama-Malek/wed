import { api } from "@/config/api";

export const caseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    genericLookup: builder.query({
      query: (params) => ({
        url: "/WeddiServices/V1/MainLookUp",
        params,
      }),
      keepUnusedDataFor: 60,
    }),
    subLookup: builder.query({
      query: (params) => ({
        url: "/WeddiServices/V1/SubLookup",
        params,
      }),
      keepUnusedDataFor: 60,
    }),
    subTopicsSubLookup: builder.query({
      query: (params) => ({
        url: "/WeddiServices/V1/SubLookup",
        params,
      }),
      keepUnusedDataFor: 60,
    }),
  }),
});

export const {
  useGenericLookupQuery,
  useSubLookupQuery,
  useSubTopicsSubLookupQuery
} = caseApi;