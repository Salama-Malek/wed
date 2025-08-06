import { api } from "@/config/api";
import { ApiResponse } from "@/shared/modules/case-creation/components/StepNavigation";
import { processAttachmentKey } from "@/shared/lib/helpers";

interface ExtractAcknowledgment {
  ModuleKey: string;
  ModuleName: string;
  LookupType: string;
  AcceptedLanguage: string;
  SourceSystem: string;
  isCaseCreated?: string;
}

export const caseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    saveClaimantDetails: builder.mutation<ApiResponse, any>({
      query: ({ data, isCaseCreated }) => ({
        url: `/WeddiCreateCaseServices/V1/${isCaseCreated ? "Update" : "Create"}`,
        method: "POST",
        body: data,
      }),
    }),
    saveDefendantDetails: builder.mutation<ApiResponse, any>({
      query: (data) => ({
        url: "/WeddiCreateCaseServices/V1/Update",
        method: "POST",
        body: data,
      }),
    }),
    saveWorkDetails: builder.mutation<ApiResponse, any>({
      query: (data) => ({
        url: "/WeddiCreateCaseServices/V1/Update",
        method: "POST",
        body: data,
      }),
    }),
    saveHearingTopics: builder.mutation<ApiResponse, any>({
      query: (data) => ({
        url: "/WeddiCreateCaseServices/V1/Update",
        method: "POST",
        body: data,
      }),
    }),
    updateHearingTopics: builder.mutation<ApiResponse, any>({
      query: (data) => ({
        url: "/WeddiServices/V1/UpdateCaseTopics",
        method: "POST",
        body: data,
      }),
    }),
    submitReview: builder.mutation<ApiResponse, any>({
      query: (data) => ({
        url: "/WeddiCreateCaseServices/V1/Update",
        method: "POST",
        body: data,
      }),
    }),
    getAcknowledgement: builder.query<any, any>({
      query: ({
        LookupType,
        ModuleKey,
        ModuleName,
        AcceptedLanguage,
      }) => ({
        url: `/WeddiServices/V1/MainLookUp`,
        params: {
          LookupType: LookupType,
          ModuleKey: ModuleKey,
          ModuleName: ModuleName,
          AcceptedLanguage: AcceptedLanguage,
        },
      }),
    }),
    getFileDetails: builder.query<any, any>({
      query: ({ AttachmentKey, AcceptedLanguage }) => {
        // Process AttachmentKey to handle special characters
        const processedAttachmentKey = processAttachmentKey(AttachmentKey);
        
        console.log('[getFileDetails] Original AttachmentKey:', AttachmentKey);
        console.log('[getFileDetails] Processed AttachmentKey:', processedAttachmentKey);
        
        return {
          url: `/WeddiServices/V1/DownloadAttachment`,
          params: {
            AttachmentKey: processedAttachmentKey,
            AcceptedLanguage: AcceptedLanguage,
          },
        };
      },
    }),
    // getCaseDetails: builder.query<any, any>({
    //   query: ({ CaseID, AcceptedLanguage, SourceSystem }) => ({
    //     url: `/WeddiServices/V1/GetCaseDetails`,
    //     params: {
    //       CaseID: CaseID,
    //       AcceptedLanguage: AcceptedLanguage,
    //       SourceSystem: SourceSystem
    //     }
    //   }),
    // }),
    submitFinalReview: builder.mutation<ApiResponse, any>({
      query: (data) => ({
        url: `/WeddiCreateCaseServices/V1/FinalSubmit`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useSaveClaimantDetailsMutation,
  useSaveDefendantDetailsMutation,
  useSaveWorkDetailsMutation,
  useSaveHearingTopicsMutation,
  useUpdateHearingTopicsMutation,
  useSubmitReviewMutation,
  useGetAcknowledgementQuery,
  useGetFileDetailsQuery,
  useLazyGetFileDetailsQuery,
  useSubmitFinalReviewMutation,
} = caseApi;
