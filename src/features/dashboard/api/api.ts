import { api } from "@/config/api";
import { ICaseRecord } from "../types/caseRecord.model";
 
export const caseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCaseAudit: builder.query<ICaseRecord, any>({
      query: (params) => ({
        url: `/WeddiServices/V1/GetCasesAudit`,
        params,
      }),
    }),
    getCaseCount: builder.query<any, any>({
      query: ({ UserType, IDNumber, FileNumber, MainGovernment, SubGovernment, AcceptedLanguage, SourceSystem }) => ({
        url: `/WeddiServices/V1/GetCaseCount`,
        params: {
          UserType,
          IDNumber,
          ...(FileNumber && { FileNumber }),
          ...(MainGovernment && { MainGovernment }),
          ...(SubGovernment && { SubGovernment }),
          AcceptedLanguage,
          SourceSystem
        },
      }),
    }),
    getIncompleteCase: builder.query<any, any>({
      query: ({ UserType, IDNumber, FileNumber, MainGovernment, SubGovernment, AcceptedLanguage, SourceSystem }) => ({
        url: `/WeddiCreateCaseServices/V1/GetIncompleteCase`,
        params: {
          UserType,
          IDNumber,
          ...(FileNumber && { FileNumber }),
          ...(MainGovernment && { MainGovernment }),
          ...(SubGovernment && { SubGovernment }),
          AcceptedLanguage,
          SourceSystem
        },
      }),
    }),
    saveUINotification: builder.query({
      query: (data) => ({
        url: `/WeddiServices/V1/WeddiCaseUINotifications`,
        method: "POST",
        body: data,
      }),
    }),
    getMySchedules: builder.query({
      query: (params) => ({
        url: `/WeddiServices/V1/MySchedules`,
        params,
      }),
    }),
 
  }),
});
 
export const { useGetCaseAuditQuery,
  useLazySaveUINotificationQuery,
  useGetIncompleteCaseQuery,
  useLazyGetIncompleteCaseQuery,
  useGetMySchedulesQuery,
  useLazyGetMySchedulesQuery,
  useGetCaseCountQuery,
  useLazyGetCaseCountQuery
} = caseApi;