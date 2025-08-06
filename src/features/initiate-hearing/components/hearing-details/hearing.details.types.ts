  export interface NICDetailsParams {
    IDNumber: string;
    DateOfBirth: string | Date;
    AcceptedLanguage: string;
    SourceSystem: string;
  }
  
  export type ClaimantStatus = 'principal' | 'representative' | string; 



export type PlaintiffType = "Self(Worker)" | "Agent";

export interface ClaimantTypeMapping {
  ApplicantType: string;
  PlaintiffType: PlaintiffType;
}

export const CLAIMANT_TYPE_MAPPING: Record<ClaimantStatus, ClaimantTypeMapping> = {
  principal: {
    ApplicantType: "Worker",
    PlaintiffType: "Self(Worker)",
  },
  representative: {
    ApplicantType: "Worker",
    PlaintiffType: "Agent",
  },
};


