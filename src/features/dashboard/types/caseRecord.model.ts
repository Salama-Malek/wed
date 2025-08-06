export interface ICaseRecord {
  PaginationInfo: {
    PageSize: string;
    CurrentPageResultCount: string;
    TotalPagesCount: string;
    CurrentPageNumber: string;
    TotalResultCount: string;
  };
  PlaintiffCases: IPlaintiffCases[];
  ServiceStatus: string;
  SuccessCode: string;
  SourceSystem: string;
}

export interface IPlaintiffCases {
  SettlementID: string;
  WorkStatus_Code: string;
  CaseStatusAudit: ICaseStatusAudit[];
  WorkStatus: string;
  CaseID: string;
  CreateDate: string;
}

export interface ICaseStatusAudit {
  WorkStatus_Code: string;
  OfficerName: string;
  StatusChangeDate: string;
  WorkStatus: string;
}
