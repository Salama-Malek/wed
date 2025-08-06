import { api } from "@/config/api";

export const hearingActionsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    resendAppointment: builder.mutation<unknown, { CaseID: string; AcceptedLanguage: string; SourceSystem: string; PartyType: "Plaintiff" | "Defendant" }>({
      query: ({ CaseID, AcceptedLanguage, SourceSystem, PartyType }) => ({
        url: `/WeddiServices/V1/SendAppointment`,
        method: "POST",
        body: {
          AcceptedLanguage,
          SourceSystem,
          CaseID,
          PartyType,
        },
      }),
    }),

    reopenCase: builder.mutation<unknown, { CaseID: string; AcceptedLanguage: string; SourceSystem: string; ReopenComments: string }>({
      query: (body) => ({
        url: `/WeddiServices/V1/WeddiReopenCase`,
        method: "POST",
        body,
      }),
    }),
    
    resolveCase: builder.mutation<unknown, { CaseID: string; AcceptedLanguage: string; SourceSystem: string; ResolveStatus: string }>({
      query: (body) => ({
        url: `/WeddiServices/V1/ResolveCase`,
        method: "POST",
        body,
      }),
    }),

    updateCaseTopics: builder.mutation<unknown, { CaseID: string; AcceptedLanguage: string; SourceSystem: string; CaseTopics: any[] }>({
      query: (body) => ({
        url: `/WeddiServices/V1/UpdateCaseTopics`,
        method: "POST",
        body,
      }),
    }),

//     generatePDF: builder.query<Blob, { CaseID: string; AcceptedLanguage: string; SourceSystem: string; PDFAction: "GenerateLawSuit" | "Download" }>({
//       query: ({ CaseID, AcceptedLanguage, SourceSystem, PDFAction }) => ({
//         url: `/WeddiServices/V1/pdfActions`,
//         method: "POST",
//         params: {
//           AcceptedLanguage,
//           SourceSystem,
//           CaseID,
//           PDFAction,
//         },
//         // responseHandler: (response: any) => response.blob(),
//       }),
//     }),
//   }),
// });

  newGeneratePDFV2: builder.query<Blob,
      {
        CaseID: string;
        AcceptedLanguage: string;
        SourceSystem: string;
        PDFAction: "GenerateLawSuit" | "Download"
        IDNumber: string;
        UserType: string;
      }>({
        query: ({ CaseID, AcceptedLanguage, SourceSystem, PDFAction, IDNumber, UserType }) => ({
          url: `/WeddiServices/V1/pdfActions`,
          method: "POST",
          body: {
            AcceptedLanguage,
            SourceSystem,
            CaseID,
            PDFAction,
            IDNumber,
          },
        }),
      }),
  }),
});
 
export const {
  useResendAppointmentMutation,
  useReopenCaseMutation,
  useResolveCaseMutation,
  useUpdateCaseTopicsMutation,
  //  useLazyGeneratePDFQuery,
  useLazyNewGeneratePDFV2Query
} = hearingActionsApi;