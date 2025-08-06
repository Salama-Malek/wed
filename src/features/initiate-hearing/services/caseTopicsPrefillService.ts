import { formatDateString, formatHijriDate } from "@/shared/lib/helpers";

export interface CaseTopicDateFields {
  from_date_hijri?: string;
  from_date_gregorian?: string;
  to_date_hijri?: string;
  to_date_gregorian?: string;
  date_hijri?: string;
  date_gregorian?: string;
  injury_date_hijri?: string;
  injury_date_gregorian?: string;
  managerial_decision_date_hijri?: string;
  managerial_decision_date_gregorian?: string;
  request_date_hijri?: string;
  request_date_gregorian?: string;
}

export interface CaseTopicData {
  MainTopicID?: string;
  SubTopicID?: string;
  MainSectionHeader?: string;
  CaseTopicName?: string;
  SubTopicName?: string;
  AcknowledgementTerms?: boolean;
  FromDateHijri?: string;
  FromDate_New?: string;
  ToDateHijri?: string;
  ToDate_New?: string;
  Date_New?: string;
  pyTempDate?: string;
  pyTempText?: string;
  InjuryDate_New?: string;
  ManDecsDate?: string;
  RequestDate_New?: string;
  ManagerialDecisionNumber?: string;
  Amount?: string | number;
  amount?: string | number;
  AmountOfCompensation?: string | number;
  amountOfCompensation?: string | number;
  CompensationAmount?: string | number;
  compensationAmount?: string | number;
  refundAmount?: string | number;
  wageAmount?: string | number;
  WagesAmount?: string | number;
  wagesAmount?: string | number;
  PayDue?: string | number;
  payDue?: string | number;
  DurationOfLeaveDue?: string;
  durationOfLeaveDue?: string;
  TypeOfWorkInjury?: string;
  injuryType?: string;
  Premium?: string | number;
  bonusAmount?: string | number;
  bonusProfitShareAmount?: string | number;
  OtherCommission?: string;
  otherCommission?: string;
  RewardType?: string;
  rewardType?: string;
  DamagedValue?: string | number;
  damagedValue?: string | number;
  RequiredJobTitle?: string;
  requiredJobTitle?: string;
  CurrentJobTitle?: string;
  currentJobTitle?: string;
  SpoilerType?: string;
  damagedType?: string;
  CurrentInsuranceLevel?: string;
  currentInsuranceLevel?: string;
  Reason?: string;
  theReason?: string;
  WantedJob?: string;
  theWantedJob?: string;
  CurrentPosition?: string;
  currentPosition?: string;
  LoanAmount?: string | number;
  loanAmount?: string | number;
  AmountRatio?: string | number;
  amountRatio?: string | number;
  RequestType?: string;
  RequestType_Code?: string;
  TypeOfRequest?: string;
  LeaveType?: string;
  KindOfHoliday?: string;
  CommissionType?: string;
  AccordingToAgreement?: string;
  ForAllowance?: string;
  TravelingWay?: string;
  OtherAllowance?: string;
  otherAllowance?: string;
  TypeOfCustody?: string;
  typeOfCustody?: string;
  Consideration?: string;
  consideration?: string;
  FromLocation?: string;
  fromLocation?: string;
  ToLocation?: string;
  toLocation?: string;
  FromLocation_Code?: string;
  ToLocation_Code?: string;
  TypesOfPenalties?: string;
  TypesOfPenaltiesLabel?: string;
  PenalityType?: string;
  PenalityType_Code?: string;
  PenalityTypeLabel?: string;
  RequiredDegreeInsurance?: string;
  requiredDegreeOfInsurance?: string;
  doesBylawsIncludeAddingAccommodations?: boolean;
  IsBylawsIncludeAddingAccommodiation?: string;
  doesContractIncludeAddingAccommodations?: boolean;
  IsContractIncludeAddingAccommodiation?: string;
  housingSpecificationInByLaws?: string;
  HousingSpecificationsInBylaws?: string;
  housingSpecificationsInContract?: string;
  HousingSpecificationsInContract?: string;
  actualHousingSpecifications?: string;
  HousingSpecifications?: string;
}

