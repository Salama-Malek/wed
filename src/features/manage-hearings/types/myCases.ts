export type CaseRecord = {
  LegalRepName?: string;
  CaseID: string;
  CreateDate: string;
  CaseDefendantName?: string;
  CasePlaintiffName?: string;
  WorkStatus: string;
  WorkStatus_Code: string;
  SessionTime?: string;
  SessionDayDate?: string;
  SettlementID?: string;
  Number700?: string;
  DownloadPDF?: string;
  ResendAppointment?: string;
  CancelCase?: string;
  UpdateCase?: string;
  Reopen?: string;
  CreateOperator?: string;
  RejectReasonDetails?: string;
};


  export type PaginationInfo = {
    PageSize: string;
    CurrentPageResultCount: string;
    TotalPagesCount: string;
    CurrentPageNumber: string;
    TotalResultCount: string;
  };
  
  export interface PlaintiffCasesResponse {
    PaginationInfo: PaginationInfo;
    PlaintiffCases: CaseRecord[];
    SourceSystem: string;
  }
  
  export interface DefendantCasesResponse {
    PaginationInfo: PaginationInfo;
    DefendantCases: CaseRecord[];
    SourceSystem: string;
  }
  