import { api } from "@/config/api";

export type UserType = "Worker" | "Establishment" | "Legal representative" | "Agent" | "Embassy User";
export type TableForType = "Plaintiff" | "Defendant";
 
export interface GetMyCasesRequest {
  UserType: UserType;
  IDNumber: string;
  PageNumber: number;
  TableFor: TableForType;
  CaseStatus?: string;
  AcceptedLanguage?: string;
  SourceSystem?: string;
  FileNumber?: string;
  SearchID: string;
  Number700?: string;
  MainGovernment?: string;
  SubGovernment?: string;
}
 
export interface GetCaseDetailsRequest {
  CaseID: string;
  AcceptedLanguage?: string;
  SourceSystem?: string;
  IDNumber: string;
  UserType: UserType;
  FileNumber:string,
  MainGovernment:string,
  SubGovernment:string,
}
 
export const myCasesApi = api.injectEndpoints({
  overrideExisting: true,  // ⬅️ allow redefinition of endpoints
  endpoints: (builder) => ({
    getMyCases: builder.query<any, GetMyCasesRequest>({
      query: ({
        UserType,
        IDNumber,
        PageNumber,
        TableFor,
        CaseStatus,
        FileNumber,
        MainGovernment,
        SubGovernment,
        SearchID,
        Number700,
        // Number700,
        AcceptedLanguage,
        SourceSystem = "E-Services",
      }) => {
        const params: Record<string, any> = {
          UserType,
          IDNumber,
          PageNumber,
          TableFor,
          CaseStatus,
          SearchID,
          AcceptedLanguage,
          SourceSystem,
        };

        if (Number700) {
          params.Number700 = Number700;
        }

 
 
        if (UserType === "Establishment" && FileNumber) {
          params.FileNumber = FileNumber;
        }
 
        if (
          UserType === "Legal representative" &&
          MainGovernment &&
          SubGovernment
        ) {
          params.MainGovernment = MainGovernment;
          params.SubGovernment = SubGovernment;
        }
 
        return { url: "/WeddiServices/V1/MyCases", params };
      },
    }),
 
    getCaseDetails: builder.query<any, GetCaseDetailsRequest>({
      query: ({
        CaseID,
        AcceptedLanguage = "EN",
        SourceSystem = "E-Services",
        IDNumber,
        UserType,
        FileNumber,
        MainGovernment,
        SubGovernment,
      }) => {
        const params: Record<string, any> = {
          UserType,
          CaseID,
          IDNumber,
          FileNumber,
          MainGovernment,
          SubGovernment,
          AcceptedLanguage,
          SourceSystem,
        };
 
 
 
        if (UserType === "Establishment" && FileNumber) {
          params.FileNumber = FileNumber;
        }
 
        if (
          UserType === "Legal representative" &&
          MainGovernment &&
          SubGovernment
        ) {
          params.MainGovernment = MainGovernment;
          params.SubGovernment = SubGovernment;
        }
       
        params.CaseID = CaseID;
 
        return { url: "/WeddiServices/V1/GetCaseDetails", params };
        // return {
        //   url: "/WeddiServices/V1/GetCaseDetails",
        //   params: { CaseID, AcceptedLanguage, SourceSystem, IDNumber, UserType },
        // }
      }
      ,
    }),
  }),
});
 
// Updated Exports
export const { useGetMyCasesQuery, useGetCaseDetailsQuery, useLazyGetCaseDetailsQuery } = myCasesApi;
 