export class CaseTopicsPrefillService {
  /**
   * Extract date fields from case topic data based on topic type
   */
  static extractDateFields(topic: CaseTopicData): CaseTopicDateFields {
    if (!topic) {
      return {};
    }

    const dateFields: CaseTopicDateFields = {};
    switch (topic.SubTopicID) {
      case "WR-1":
      case "WR-2":
      case "CMR-6":
      case "CMR-7":
      case "CMR-8":
      case "BPSR-1":
        // From/To date range topics
        if (topic.FromDateHijri) {
          dateFields.from_date_hijri = formatHijriDate(topic.FromDateHijri);
        }
        if (topic.FromDate_New) {
          dateFields.from_date_gregorian = formatDateString(topic.FromDate_New);
        }
        if (topic.ToDateHijri) {
          dateFields.to_date_hijri = formatHijriDate(topic.ToDateHijri);
        }
        if (topic.ToDate_New) {
          dateFields.to_date_gregorian = formatDateString(topic.ToDate_New);
        }
        break;

      case "CMR-3":
        // Injury date topic
        if (topic.pyTempText) {
          dateFields.injury_date_hijri = formatHijriDate(topic.pyTempText);
        } else if (topic.Date_New) {
          dateFields.injury_date_hijri = formatHijriDate(topic.Date_New);
        }
        if (topic.InjuryDate_New) {
          dateFields.injury_date_gregorian = formatDateString(topic.InjuryDate_New);
        } else if (topic.Date_New) {
          dateFields.injury_date_gregorian = formatDateString(topic.Date_New);
        }
        break;

      case "EDO-1":
      case "EDO-2":
      case "EDO-3":
      case "EDO-4":
        // Managerial decision date topics

        if (topic.Date_New) {
          dateFields.managerial_decision_date_hijri = formatHijriDate(topic.Date_New);
        }
        if (topic.ManDecsDate) {
          dateFields.managerial_decision_date_gregorian = formatDateString(topic.ManDecsDate);
        }

        // Try alternative field names for EDO topics
        if ((topic as any).ManagerialDecisionDateHijri) {
          dateFields.managerial_decision_date_hijri = formatHijriDate((topic as any).ManagerialDecisionDateHijri);
        }
        if ((topic as any).ManagerialDecisionDateGregorian) {
          dateFields.managerial_decision_date_gregorian = formatDateString((topic as any).ManagerialDecisionDateGregorian);
        }
        break;

      case "RLRAHI-1":
        // Request date topic
        if (topic.RequestType === "RLRAHI1") {
          if (topic.Date_New) {
            dateFields.request_date_hijri = formatHijriDate(topic.Date_New);
          }
          if (topic.RequestDate_New) {
            dateFields.request_date_gregorian = formatDateString(topic.RequestDate_New);
          }
        } else {

        }
        break;

      case "RFR-1":
      case "BR-1":
        // Single date topics
        if (topic.pyTempDate) {
          dateFields.date_hijri = formatHijriDate(topic.pyTempDate);
        }
        if (topic.Date_New) {
          dateFields.date_gregorian = formatDateString(topic.Date_New);
        }
        break;
    }

    return dateFields;
  }

