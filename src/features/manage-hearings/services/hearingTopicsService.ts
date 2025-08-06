import { api } from "@/config/api";

export const hearingTopicsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    addCaseTopic: builder.mutation({
      query: (data) => ({
        url: "/WeddiServices/V1/AddCaseTopic",
        method: "POST",
        body: data,
      }),
    }),

    updateCaseTopics: builder.mutation({
      query: (data) => ({
        url: "/WeddiServices/V1/UpdateCaseTopics",
        method: "POST",
        body: data,
      }),
    }),

    uploadAttachment: builder.mutation({
      query: (data) => ({
        url: "/WeddiServices/V1/AddAttachment",
        method: "POST",
        body: data,
      }),
    }),

    removeAttachment: builder.mutation({
      query: (data) => ({
        url: "/WeddiServices/V1/RemoveAttachment",
        method: "POST",
        body: data,
      }),
    }),

    getTopicData: builder.query({
      query: ({ CaseID, MainTopicID, SubTopicID }) => ({
        url: "/WeddiServices/V1/GetCaseTopicData",
        method: "GET",
        params: {
          CaseID,
          MainTopicID,
          SubTopicID,
        },
      }),
    }),

    mainCategoryLookup: builder.query({
      query: ({ LookupType, ModuleKey, ModuleName, ApplicantType, AcceptedLanguage }) => ({
        url: "/WeddiServices/V1/MainLookUp",
        method: "GET",
        params: {
          LookupType,
          ModuleKey,
          ModuleName,
          ApplicantType,
          AcceptedLanguage,
        },
      }),
    }),

    subCategoryLookup: builder.query({
      query: ({ LookupType, ModuleKey, ModuleName, AcceptedLanguage }) => ({
        url: "/WeddiServices/V1/SubLookup",
        method: "GET",
        params: {
          LookupType,
          ModuleKey,
          ModuleName,
          AcceptedLanguage,
        },
      }),
    }),
  }),
});

export const {
  useAddCaseTopicMutation,
  useUpdateCaseTopicsMutation,
  useUploadAttachmentMutation,
  useRemoveAttachmentMutation,
  useGetTopicDataQuery,
  useMainCategoryLookupQuery,
  useSubCategoryLookupQuery,
} = hearingTopicsApi;
