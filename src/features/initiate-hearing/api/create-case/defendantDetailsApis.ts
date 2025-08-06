import { api } from "@/config/api";
// interface ExtractEstablishmentParams {
//   WorkerId: string,
//   AcceptedLanguage: string,
//   SourceSystem: string,
//   FileNumber?: string
// }

export const caseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    GetExtractedEstablishmentData: builder.query<any, any>({
      query: ({ WorkerId, AcceptedLanguage, SourceSystem, FileNumber, UserType, CaseID }) => ({
        url: `/WeddiServices/V1/ExtractEstabData`,
        params: {
          WorkerID: WorkerId,
          AcceptedLanguage: AcceptedLanguage,
          SourceSystem: SourceSystem,
          FileNumber: FileNumber,
          UserType: UserType,
          CaseID: CaseID
        }
      }),
    }),
    GetEstablishmentDetails: builder.query<any, any>({
      query: ({ AcceptedLanguage, SourceSystem, FileNumber, CRNumber }) => {
        const params: Record<string, any> = {
          AcceptedLanguage: AcceptedLanguage,
          SourceSystem: SourceSystem
        };

        // Add FileNumber if provided
        if (FileNumber) {
          params.FileNumber = FileNumber;
        }

        // Add CRNumber if provided
        if (CRNumber) {
          params.CRNumber = CRNumber;
        }

        return {
          url: `/WeddiServices/V1/GetEstablishmentData`,
          params
        };
      },
    }),
    GetGovernmentLookupData: builder.query<any, any>({
      query: ({ AcceptedLanguage, SourceSystem }) => ({
        url: `/WeddiServices/V1/MainLookUp`,
        params: {
          LookupType: "CaseElements",
          ModuleKey: "GovernmentName",
          ModuleName: "GovernmentName",
          AcceptedLanguage: AcceptedLanguage,
          SourceSystem: SourceSystem
        }
      }),
    }),
    GetSubGovernmentLookupData: builder.query<any, any>({
      query: ({ AcceptedLanguage, SourceSystem, mainGovernmentSelected }) => ({
        url: `/WeddiServices/V1/SubLookup`,
        params: {
          LookupType: "CaseElements",
          ModuleKey: (typeof mainGovernmentSelected === "object" ? mainGovernmentSelected?.value : mainGovernmentSelected) || "",
          ModuleName: "SubgovernmentName",
          AcceptedLanguage: AcceptedLanguage,
          SourceSystem: SourceSystem
        }
      }),
    }),
  }),
});

export const {
  useGetExtractedEstablishmentDataQuery,
  useGetGovernmentLookupDataQuery,
  useGetSubGovernmentLookupDataQuery,
  useGetEstablishmentDetailsQuery,
  useLazyGetEstablishmentDetailsQuery,

} = caseApi;