  /**
   * Extract all form fields from case topic data
   */
  static extractFormFields(topic: CaseTopicData): Record<string, any> {
    if (!topic) {
      return {};
    }

    const dateFields = this.extractDateFields(topic);

    const formFields = {
      // Main category and sub category
      mainCategory: {
        value: topic.MainTopicID || "",
        label: topic.CaseTopicName || topic.MainSectionHeader || "",
      },
      subCategory: {
        value: topic.SubTopicID || "",
        label: topic.SubTopicName || "",
      },
      acknowledged: Boolean(topic.AcknowledgementTerms),

      // Date fields
      ...dateFields,

      // Amount fields - Updated to use specific field names
      amount: topic.Amount || topic.amount || "", // Generic fallback
      refundAmount: topic.refundAmount || topic.Amount || topic.amount || "", // RUF-1
      compensationAmount: topic.CompensationAmount || topic.compensationAmount || topic.Amount || topic.amount || "", // CR-1
              wageAmount: topic.wageAmount || topic.Amount || topic.amount || "", // WR-1/WR-2
      noticeCompensationAmount: topic.Amount || topic.amount || "", // CMR-4
      endOfServiceRewardAmount: topic.Amount || topic.amount || "", // LRESR-1/2/3
      rewardAmount: topic.Amount || topic.amount || "", // RR-1
      rewardType: topic.RewardType || topic.rewardType || "", // RR-1
      rewardRequestAmount: topic.Amount || topic.amount || "", // RFR-1
      bonusProfitShareAmount: topic.bonusProfitShareAmount || topic.Amount || topic.amount || "", // BPSR-1
      amountOfCompensation: topic.AmountOfCompensation || topic.amountOfCompensation || "",
      wagesAmount: topic.WagesAmount || topic.wagesAmount || "",
      payDue: topic.PayDue || topic.payDue || "",
      durationOfLeaveDue: topic.DurationOfLeaveDue || topic.durationOfLeaveDue || "",
      injuryType: topic.TypeOfWorkInjury || topic.injuryType || "",
      bonusAmount: topic.Premium || topic.bonusAmount || "",
      otherCommission: topic.OtherCommission || topic.otherCommission || "",
      damagedValue: topic.DamagedValue || topic.damagedValue || "",
      requiredJobTitle: topic.RequiredJobTitle || topic.requiredJobTitle || "",
      currentJobTitle: topic.CurrentJobTitle || topic.currentJobTitle || "",
      damagedType: topic.SpoilerType || topic.damagedType || "",
      currentInsuranceLevel: topic.CurrentInsuranceLevel || topic.currentInsuranceLevel || "",
      theReason: topic.Reason || topic.theReason || "",
      requiredDegreeOfInsurance: topic.RequiredDegreeInsurance || topic.requiredDegreeOfInsurance || "",
      theWantedJob: topic.WantedJob || topic.theWantedJob || "",
      currentPosition: topic.CurrentPosition || topic.currentPosition || "",
      loanAmount: topic.LoanAmount || topic.loanAmount || "",
      amountRatio: topic.AmountRatio || topic.amountRatio || "",

      // HIR-1 (accommodation) fields
      doesBylawsIncludeAddingAccommodations:
        topic.doesBylawsIncludeAddingAccommodations !== undefined
          ? topic.doesBylawsIncludeAddingAccommodations
          : ["Yes", true].includes(topic.IsBylawsIncludeAddingAccommodiation ?? ""),
      doesContractIncludeAddingAccommodations:
        topic.doesContractIncludeAddingAccommodations !== undefined
          ? topic.doesContractIncludeAddingAccommodations
          : ["Yes", true].includes(topic.IsContractIncludeAddingAccommodiation ?? ""),
      housingSpecificationInByLaws:
        topic.housingSpecificationInByLaws !== undefined
          ? topic.housingSpecificationInByLaws
          : topic.HousingSpecificationsInBylaws || "",
      housingSpecificationsInContract:
        topic.housingSpecificationsInContract !== undefined
          ? topic.housingSpecificationsInContract
          : topic.HousingSpecificationsInContract || "",
      actualHousingSpecifications:
        topic.actualHousingSpecifications !== undefined
          ? topic.actualHousingSpecifications
          : topic.HousingSpecifications || "",

      // Select fields
      typeOfRequest: (topic.RequestType || topic.RequestType_Code || topic.TypeOfRequest) ? {
        value: topic.RequestType_Code || topic.RequestType || topic.TypeOfRequest,
        label: topic.RequestType || topic.TypeOfRequest || topic.RequestType_Code,
      } : null,

      kindOfHoliday: topic.KindOfHoliday ? {
        value: topic.LeaveType || topic.KindOfHoliday,
        label: topic.KindOfHoliday,
      } : null,

      commissionType: topic.CommissionType ? {
        value: topic.CommissionType,
        label: topic.CommissionType,
      } : null,

      accordingToAgreement: topic.AccordingToAgreement ? {
        value: topic.AccordingToAgreement,
        label: topic.AccordingToAgreement,
      } : null,

      forAllowance: topic.ForAllowance ? {
        value: topic.ForAllowance,
        label: topic.ForAllowance,
      } : null,

      travelingWay: topic.TravelingWay ? {
        value: topic.TravelingWay,
        label: topic.TravelingWay,
      } : null,

      typesOfPenalties: (topic.PenalityType || topic.PenalityType_Code || topic.TypesOfPenalties) ? {
        value: topic.PenalityType_Code || topic.PenalityType || topic.TypesOfPenalties,
        label: topic.PenalityTypeLabel || topic.TypesOfPenaltiesLabel || topic.PenalityType || topic.TypesOfPenalties,
      } : null,

      // Other fields
      otherAllowance: topic.OtherAllowance || topic.otherAllowance || "",
      typeOfCustody: topic.TypeOfCustody || topic.typeOfCustody || "",
      consideration: topic.Consideration || topic.consideration || "",
      managerialDecisionNumber: topic.ManagerialDecisionNumber || "",

      // Location fields
      fromLocation: (topic.FromLocation || topic.FromLocation_Code) ? {
        value: topic.FromLocation_Code || topic.FromLocation,
        label: topic.FromLocation || topic.FromLocation_Code,
      } : null,

      toLocation: (topic.ToLocation || topic.ToLocation_Code) ? {
        value: topic.ToLocation_Code || topic.ToLocation,
        label: topic.ToLocation || topic.ToLocation_Code,
      } : null,
    };

    return formFields;
  }

  /**
   * Prefill form with case topics data
   */
  static prefillForm(
    setValue: (name: string, value: any) => void,
    caseTopics: CaseTopicData[],
    isEditing: boolean = false
  ) {
    if (!isEditing || !caseTopics || caseTopics.length === 0) return;

    caseTopics.forEach((topic, index) => {
      const formFields = this.extractFormFields(topic);
      const topicPrefix = `topic_${index}`;

      // Set all form fields with topic prefix
      Object.entries(formFields).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          setValue(`${topicPrefix}_${key}`, value);
        }
      });
    });
  }
} 