import {
    claimantColumns,
    defendantColumns,
    Hearing,
  } from "./columns";
  
  import {
    individualClaimantHearings,
    individualDefendantHearings,
  } from "./individualData";
  
  import {
    establishmentClaimantHearings,
    establishmentDefendantHearings,
  } from "./establishmentData";
  
  import {
    governmentClaimantHearings,
    governmentDefendantHearings,
  } from "./governmentData";
  
  export function getHearingDataAndColumns(caseType: string, role: string) {
    let data: Hearing[] = [];
    let columns = claimantColumns;
  
    if (caseType === "individual" && role === "claimant") {
      data = individualClaimantHearings;
      columns = claimantColumns;
    } else if (caseType === "individual" && role === "defendant") {
      data = individualDefendantHearings;
      columns = defendantColumns;
    } else if (caseType === "establishment" && role === "claimant") {
      data = establishmentClaimantHearings;
      columns = claimantColumns;
    } else if (caseType === "establishment" && role === "defendant") {
      data = establishmentDefendantHearings;
      columns = defendantColumns;
    } else if (caseType === "government" && role === "claimant") {
      data = governmentClaimantHearings;
      columns = claimantColumns;
    } else if (caseType === "government" && role === "defendant") {
      data = governmentDefendantHearings;
      columns = defendantColumns;
    }
  
    return { data, columns };
  }
  