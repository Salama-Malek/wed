export type Topic = {
    mainCategory: string;
    subCategory: string;
    acknowledged: boolean;
    fromPlace?: string;
    toPlace?: string;
    hijriDate?: string;
    gregorianDate?: string;
    decisionNumber?: string;
  };
  
  export type TopicFormValues = {
    mainCategory: { value: string; label: string } | null;
    subCategory: { value: string; label: string } | null;
    acknowledged: boolean;
    fromPlace?: { value: string; label: string } | null;
    toPlace?: { value: string; label: string } | null;
    hijriDate?: string;
    gregorianDate?: string;
    decisionNumber?: string;
    managerial_decision_date_hijri?: string;
    managerial_decision_date_gregorian?: string;
    managerialDecisionNumber?: string;
    commissionType?: { value: string; label: string } | null;
  };