import { Option } from "@/shared/components/form/form.types";
import { formatDateToYYYYMMDD } from "@/shared/utils/dateUtils";
import { isOtherCommission } from "../utils/isOtherCommission";
import { isOtherAllowance } from "../utils/isOtherAllowance";

export function getPayloadBySubTopicID(
  caseTopics: any[],
  subCategory?: Option,
  lastAction: "Save" | "Next" | null = "Next",
  caseId: string = "default caseId"
) {
  const structuredTopics: any[] = [];

  try {
    caseTopics.forEach((topic) => {
      let topicPayload: any = null;
      const subTopicCode = typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID);
      // Debug log for subTopicCode
      console.log('DEBUG: subTopicCode in establishment payload builder:', subTopicCode);
      switch (subTopicCode) {

        /***************************Establishment Topics***************************/
        case "CR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.compensationAmount || topic?.amount || topic.Amount, // Changed from "amount"
            CompensationReason: topic?.CompensationReason ?? "",
          };
          break;

        case "LCUTE-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            AmountOfCompensation: topic?.amountOfCompensation || topic?.AmountOfCompensation,
          };
          break;

        case "DPVR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            SpoilerType: topic?.damagedType || topic?.SpoilerType,
            DamagedValue: topic?.damagedValue || topic?.DamagedValue,
          };
          break;

        case "AWRW-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
          }
          break;

        case "AWRW-2":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
          };
          break;

        case "RLRAHI-1":
          if (topic?.typeOfRequest?.value === "RLRAHI2") {
            topicPayload = {
              MainTopicID: topic?.MainTopicID,
              SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
              RequestType: topic?.typeOfRequest?.value || topic.RequestType,
              LoanAmount: topic?.loanAmount || topic?.LoanAmount
            };
            break;

          } else {
            topicPayload = {
              MainTopicID: topic?.MainTopicID,
              SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
              TypeOfCustody: topic?.typeOfCustody || topic?.TypeOfCustody,
              Date_New: topic?.request_date_hijri || topic?.Date_New || topic?.RequestDateHijri,
              RequestDate_New: topic?.request_date_gregorian || topic?.RequestDate_New || topic?.RequestDateGregorian,
              RequestType: topic?.typeOfRequest?.value || topic.RequestType
            };
            break;
          }

        case "RUF-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            RefundType: topic?.RefundType ?? "",
            Amount: topic?.refundAmount || topic?.amount || topic?.Amount, // Changed from "amount"
          };
          break;

        /***************************Worker Topics***************************/
        /*************************** EDO Topics ***************************/

        case "EDO-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            MainSectionHeader: topic?.MainSectionHeader,
            SubTopicName: topic?.SubTopicName,
            CaseTopicName: topic?.CaseTopicName,
            AcknowledgementTerms: topic?.acknowledged ?? topic?.AcknowledgementTerms,
            RegulatoryText: topic?.regulatoryText ?? topic?.RegulatoryText,
            ManagerialDecisionNumber: topic?.managerialDecisionNumber || topic?.ManagerialDecisionNumber,
            FromLocation: topic?.fromLocation?.value || topic?.FromLocation_Code,
            ToLocation: topic?.toLocation?.value || topic?.ToLocation_Code,
            Date_New: formatDateToYYYYMMDD(topic?.managerial_decision_date_hijri || topic?.Date_New || topic?.ManagerialDecisionDateHijri),
            ManDecsDate: formatDateToYYYYMMDD(topic?.managerial_decision_date_gregorian || topic?.ManDecsDate || topic?.ManagerialDecisionDateGregorian),
          };
          break;
        case "EDO-2":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            MainSectionHeader: topic?.MainSectionHeader,
            SubTopicName: topic?.SubTopicName,
            CaseTopicName: topic?.CaseTopicName,
            AcknowledgementTerms: topic?.acknowledged ?? topic?.AcknowledgementTerms,
            RegulatoryText: topic?.regulatoryText ?? topic?.RegulatoryText,
            ManagerialDecisionNumber: topic?.managerialDecisionNumber || topic?.ManagerialDecisionNumber,
            FromJob: topic?.fromJob || topic?.FromJob,
            ToJob: topic?.toJob || topic?.ToJob,
            Date_New: formatDateToYYYYMMDD(topic?.managerial_decision_date_hijri || topic?.Date_New),
            ManDecsDate: formatDateToYYYYMMDD(topic?.managerial_decision_date_gregorian || topic?.ManDecsDate),
          };
          break;
        case "EDO-3":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            MainSectionHeader: topic?.MainSectionHeader,
            SubTopicName: topic?.SubTopicName,
            CaseTopicName: topic?.CaseTopicName,
            AcknowledgementTerms: topic?.acknowledged ?? topic?.AcknowledgementTerms,
            RegulatoryText: topic?.regulatoryText ?? topic?.RegulatoryText,
            ManagerialDecisionNumber: topic?.managerialDecisionNumber || topic?.ManagerialDecisionNumber,
            AmountOfReduction: topic?.amountOfReduction || topic?.AmountOfReduction,
            pyTempDate: formatDateToYYYYMMDD(topic?.managerial_decision_date_hijri || topic?.pyTempDate),
            ManagerialDecisionDate_New: formatDateToYYYYMMDD(topic?.managerial_decision_date_gregorian || topic?.ManagerialDecisionDate_New),
          };
          break;
        case "EDO-4":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            MainSectionHeader: topic?.MainSectionHeader,
            SubTopicName: topic?.SubTopicName,
            CaseTopicName: topic?.CaseTopicName,
            AcknowledgementTerms: topic?.acknowledged ?? topic?.AcknowledgementTerms,
            RegulatoryText: topic?.regulatoryText ?? topic?.RegulatoryText,
            ManagerialDecisionNumber: topic?.managerialDecisionNumber || topic?.ManagerialDecisionNumber,
            PenalityType: topic?.typesOfPenalties?.value || topic?.TypesOfPenalties || topic?.PenalityType,
            PenalityTypeLabel: topic?.typesOfPenalties?.label || topic?.TypesOfPenaltiesLabel || topic?.PenalityTypeLabel,
            Date_New: formatDateToYYYYMMDD(topic?.managerial_decision_date_hijri || topic?.Date_New),
            ManDecsDate: formatDateToYYYYMMDD(topic?.managerial_decision_date_gregorian || topic?.ManDecsDate),
          };
          break;
        /*************************** END EDO Topics ***************************/

        /*************************** LCUT Topics ***************************/
        case "LCUT-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            AmountOfCompensation: topic?.amountOfCompensation || topic?.AmountOfCompensation,
          };
          break;
        /*************************** END LCUT Topics ***************************/

        /*************************** WR Topics ***************************/
        case "WR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.wageAmount || topic?.amount || topic?.Amount, // Changed from "amount"
            pyTempDate: formatDateToYYYYMMDD(topic?.from_date_hijri || topic?.pyTempDate),
            FromDate_New: formatDateToYYYYMMDD(topic?.from_date_gregorian || topic?.FromDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.to_date_hijri || topic?.Date_New),
            ToDate_New: formatDateToYYYYMMDD(topic?.to_date_gregorian || topic?.ToDate_New),
            ForAllowance: topic?.forAllowance?.value || topic?.ForAllowance,
            ForAllowance_Code: topic?.forAllowance?.value || topic?.ForAllowance_Code,
            OtherAllowance: (() => {
              // Handle both form object and API string cases
              const forAllowance = topic?.forAllowance;
              const isOther = forAllowance && (
                // If it's an object (from form)
                (forAllowance.value && ["FA11", "OTHER", "3"].includes(String(forAllowance.value))) ||
                (forAllowance.label && forAllowance.label.toLowerCase().includes("other")) ||
                // If it's a string (from API response)
                (typeof forAllowance === "string" && forAllowance.toLowerCase().includes("other"))
              );
              console.log(`[🔍 API PAYLOAD] WR-1 Debug - forAllowance:`, forAllowance);
              console.log(`[🔍 API PAYLOAD] WR-1 Debug - isOther:`, isOther);
              console.log(`[🔍 API PAYLOAD] WR-1 Debug - topic.otherAllowance:`, topic?.otherAllowance);
              console.log(`[🔍 API PAYLOAD] WR-1 Debug - topic.OtherAllowance:`, topic?.OtherAllowance);
              const result = isOther ? (topic?.otherAllowance || topic?.OtherAllowance || "") : "";
              console.log(`[🔍 API PAYLOAD] WR-1 Debug - final OtherAllowance:`, result);
              return result;
            })(),
          };
          break;

        case "WR-2":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            OverdueWagesAmount: topic?.wageAmount || topic?.amount || topic?.OverdueWagesAmount, // Changed from "amount"
            pyTempDate: formatDateToYYYYMMDD(topic?.from_date_hijri || topic?.pyTempDate),
            FromDate_New: formatDateToYYYYMMDD(topic?.from_date_gregorian || topic?.FromDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.to_date_hijri || topic?.Date_New),
            ToDate_New: formatDateToYYYYMMDD(topic?.to_date_gregorian || topic?.ToDate_New),
          };
          break;

        /***************************END WR Topics ***************************/

        /*************************** BR Topics ***************************/
        case "BR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            AccordingToAgreement: topic?.accordingToAgreement?.value || topic?.AccordingToAgreement,
            AccordingToAgreement_Code: topic?.accordingToAgreement?.value || topic?.AccordingToAgreement_Code,
            Premium: topic?.bonusAmount || topic?.BonusAmount || topic?.Amount || topic?.Premium || "",
            pyTempDate: formatDateToYYYYMMDD(topic?.date_hijri || topic?.pyTempDate),
            Date_New: formatDateToYYYYMMDD(topic?.date_gregorian || topic?.Date_New),
          };
          break;
        /***************************END BR Topics ***************************/

        /*************************** HIR Topics ***************************/

        case "HIR-1": {
          const {
            doesBylawsIncludeAddingAccommodations,
            doesContractIncludeAddingAccommodations,
            housingSpecificationsInContract,
            housingSpecificationInByLaws,
            actualHousingSpecifications,
          } = topic || {};

          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            ...(doesBylawsIncludeAddingAccommodations && {
              IsBylawsIncludeAddingAccommodiation: "Yes",
              IsContractIncludeAddingAccommodiation: "No",
              HousingSpecificationsInBylaws: housingSpecificationInByLaws || topic?.HousingSpecificationsInBylaws,
            }),
            ...(doesContractIncludeAddingAccommodations && {
              IsContractIncludeAddingAccommodiation: "Yes",
              IsBylawsIncludeAddingAccommodiation: "No",
              HousingSpecificationsInContract: housingSpecificationsInContract || topic?.HousingSpecificationsInContract,
              HousingSpecifications: actualHousingSpecifications || topic?.HousingSpecifications,
            }),
          };
          break;
        }

        /***************************END HIR Topics ***************************/

        /*************************** MIR Topics ***************************/

        case "MIR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            RequestType: topic?.typeOfRequest?.value || topic?.RequestType,
            Reason: topic?.theReason || topic?.Reason,
            CurrentInsuranceLevel: topic?.currentInsuranceLevel || topic?.CurrentInsuranceLevel,
            RequiredDegreeInsurance: topic?.requiredDegreeOfInsurance || topic?.RequiredDegreeInsurance,
          };
          break;
        /***************************END MIR Topics ***************************/

        /*************************** TTR Topics ***************************/
        case "TTR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            TravelingWay: topic?.travelingWay.value || topic?.TravelingWay,
          };
          break;


        /***************************END TTR Topics ***************************/

        /*************************** CMR Topics ***************************/
        case "CMR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            AmountsPaidFor: topic?.amountsPaidFor.value || topic.AmountsPaidFor,
            AmountRequired: topic?.theAmountRequired || topic?.AmountRequired,
          };
          break;

        case "CMR-3":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.compensationAmount || topic?.Amount,
            pyTempText: topic?.injury_date_hijri || topic?.pyTempText || "",
            InjuryDate_New: topic?.injury_date_gregorian || topic?.InjuryDate_New || "",
            TypeOfWorkInjury: topic?.injuryType || topic?.TypeOfWorkInjury || "",
          };
          break;

        case "CMR-4":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.noticeCompensationAmount || topic?.amount || topic?.Amount, // Changed from "amount"
          };
          break;

        case "CMR-5":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            LeaveType: topic?.kindOfHoliday?.value || topic?.LeaveType_Code || "",
            TotalAmountRequired: topic?.totalAmount || topic?.TotalAmountRequired,
            WorkingHoursCount: topic?.workingHours || topic?.WorkingHoursCount,
            AdditionalDetails: topic?.additionalDetails || topic?.AdditionalDetails,
          };
          break;

        case "CMR-6":
          console.log("[🔍 PAYLOAD DEBUG] CMR-6 topic data:", topic);
          console.log("[🔍 PAYLOAD DEBUG] CMR-6 date fields:", {
            from_date_hijri: topic?.from_date_hijri,
            from_date_gregorian: topic?.from_date_gregorian,
            to_date_hijri: topic?.to_date_hijri,
            to_date_gregorian: topic?.to_date_gregorian,
            pyTempDate: topic?.pyTempDate,
            FromDate_New: topic?.FromDate_New,
            Date_New: topic?.Date_New,
            ToDate_New: topic?.ToDate_New
          });
          const pyTempDate = formatDateToYYYYMMDD(topic?.from_date_hijri || topic?.pyTempDate);
          const FromDate_New = formatDateToYYYYMMDD(topic?.from_date_gregorian || topic?.FromDate_New);
          const Date_New = formatDateToYYYYMMDD(topic?.to_date_hijri || topic?.Date_New);
          const ToDate_New = formatDateToYYYYMMDD(topic?.to_date_gregorian || topic?.ToDate_New);
          console.log("[🔍 PAYLOAD DEBUG] CMR-6 formatted dates:", {
            pyTempDate,
            FromDate_New,
            Date_New,
            ToDate_New
          });
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            pyTempDate,
            FromDate_New,
            Date_New,
            ToDate_New,
            NewPayAmount: topic?.newPayAmount || topic?.NewPayAmount,
            PayIncreaseType: topic?.payIncreaseType?.value || topic?.PayIncreaseType_Code || topic?.PayIncreaseType,
            WageDifference: topic?.wageDifference || topic?.WageDifference,
          };
          break;
        case "CMR-7":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            pyTempDate: formatDateToYYYYMMDD(topic?.from_date_hijri || topic?.pyTempDate),
            ToDate_New: formatDateToYYYYMMDD(topic?.from_date_gregorian || topic?.ToDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.to_date_hijri || topic?.Date_New),
            FromDate_New: formatDateToYYYYMMDD(topic?.to_date_gregorian || topic?.FromDate_New),
            DurationOfLeaveDue: topic?.durationOfLeaveDue || topic?.DurationOfLeaveDue,
            PayDue: topic?.payDue || topic?.PayDue,
          };
          break;

        case "CMR-8":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            pyTempDate: formatDateToYYYYMMDD(topic?.from_date_hijri || topic?.pyTempDate),
            ToDate_New: formatDateToYYYYMMDD(topic?.from_date_gregorian || topic?.ToDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.to_date_hijri || topic?.Date_New),
            FromDate_New: formatDateToYYYYMMDD(topic?.to_date_gregorian || topic?.FromDate_New),
            WagesAmount: topic?.wagesAmount || topic?.WagesAmount,
          };
          break;

        /***************************END CMR Topics ***************************/

        /*************************** BR Topics ***************************/
        case "BR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            AccordingToAgreement: topic?.accordingToAgreement?.value || topic?.AccordingToAgreement,
            Premium: topic?.bonusAmount || topic?.Premium,
            pyTempDate: formatDateToYYYYMMDD(topic?.date_hijri || topic?.pyTempDate),
            Date_New: formatDateToYYYYMMDD(topic?.date_gregorian || topic?.Date_New),
          };
          break;

        /***************************END BR Topics ***************************/

        /*************************** BPSR Topics ***************************/
        case "BPSR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.bonusProfitShareAmount || topic?.amount || topic?.Amount, // Changed from "amount"
            AmountRatio: topic?.amountRatio || topic?.AmountRatio,
            pyTempDate: formatDateToYYYYMMDD(topic?.from_date_hijri || topic?.pyTempDate),
            ToDate_New: formatDateToYYYYMMDD(topic?.to_date_gregorian || topic?.ToDate_New),
            Date_New: formatDateToYYYYMMDD(topic?.to_date_hijri || topic?.Date_New),
            FromDate_New: formatDateToYYYYMMDD(topic?.from_date_gregorian || topic?.FromDate_New),
            CommissionType: topic?.commissionType?.value || topic?.CommissionType,
            AccordingToAgreement: topic?.accordingToAgreement?.value || topic?.AccordingToAgreement,
            OtherCommission: isOtherCommission(topic?.commissionType) ? (topic?.otherCommission || topic?.OtherCommission) : "",
          };
          break;

        /***************************END BPSR Topics ***************************/

        /*************************** DR Topics ***************************/
        case "DR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
          };
          break;

        /***************************END DR Topics ***************************/
        /*************************** RR Topics ***************************/
        case "RR-1":

          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.rewardAmount || topic?.amount || topic?.Amount, // Changed from "amount"
            Type: topic?.rewardType || topic?.RewardType || topic?.Type,
          };
          break;

        /***************************END RR Topics ***************************/

        /*************************** JAR Topics ***************************/
        case "JAR-2":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            CurrentJobTitle: topic?.currentJobTitle || topic?.CurrentJobTitle,
            RequiredJobTitle: topic?.requiredJobTitle || topic?.RequiredJobTitle,
          };
          break;

        case "JAR-3":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            PromotionMechanism:
              topic?.doesTheInternalRegulationIncludePromotionMechanism === true ? "Yes" : "No",
            AdditionalUpgrade:
              topic?.doesContractIncludeAdditionalUpgrade === true ? "Yes" : "No",
          };
          break;

        case "JAR-4":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            CurrentPosition: topic?.currentPosition || topic?.CurrentPosition,
            WantedJob: topic?.theWantedJob || topic?.WantedJob,
          };
          break;

        /***************************END JAR Topics ***************************/
        /*************************** RFR Topics ***************************/
        case "RFR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.rewardRequestAmount || topic?.amount || topic?.Amount, // Changed from "amount"
            Consideration: topic?.consideration || topic?.Consideration,
            pyTempDate: formatDateToYYYYMMDD(topic?.date_hijri || topic?.pyTempDate || topic?.DateHijri),
            Date_New: formatDateToYYYYMMDD(topic?.date_gregorian || topic?.Date_New || topic?.DateGregorian),
          };
          break;

        /***************************END RFR Topics ***************************/

        /*************************** LRESR Topics ***************************/
        case "LRESR-1":
          topicPayload = {
            MainTopicID: topic?.MainTopicID,
            SubTopicID: typeof topic?.SubTopicID === 'object' ? topic?.SubTopicID?.value : (typeof topic?.subCategory === 'object' ? topic?.subCategory?.value : topic?.SubTopicID),
            Amount: topic?.endOfServiceRewardAmount || topic?.amount || topic?.Amount, // Changed from "amount"
          };
          break;

        /***************************END LRESR Topics ***************************/

        default:
          console.warn(`Unhandled subtopic code in payload builder: ${subTopicCode}`);
          break;
      }

      if (topicPayload) {
        structuredTopics.push(topicPayload);
      }
    });
  } catch (err) {
    console.error("Loop failed:", err);
  }

  const payload = {
    CaseID: caseId,
    Flow_CurrentScreen: "CaseTopics",
    Flow_ButtonName: lastAction,
    CaseTopics: structuredTopics,
    AcceptedLanguage: "EN",
  };

  return payload;
}
