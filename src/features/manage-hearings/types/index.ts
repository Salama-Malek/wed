export type tableType="Plaintiff"|"Defendant"
export interface GetMyCasesRequest{ 
    userType: string; 
    IDNumber: string; 
    pageNumber: number; 
    FileNumber?:number;
    tableFor: tableType; 
    sourceSystem: string; 
    acceptedLanguage: string; 
    settlementID?: string; 
    caseID?: string; 
    fromDate?: string; 
    toDate?: string; 
    identityNumber?: string;
  }

  // <===========My Cases - Individual as Plaintiff=============>

  interface Case {
    CaseID: string;
    CreateDate: string;
    Reopen: string;
    CreateOperator: string;
    RejectReasonDetails: string;
    SettlementID: string;
    SessionTime: string;
    CaseDefendantName: string;
    DownloadPDF: string;
    SessionDayDate: string;
    ResendAppointment: string;
    WorkStatus: string;
    CancelCase: string;
    CasePlaintiffName: string;
    UpdateCase: string;
  }
  
 export interface Data {
    PlaintiffCases: Case[];
    SourceSystem: string;
  }

export type CaseType = {
    CaseID: string;
    CreateDate: string;
    CreateOperator: string;
    CaseDefendantName: string;
    WorkStatus: string;
    SessionDayDate: string;
    SessionTime: string;
    CasePlaintiffName: string;
    UpdateCase: string;
    CancelCase: string;
    ResendAppointment: string;
  };
  
   // <===========global error=============>

  export interface APIError {
    status: string; 
    originalStatus: number; 
    data?: string; 
    error?: string; 
  }
  