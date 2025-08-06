import { useCallback, useRef } from 'react';
import { UseFormSetValue, UseFormTrigger } from 'react-hook-form';
import { Option } from '@/shared/components/form/form.types';
import { isOtherAllowance } from '../utils/isOtherAllowance';
import { isOtherCommission } from '../utils/isOtherCommission';
import { ensureOption } from '../edit-index';

interface UseSubTopicPrefillProps {
  setValue: UseFormSetValue<any>;
  trigger: UseFormTrigger<any>;
  isEditing: boolean;
  editTopic: any;
  lookupData: {
    commissionTypeLookupData?: any;
    accordingToAgreementLookupData?: any;
    typeOfRequestLookupData?: any;
    forAllowanceData?: any;
    regionData?: any;
    leaveTypeData?: any;
    payIncreaseTypeData?: any;
    amountPaidData?: any;
    travelingWayData?: any;
    typesOfPenaltiesData?: any;
    typeOfCustodyData?: any;
  };
}

export const useSubTopicPrefill = ({
  setValue,
  trigger,
  isEditing,
  editTopic,
  lookupData
}: UseSubTopicPrefillProps) => {

  // Ref to track if prefill has been done for the current topic
  const prefillDoneRef = useRef<string | null>(null);

  // Helper function to set value without triggering validation (to avoid infinite loops)
  const setValueOnly = (field: string, value: any, options?: any) => {
    console.log(`[🔧 SETVALUE] Setting ${field}:`, value);
    setValue(field, value, options);
  };

  // ==================== WORKER SUBTOPICS ====================

  // WR-1: Worker Rights - Salary Payment
  const prefillWR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'WR-1') return;

    console.log('[🔄 WR-1] Starting prefill for WR-1');

    // Set forAllowance
    const forAllowanceValue = editTopic.forAllowance?.value || editTopic.ForAllowance_Code || editTopic.ForAllowance;
    const forAllowanceLabel = editTopic.forAllowance?.label || editTopic.ForAllowance;
    if (forAllowanceValue && forAllowanceLabel) {
      const forAllowanceOption = { value: forAllowanceValue, label: forAllowanceLabel };
      setValueOnly('forAllowance', forAllowanceOption);
      console.log('[🔄 WR-1] Set forAllowance:', forAllowanceOption);
    }

    // Set otherAllowance if it exists in the data
    const otherAllowanceValue = editTopic.otherAllowance || editTopic.OtherAllowance;
    console.log('[🔄 WR-1] otherAllowanceValue from editTopic:', otherAllowanceValue);
    if (otherAllowanceValue) {
      setValueOnly('otherAllowance', otherAllowanceValue);
      console.log('[🔄 WR-1] Set otherAllowance:', otherAllowanceValue);
    } else {
      console.log('[🔄 WR-1] No otherAllowance value found in editTopic');
    }

    // Set date fields - use correct field names from handleUpdate
    setValueOnly('from_date_hijri', editTopic.FromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('from_date_gregorian', editTopic.FromDateGregorian || editTopic.from_date_gregorian || editTopic.FromDate_New || '');
    setValueOnly('to_date_hijri', editTopic.ToDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('to_date_gregorian', editTopic.ToDateGregorian || editTopic.to_date_gregorian || editTopic.ToDate_New || '');
    setValueOnly('wageAmount', editTopic.wageAmount || editTopic.amount || editTopic.Amount || '');

    console.log('[🔄 WR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // WR-2: Worker Rights - Overdue Wages
  const prefillWR2 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'WR-2') return;

    console.log('[🔄 WR-2] Starting prefill for WR-2');

    setValueOnly('wageAmount', editTopic.wageAmount || editTopic.amount || editTopic.Amount || editTopic.OverdueWagesAmount || '');
    setValueOnly('from_date_hijri', editTopic.FromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('from_date_gregorian', editTopic.FromDateGregorian || editTopic.from_date_gregorian || editTopic.FromDate_New || '');
    setValueOnly('to_date_hijri', editTopic.ToDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('to_date_gregorian', editTopic.ToDateGregorian || editTopic.to_date_gregorian || editTopic.ToDate_New || '');

    console.log('[🔄 WR-2] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // BPSR-1: Bonus and Profit Share Request
  const prefillBPSR1 = useCallback(() => {
    console.log('[🔍 BPSR-1 DEBUG] prefillBPSR1 called with:', {
      isEditing,
      editTopicSubTopicID: editTopic?.SubTopicID,
      editTopicExists: !!editTopic
    });

    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'BPSR-1') {
      console.log('[🔍 BPSR-1 DEBUG] Early return - isEditing:', isEditing, 'editTopic exists:', !!editTopic, 'SubTopicID matches:', editTopic?.SubTopicID === 'BPSR-1');
      return;
    }

    console.log('[🔄 BPSR-1] Starting prefill for BPSR-1');

    // Set commissionType
    const commissionCode = editTopic.CommissionType_Code || editTopic.commissionType?.value || editTopic.CommissionType;
    const commissionOption = ensureOption(
      lookupData.commissionTypeLookupData?.DataElements,
      commissionCode,
      editTopic.CommissionTypeLabel || editTopic.CommissionType
    );
    setValueOnly('commissionType', commissionOption);

    // Set accordingToAgreement
    const agrCode = editTopic.AccordingToAgreement_Code || editTopic.accordingToAgreement?.value || editTopic.AccordingToAgreement;
    const agrOption = ensureOption(lookupData.accordingToAgreementLookupData?.DataElements, agrCode);
    setValueOnly('accordingToAgreement', agrOption);

    // Set other fields
    setValueOnly('bonusProfitShareAmount', String(editTopic.bonusProfitShareAmount || editTopic.Amount || editTopic.amount || ''));
    setValueOnly('amountRatio', String(editTopic.amountRatio || editTopic.AmountRatio || ''));
    setValueOnly('from_date_hijri', editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('from_date_gregorian', editTopic.from_date_gregorian || editTopic.FromDate_New || '');
    setValueOnly('to_date_hijri', editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('to_date_gregorian', editTopic.to_date_gregorian || editTopic.ToDate_New || '');
    setValueOnly('otherCommission', String(editTopic.otherCommission || editTopic.OtherCommission || ''));

    console.log('[🔄 BPSR-1] Date fields prefill:', {
      from_date_hijri: editTopic.from_date_hijri || editTopic.pyTempDate,
      from_date_gregorian: editTopic.from_date_gregorian || editTopic.FromDate_New,
      to_date_hijri: editTopic.to_date_hijri || editTopic.Date_New,
      to_date_gregorian: editTopic.to_date_gregorian || editTopic.ToDate_New
    });

    console.log('[🔄 BPSR-1] Raw editTopic date fields:', {
      pyTempDate: editTopic.pyTempDate,
      FromDate_New: editTopic.FromDate_New,
      Date_New: editTopic.Date_New,
      ToDate_New: editTopic.ToDate_New,
      from_date_hijri: editTopic.from_date_hijri,
      from_date_gregorian: editTopic.from_date_gregorian,
      to_date_hijri: editTopic.to_date_hijri,
      to_date_gregorian: editTopic.to_date_gregorian
    });

    console.log('[🔄 BPSR-1] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  // MIR-1: Medical Insurance Request
  const prefillMIR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'MIR-1') return;

    console.log('[🔄 MIR-1] Starting prefill for MIR-1');

    // Set typeOfRequest
    const requestTypeValue = editTopic.RequestType_Code || editTopic.typeOfRequest?.value || editTopic.RequestType;
    const requestTypeLabel = editTopic.RequestType || editTopic.typeOfRequest?.label || editTopic.RequestType;
    if (requestTypeValue && requestTypeLabel) {
      const requestTypeOption = { value: requestTypeValue, label: requestTypeLabel };
      setValueOnly('typeOfRequest', requestTypeOption);
      console.log('[🔄 MIR-1] Set typeOfRequest:', requestTypeOption);
    }

    // Set dependent fields based on request type
    setValueOnly('requiredDegreeOfInsurance', editTopic.RequiredDegreeInsurance || editTopic.requiredDegreeOfInsurance || '');
    setValueOnly('theReason', editTopic.Reason || editTopic.theReason || '');
    setValueOnly('currentInsuranceLevel', editTopic.CurrentInsuranceLevel || editTopic.currentInsuranceLevel || '');

    console.log('[🔄 MIR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // CMR-1: Compensation Request - Amounts Paid For
  const prefillCMR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-1') return;

    console.log('[🔄 CMR-1] Starting prefill for CMR-1');

    const amountsPaidForValue = editTopic.amountsPaidFor?.value || editTopic.AmountsPaidFor;
    const amountsPaidForOption = ensureOption(lookupData.amountPaidData?.DataElements, amountsPaidForValue);
    setValueOnly('amountsPaidFor', amountsPaidForOption);
    setValueOnly('theAmountRequired', editTopic.theAmountRequired || editTopic.AmountRequired || '');

    console.log('[🔄 CMR-1] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  // CMR-3: Compensation Request - Work Injury
  const prefillCMR3 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-3') return;

    console.log('[🔄 CMR-3] Starting prefill for CMR-3');

    setValueOnly('compensationAmount', editTopic.Amount || editTopic.compensationAmount || '');
    setValueOnly('injury_date_hijri', editTopic.InjuryDateHijri || editTopic.injury_date_hijri || editTopic.pyTempText || '');
    setValueOnly('injury_date_gregorian', editTopic.InjuryDateGregorian || editTopic.injury_date_gregorian || editTopic.InjuryDate_New || '');
    setValueOnly('injuryType', editTopic.TypeOfWorkInjury || editTopic.injuryType || '');

    console.log('[🔄 CMR-3] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // CMR-4: Compensation Request - General
  const prefillCMR4 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-4') return;

    console.log('[🔄 CMR-4] Starting prefill for CMR-4');

    setValueOnly('noticeCompensationAmount', editTopic.noticeCompensationAmount || editTopic.Amount || editTopic.amount || '');

    console.log('[🔄 CMR-4] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // CMR-5: Compensation Request - Leave
  const prefillCMR5 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-5') return;

    console.log('[🔄 CMR-5] Starting prefill for CMR-5');

    // Handle kindOfHoliday option field
    const leaveTypeCode = editTopic.LeaveType_Code || editTopic.KindOfHoliday_Code || editTopic.kindOfHoliday?.value;
    const leaveTypeLabel = editTopic.LeaveType || editTopic.KindOfHoliday || editTopic.kindOfHoliday?.label;

    console.log('[🔄 CMR-5] leaveTypeCode:', leaveTypeCode);
    console.log('[🔄 CMR-5] leaveTypeLabel:', leaveTypeLabel);

    let leaveTypeOption = null;

    // Priority 1: If we have both code and label from case details AND they are different, use them directly
    if (leaveTypeCode && leaveTypeLabel && leaveTypeCode !== leaveTypeLabel) {
      leaveTypeOption = { value: leaveTypeCode, label: leaveTypeLabel };
      console.log('[🔄 CMR-5] Using code and label from case details:', leaveTypeOption);
    }
    // Priority 2: If we have the code, use it to find the option from lookup
    else if (leaveTypeCode) {
      leaveTypeOption = ensureOption(lookupData.leaveTypeData?.DataElements, leaveTypeCode);
      console.log('[🔄 CMR-5] Using code to find option from lookup:', leaveTypeOption);
    }
    // Priority 3: If we only have the label, try to find by label
    else if (leaveTypeLabel) {
      const matchingElement = lookupData.leaveTypeData?.DataElements?.find(
        (element: any) => element.ElementValue === leaveTypeLabel
      );
      if (matchingElement) {
        leaveTypeOption = { value: matchingElement.ElementKey, label: matchingElement.ElementValue };
      }
      console.log('[🔄 CMR-5] Using label to find option from lookup:', leaveTypeOption);
    }

    console.log('[🔄 CMR-5] Final leaveTypeOption:', leaveTypeOption);
    setValueOnly('kindOfHoliday', leaveTypeOption);
    setValueOnly('totalAmount', editTopic.TotalAmount || editTopic.totalAmount || editTopic.TotalAmountRequired || '');
    setValueOnly('workingHours', editTopic.WorkingHours || editTopic.workingHours || editTopic.WorkingHoursCount || '');
    setValueOnly('additionalDetails', editTopic.AdditionalDetails || editTopic.additionalDetails || '');

    console.log('[🔄 CMR-5] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  // CMR-6: Compensation Request - Wage Difference/Increase
  const prefillCMR6 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-6') return;

    console.log('[🔄 CMR-6] Starting prefill for CMR-6');

    setValueOnly('from_date_hijri', editTopic.FromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('from_date_gregorian', editTopic.FromDateGregorian || editTopic.from_date_gregorian || editTopic.FromDate_New || '');
    setValueOnly('to_date_hijri', editTopic.ToDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('to_date_gregorian', editTopic.ToDateGregorian || editTopic.to_date_gregorian || editTopic.ToDate_New || '');
    setValueOnly('newPayAmount', editTopic.NewPayAmount || editTopic.newPayAmount || '');

    // Handle payIncreaseType option field
    const payIncreaseTypeCode = editTopic.PayIncreaseType_Code || editTopic.payIncreaseType?.value;
    const payIncreaseTypeLabel = editTopic.PayIncreaseType || editTopic.payIncreaseType?.label;

    console.log('[🔄 CMR-6] payIncreaseTypeCode:', payIncreaseTypeCode);
    console.log('[🔄 CMR-6] payIncreaseTypeLabel:', payIncreaseTypeLabel);

    let payIncreaseTypeOption = null;

    // Priority 1: If we have both code and label from case details AND they are different, use them directly
    if (payIncreaseTypeCode && payIncreaseTypeLabel && payIncreaseTypeCode !== payIncreaseTypeLabel) {
      payIncreaseTypeOption = { value: payIncreaseTypeCode, label: payIncreaseTypeLabel };
      console.log('[🔄 CMR-6] Using code and label from case details:', payIncreaseTypeOption);
    }
    // Priority 2: If we have the code, use it to find the option from lookup
    else if (payIncreaseTypeCode) {
      payIncreaseTypeOption = ensureOption(lookupData.payIncreaseTypeData?.DataElements, payIncreaseTypeCode);
      console.log('[🔄 CMR-6] Using code to find option from lookup:', payIncreaseTypeOption);
    }
    // Priority 3: If we only have the label, try to find by label
    else if (payIncreaseTypeLabel) {
      const matchingElement = lookupData.payIncreaseTypeData?.DataElements?.find(
        (element: any) => element.ElementValue === payIncreaseTypeLabel
      );
      if (matchingElement) {
        payIncreaseTypeOption = { value: matchingElement.ElementKey, label: matchingElement.ElementValue };
      }
      console.log('[🔄 CMR-6] Using label to find option from lookup:', payIncreaseTypeOption);
    }

    console.log('[🔄 CMR-6] Final payIncreaseTypeOption:', payIncreaseTypeOption);
    setValueOnly('payIncreaseType', payIncreaseTypeOption);
    setValueOnly('wageDifference', editTopic.WageDifference || editTopic.wageDifference || '');

    console.log('[🔄 CMR-6] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  // CMR-7: Compensation Request - Overtime
  const prefillCMR7 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-7') return;

    console.log('[🔄 CMR-7] Starting prefill for CMR-7');

    setValueOnly('from_date_hijri', editTopic.FromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('from_date_gregorian', editTopic.FromDateGregorian || editTopic.from_date_gregorian || editTopic.FromDate_New || '');
    setValueOnly('to_date_hijri', editTopic.ToDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('to_date_gregorian', editTopic.ToDateGregorian || editTopic.to_date_gregorian || editTopic.ToDate_New || '');
    setValueOnly('durationOfLeaveDue', editTopic.DurationOfLeaveDue || editTopic.durationOfLeaveDue || '');
    setValueOnly('payDue', editTopic.PayDue || editTopic.payDue || '');

    console.log('[🔄 CMR-7] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // CMR-8: Compensation Request - Wages
  const prefillCMR8 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CMR-8') return;

    console.log('[🔄 CMR-8] Starting prefill for CMR-8');

    setValueOnly('from_date_hijri', editTopic.FromDateHijri || editTopic.from_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('from_date_gregorian', editTopic.FromDateGregorian || editTopic.from_date_gregorian || editTopic.FromDate_New || '');
    setValueOnly('to_date_hijri', editTopic.ToDateHijri || editTopic.to_date_hijri || editTopic.Date_New || '');
    setValueOnly('to_date_gregorian', editTopic.ToDateGregorian || editTopic.to_date_gregorian || editTopic.ToDate_New || '');
    setValueOnly('wagesAmount', editTopic.WagesAmount || editTopic.wagesAmount || '');

    console.log('[🔄 CMR-8] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // BR-1: Bonus Request
  const prefillBR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'BR-1') return;

    console.log('[🔄 BR-1] Starting prefill for BR-1');

    // Handle accordingToAgreement option field
    const accordingToAgreementCode = editTopic.AccordingToAgreement_Code || editTopic.accordingToAgreement?.value;
    const accordingToAgreementLabel = editTopic.AccordingToAgreement || editTopic.accordingToAgreement?.label;

    console.log('[🔄 BR-1] accordingToAgreementCode:', accordingToAgreementCode);
    console.log('[🔄 BR-1] accordingToAgreementLabel:', accordingToAgreementLabel);

    let accordingToAgreementOption = null;

    // Priority 1: If we have both code and label from case details AND they are different, use them directly
    if (accordingToAgreementCode && accordingToAgreementLabel && accordingToAgreementCode !== accordingToAgreementLabel) {
      accordingToAgreementOption = { value: accordingToAgreementCode, label: accordingToAgreementLabel };
      console.log('[🔄 BR-1] Using code and label from case details:', accordingToAgreementOption);
    }
    // Priority 2: If we have the code, use it to find the option from lookup
    else if (accordingToAgreementCode) {
      accordingToAgreementOption = ensureOption(lookupData.accordingToAgreementLookupData?.DataElements, accordingToAgreementCode);
      console.log('[🔄 BR-1] Using code to find option from lookup:', accordingToAgreementOption);
    }
    // Priority 3: If we only have the label, try to find by label
    else if (accordingToAgreementLabel) {
      const matchingElement = lookupData.accordingToAgreementLookupData?.DataElements?.find(
        (element: any) => element.ElementValue === accordingToAgreementLabel
      );
      if (matchingElement) {
        accordingToAgreementOption = { value: matchingElement.ElementKey, label: matchingElement.ElementValue };
      }
      console.log('[🔄 BR-1] Using label to find option from lookup:', accordingToAgreementOption);
    }

    setValueOnly('accordingToAgreement', accordingToAgreementOption);
    setValueOnly('bonusAmount', editTopic.bonusAmount || editTopic.BonusAmount || editTopic.Amount || editTopic.Premium || '');
    setValueOnly('date_hijri', editTopic.date_hijri || editTopic.pyTempDate || '');
    setValueOnly('date_gregorian', editTopic.date_gregorian || editTopic.Date_New || '');

    console.log('[🔄 BR-1] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  // EDO-1: Cancellation of Location Transfer Decision
  const prefillEDO1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'EDO-1') return;

    console.log('[🔄 EDO-1] Starting prefill for EDO-1', editTopic);

    // Set location fields
    const fromLocationCode = editTopic.fromLocation?.value || editTopic.FromLocation_Code || editTopic.fromLocation;
    const fromLocationLabel = editTopic.fromLocation?.label || editTopic.FromLocation;
    if (fromLocationCode && fromLocationLabel) {
      setValueOnly('fromLocation', { value: fromLocationCode, label: fromLocationLabel });
    }

    const toLocationCode = editTopic.toLocation?.value || editTopic.ToLocation_Code || editTopic.toLocation;
    const toLocationLabel = editTopic.toLocation?.label || editTopic.ToLocation;
    if (toLocationCode && toLocationLabel) {
      setValueOnly('toLocation', { value: toLocationCode, label: toLocationLabel });
    }

    /*
{
    
    "ManagerialDecisionDateGregorian": "20250727",
    "ManagerialDecisionNumber": "12347"
}
*/
    // Set date and decision fields
    setValueOnly('managerial_decision_date_hijri', editTopic.managerial_decision_date_hijri || editTopic.Date_New || editTopic?.ManagerialDecisionDateHijri || '');
    setValueOnly('managerial_decision_date_gregorian', editTopic.managerial_decision_date_gregorian || editTopic.ManDecsDate || editTopic?.ManagerialDecisionDateGregorian || '');
    setValueOnly('managerialDecisionNumber', editTopic.managerialDecisionNumber || editTopic?.ManagerialDecisionNumber || '');

    console.log('[🔄 EDO-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // EDO-2: Cancellation of Job Transfer Decision
  const prefillEDO2 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'EDO-2') return;

    console.log('[🔄 EDO-2] Starting prefill for EDO-2');

    setValueOnly('fromJob', editTopic.fromJob || '');
    setValueOnly('toJob', editTopic.toJob || '');
    setValueOnly('managerial_decision_date_hijri', editTopic.managerial_decision_date_hijri || editTopic.Date_New || '');
    setValueOnly('managerial_decision_date_gregorian', editTopic.managerial_decision_date_gregorian || editTopic.ManDecsDate || '');
    setValueOnly('managerialDecisionNumber', editTopic.managerialDecisionNumber || '');

    console.log('[🔄 EDO-2] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // EDO-3: Cancellation of Wage Reduction Decision
  const prefillEDO3 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'EDO-3') return;

    console.log('[🔄 EDO-3] Starting prefill for EDO-3');

    setValueOnly('amountOfReduction', editTopic.amountOfReduction || editTopic.AmountOfReduction || '');
    setValueOnly('managerial_decision_date_hijri', editTopic.managerial_decision_date_hijri || editTopic.pyTempDate || '');
    setValueOnly('managerial_decision_date_gregorian', editTopic.managerial_decision_date_gregorian || editTopic.ManagerialDecisionDate_New || '');
    setValueOnly('managerialDecisionNumber', editTopic.managerialDecisionNumber || '');

    console.log('[🔄 EDO-3] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // EDO-4: Cancellation of Disciplinary Penalty Decision
  const prefillEDO4 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'EDO-4') return;

    console.log('[🔄 EDO-4] Starting prefill for EDO-4');

    // Handle typesOfPenalties option field
    const penaltyCode = editTopic.PenalityType_Code || editTopic.TypesOfPenalties_Code || editTopic.typesOfPenalties?.value;
    const penaltyLabel = editTopic.PenalityType || editTopic.TypesOfPenalties || editTopic.typesOfPenalties?.label;

    console.log('[🔄 EDO-4] penaltyCode:', penaltyCode);
    console.log('[🔄 EDO-4] penaltyLabel:', penaltyLabel);

    let penaltyOption = null;

    // Priority 1: If we have both code and label from case details AND they are different, use them directly
    if (penaltyCode && penaltyLabel && penaltyCode !== penaltyLabel) {
      penaltyOption = { value: penaltyCode, label: penaltyLabel };
      console.log('[🔄 EDO-4] Using code and label from case details:', penaltyOption);
    }
    // Priority 2: If we have the code, use it to find the option from lookup (this handles cases where code=label)
    else if (penaltyCode) {
      penaltyOption = ensureOption(lookupData.typesOfPenaltiesData?.DataElements, penaltyCode);
      console.log('[🔄 EDO-4] Using code to find option from lookup:', penaltyOption);
    }
    // Priority 3: If we only have the label, try to find by label
    else if (penaltyLabel) {
      const matchingElement = lookupData.typesOfPenaltiesData?.DataElements?.find(
        (element: any) => element.ElementValue === penaltyLabel
      );
      if (matchingElement) {
        penaltyOption = { value: matchingElement.ElementKey, label: matchingElement.ElementValue };
      }
      console.log('[🔄 EDO-4] Using label to find option from lookup:', penaltyOption);
    }

    console.log('[🔄 EDO-4] Final penaltyOption:', penaltyOption);
    setValueOnly('typesOfPenalties', penaltyOption);

    setValueOnly('managerial_decision_date_hijri', editTopic.ManagerialDecisionDateHijri || editTopic.managerial_decision_date_hijri || editTopic.Date_New || '');
    setValueOnly('managerial_decision_date_gregorian', editTopic.ManagerialDecisionDateGregorian || editTopic.managerial_decision_date_gregorian || editTopic.ManDecsDate || '');
    setValueOnly('managerialDecisionNumber', editTopic.ManagerialDecisionNumber || editTopic.managerialDecisionNumber || '');

    console.log('[🔄 EDO-4] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  // HIR-1: Housing Insurance Request
  const prefillHIR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'HIR-1') return;
/*


this worke is not finished yet 
if prefill from apis
{
    "IsContractIncludeAddingAccommodiation": "No",
    "IsBylawsIncludeAddingAccommodiation": "Yes",
    "HousingSpecificationsInBylaws": "123",
    "doesBylawsIncludeAddingAccommodations": true,
    "doesContractIncludeAddingAccommodations": false,
    "housingSpecificationInByLaws": "123",
    "housingSpecificationsInContract": "",
}

    --------------
    if click update btn
    {
    "DoesBylawsIncludeAddingAccommodations": true,
    "DoesContractIncludeAddingAccommodations": false,
    "HousingSpecificationInByLaws": "432323",
    "HousingSpecificationsInContract": "",
    "ActualHousingSpecifications": ""
}
*/
    console.log('[🔄 HIR-1] Starting prefill for HIR-1',editTopic);
    if (
      editTopic.doesBylawsIncludeAddingAccommodations === true ||
      editTopic.DoesBylawsIncludeAddingAccommodations === true ||
      editTopic.IsBylawsIncludeAddingAccommodiation === "Yes"
    ) {
      setValueOnly(
        'doesBylawsIncludeAddingAccommodations', true
      );
    } else {
      setValueOnly(
        'doesBylawsIncludeAddingAccommodations', false
      );
    }



    if (
      editTopic.doesContractIncludeAddingAccommodations === true ||
      editTopic.DoesContractIncludeAddingAccommodations === true ||
      editTopic.IsContractIncludeAddingAccommodiation === "Yes"
    ) {
      setValueOnly(
        'doesContractIncludeAddingAccommodations', true
      );

    } else {
      setValueOnly(
        'doesContractIncludeAddingAccommodations', false
      );
    }

    // setValueOnly('doesBylawsIncludeAddingAccommodations',
    //   editTopic.doesBylawsIncludeAddingAccommodations !== undefined
    //     ? editTopic.doesBylawsIncludeAddingAccommodations
    //     : editTopic.IsBylawsIncludeAddingAccommodiation === "Yes"
    // );
    // setValueOnly('doesContractIncludeAddingAccommodations',
    //   editTopic.doesContractIncludeAddingAccommodations !== undefined
    //     ? editTopic.doesContractIncludeAddingAccommodations
    //     : editTopic.IsContractIncludeAddingAccommodiation === "Yes"
    // );
    setValueOnly('housingSpecificationInByLaws', editTopic.housingSpecificationInByLaws || editTopic.HousingSpecificationsInBylaws ||editTopic?.HousingSpecificationInByLaws|| '');
    setValueOnly('housingSpecificationsInContract', editTopic.housingSpecificationsInContract || editTopic.HousingSpecificationsInContract ||editTopic?.HousingSpecificationsInContract || '');
    setValueOnly('actualHousingSpecifications', editTopic.actualHousingSpecifications || editTopic.HousingSpecifications  || editTopic?.ActualHousingSpecifications|| '');

    console.log('[🔄 HIR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // JAR-2: Job Application Request (Change Job Title)
  const prefillJAR2 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'JAR-2') return;

    console.log('[🔄 JAR-2] Starting prefill for JAR-2');

    setValueOnly('currentJobTitle', editTopic.currentJobTitle || editTopic.CurrentJobTitle || '');
    setValueOnly('requiredJobTitle', editTopic.requiredJobTitle || editTopic.RequiredJobTitle || '');

    console.log('[🔄 JAR-2] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // JAR-3: Job Application Request (Promotion Mechanism)
  const prefillJAR3 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'JAR-3') return;

    console.log('[🔄 JAR-3] Starting prefill for JAR-3');
    console.log('[🔄 JAR-3] editTopic data:', editTopic);

    // Determine the boolean values from the case data
    const doesTheInternalRegulationIncludePromotionMechanism =
      editTopic.doesTheInternalRegulationIncludePromotionMechanism !== undefined
        ? editTopic.doesTheInternalRegulationIncludePromotionMechanism
        : editTopic.PromotionMechanism === "Yes";

    const doesContractIncludeAdditionalUpgrade =
      editTopic.doesContractIncludeAdditionalUpgrade !== undefined
        ? editTopic.doesContractIncludeAdditionalUpgrade
        : editTopic.AdditionalUpgrade === "Yes";

    // Set the individual boolean fields
    setValueOnly('doesTheInternalRegulationIncludePromotionMechanism', doesTheInternalRegulationIncludePromotionMechanism);
    setValueOnly('doesContractIncludeAdditionalUpgrade', doesContractIncludeAdditionalUpgrade);

    // Set the radio button value based on the boolean fields
    let promotionSourceValue = null;
    if (doesTheInternalRegulationIncludePromotionMechanism) {
      promotionSourceValue = "internalRegulation";
    } else if (doesContractIncludeAdditionalUpgrade) {
      promotionSourceValue = "contract";
    }

    console.log('[🔄 JAR-3] Boolean values:', {
      doesTheInternalRegulationIncludePromotionMechanism,
      doesContractIncludeAdditionalUpgrade
    });
    console.log('[🔄 JAR-3] promotionSourceValue:', promotionSourceValue);

    // Set the radio button value
    if (promotionSourceValue) {
      setValueOnly('promotionSource', promotionSourceValue);
    }

    console.log('[🔄 JAR-3] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // JAR-4: Job Application Request (Position Change)
  const prefillJAR4 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'JAR-4') return;

    console.log('[🔄 JAR-4] Starting prefill for JAR-4');

    setValueOnly('currentPosition', editTopic.currentPosition || editTopic.CurrentPosition || '');
    setValueOnly('theWantedJob', editTopic.theWantedJob || editTopic.WantedJob || '');

    console.log('[🔄 JAR-4] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // LRESR-1: End of Service Reward
  const prefillLRESR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'LRESR-1') return;

    console.log('[🔄 LRESR-1] Starting prefill for LRESR-1');

    setValueOnly('endOfServiceRewardAmount', editTopic.endOfServiceRewardAmount || editTopic.Amount || editTopic.amount || '');

    console.log('[🔄 LRESR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // TTR-1: Travel Transportation Request
  const prefillTTR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'TTR-1') return;

    console.log('[🔄 TTR-1] Starting prefill for TTR-1');

    // Handle both code and label formats
    const travelingWayCode = editTopic.TravelingWay_Code || editTopic.travelingWay?.value;
    const travelingWayLabel = editTopic.TravelingWay || editTopic.travelingWay?.label;

    console.log('[🔄 TTR-1] travelingWayCode:', travelingWayCode);
    console.log('[🔄 TTR-1] travelingWayLabel:', travelingWayLabel);
    console.log('[🔄 TTR-1] travelingWayData available:', !!lookupData.travelingWayData);
    console.log('[🔄 TTR-1] travelingWayData elements:', lookupData.travelingWayData?.DataElements);

    let travelingWayOption = null;

    if (travelingWayCode) {
      // If we have the code, use it to find the option
      travelingWayOption = ensureOption(lookupData.travelingWayData?.DataElements, travelingWayCode, travelingWayLabel);
      console.log('[🔄 TTR-1] Option from code lookup:', travelingWayOption);
    }

    // If we still don't have an option, try to find by label
    if (!travelingWayOption && travelingWayLabel) {
      const matchingElement = lookupData.travelingWayData?.DataElements?.find(
        (element: any) => element.ElementValue === travelingWayLabel
      );
      if (matchingElement) {
        travelingWayOption = { value: matchingElement.ElementKey, label: matchingElement.ElementValue };
        console.log('[🔄 TTR-1] Option from label lookup:', travelingWayOption);
      }
    }

    // If we still don't have an option, create one from the available data
    if (!travelingWayOption && (travelingWayCode || travelingWayLabel)) {
      travelingWayOption = {
        value: travelingWayCode || travelingWayLabel,
        label: travelingWayLabel || travelingWayCode
      };
      console.log('[🔄 TTR-1] Option from fallback:', travelingWayOption);
    }

    console.log('[🔄 TTR-1] Final travelingWayOption:', travelingWayOption);
    setValueOnly('travelingWay', travelingWayOption);

    console.log('[🔄 TTR-1] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  // RFR-1: Refund Request
  const prefillRFR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'RFR-1') return;


    setValueOnly('rewardRequestAmount', editTopic.rewardRequestAmount || editTopic.Amount || editTopic.amount || '');
    setValueOnly('consideration', editTopic.consideration || editTopic.Consideration || '');
    setValueOnly('date_hijri', editTopic.date_hijri || editTopic.pyTempDate || editTopic.DateHijri || '');
    setValueOnly('date_gregorian', editTopic.date_gregorian || editTopic.Date_New || editTopic.DateGregorian || '');

    console.log('[🔄 RFR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // RR-1: Reward Request
  const prefillRR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'RR-1') return;

    console.log('[🔄 RR-1] Starting prefill for RR-1');

    setValueOnly('rewardAmount', editTopic.rewardAmount || editTopic.Amount || editTopic.amount || '');
    setValueOnly('rewardType', editTopic.rewardType || editTopic.RewardType || editTopic.Type || '');

    console.log('[🔄 RR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // LCUT-1: Leave Cancellation
  const prefillLCUT1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'LCUT-1') return;

    console.log('[🔄 LCUT-1] Starting prefill for LCUT-1');

    setValueOnly('amountOfCompensation', editTopic.amountOfCompensation || editTopic.AmountOfCompensation || '');

    console.log('[🔄 LCUT-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // DR-1: Document Request
  const prefillDR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'DR-1') return;

    console.log('[🔄 DR-1] Starting prefill for DR-1');

    // DR-1 typically doesn't have specific form fields, just acknowledgment
    console.log('[🔄 DR-1] Prefill completed');
  }, [isEditing, editTopic]);

  // ==================== ESTABLISHMENT SUBTOPICS ====================

  // CR-1: Custody Request
  const prefillCR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'CR-1') return;

    console.log('[🔄 CR-1] Starting prefill for CR-1');

    // Handle typeOfCustody option field
    const typeOfCustodyCode = editTopic.TypeOfCustody_Code || editTopic.typeOfCustody?.value;
    const typeOfCustodyLabel = editTopic.TypeOfCustody || editTopic.typeOfCustody?.label;

    console.log('[🔄 CR-1] typeOfCustodyCode:', typeOfCustodyCode);
    console.log('[🔄 CR-1] typeOfCustodyLabel:', typeOfCustodyLabel);

    let typeOfCustodyOption = null;

    if (typeOfCustodyCode) {
      // If we have the code, use it to find the option
      typeOfCustodyOption = ensureOption(lookupData.typeOfCustodyData?.DataElements, typeOfCustodyCode);
    } else if (typeOfCustodyLabel) {
      // If we only have the label, try to find by label
      const matchingElement = lookupData.typeOfCustodyData?.DataElements?.find(
        (element: any) => element.ElementValue === typeOfCustodyLabel
      );
      if (matchingElement) {
        typeOfCustodyOption = { value: matchingElement.ElementKey, label: matchingElement.ElementValue };
      }
    }

    console.log('[🔄 CR-1] Final typeOfCustodyOption:', typeOfCustodyOption);
    setValueOnly('typeOfCustody', typeOfCustodyOption);

    const compensationAmountValue = editTopic.CompensationAmount || editTopic.compensationAmount || editTopic.Amount || editTopic.amount || '';
    console.log('[🔄 CR-1] Setting compensationAmount to:', compensationAmountValue);
    setValueOnly('compensationAmount', compensationAmountValue); // Changed from 'amount' to 'compensationAmount'

    console.log('[🔄 CR-1] Prefill completed');
  }, [isEditing, editTopic, lookupData, setValueOnly]);

  // LCUTE-1: Leave Cancellation (Establishment)
  const prefillLCUTE1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'LCUTE-1') return;

    console.log('[🔄 LCUTE-1] Starting prefill for LCUTE-1');

    setValueOnly('amountOfCompensation', editTopic.amountOfCompensation || editTopic.AmountOfCompensation || '');

    console.log('[🔄 LCUTE-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // DPVR-1: Damaged Property Value Request
  const prefillDPVR1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'DPVR-1') return;

    console.log('[🔄 DPVR-1] Starting prefill for DPVR-1');

    setValueOnly('damagedType', editTopic.damagedType || editTopic.SpoilerType || '');
    setValueOnly('damagedValue', editTopic.damagedValue || editTopic.DamagedValue || '');

    console.log('[🔄 DPVR-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // AWRW-1: Additional Worker Rights (Establishment)
  const prefillAWRW1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'AWRW-1') return;

    console.log('[🔄 AWRW-1] Starting prefill for AWRW-1');

    // AWRW-1 typically doesn't have specific form fields, just acknowledgment
    console.log('[🔄 AWRW-1] Prefill completed');
  }, [isEditing, editTopic]);

  // AWRW-2: Additional Worker Rights (Establishment)
  const prefillAWRW2 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'AWRW-2') return;

    console.log('[🔄 AWRW-2] Starting prefill for AWRW-2');

    // AWRW-2 typically doesn't have specific form fields, just acknowledgment
    console.log('[🔄 AWRW-2] Prefill completed');
  }, [isEditing, editTopic]);

  // RLRAHI-1: Request for Loan or Custody
  const prefillRLRAHI1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'RLRAHI-1') return;

    console.log('[🔄 RLRAHI-1] Starting prefill for RLRAHI-1');
    console.log('[🔄 RLRAHI-1] editTopic data:', editTopic);

    // Handle typeOfRequest field - check multiple possible sources
    const requestTypeValue = editTopic.typeOfRequest?.value || editTopic.RequestType || editTopic.RequestType_Code;
    const requestTypeLabel = editTopic.typeOfRequest?.label || editTopic.RequestType || requestTypeValue;

    console.log('[🔄 RLRAHI-1] requestTypeValue:', requestTypeValue);
    console.log('[🔄 RLRAHI-1] requestTypeLabel:', requestTypeLabel);

    if (requestTypeValue) {
      const requestTypeOption = { value: requestTypeValue, label: requestTypeLabel };
      setValueOnly('typeOfRequest', requestTypeOption);
      console.log('[🔄 RLRAHI-1] Set typeOfRequest:', requestTypeOption);
    }

    if (requestTypeValue === 'RLRAHI2') {
      // Loan request
      const loanAmount = editTopic.loanAmount || editTopic.LoanAmount || '';
      setValueOnly('loanAmount', loanAmount);
      console.log('[🔄 RLRAHI-1] Set loanAmount:', loanAmount);
    } else {
      // Custody request
      const typeOfCustody = editTopic.typeOfCustody || editTopic.TypeOfCustody || '';
      const requestDateHijri = editTopic.request_date_hijri || editTopic.Date_New || editTopic.RequestDateHijri || '';
      const requestDateGregorian = editTopic.request_date_gregorian || editTopic.RequestDate_New || editTopic.RequestDateGregorian || '';

      setValueOnly('typeOfCustody', typeOfCustody);
      setValueOnly('request_date_hijri', requestDateHijri);
      setValueOnly('request_date_gregorian', requestDateGregorian);

      console.log('[🔄 RLRAHI-1] Set custody fields:', { typeOfCustody, requestDateHijri, requestDateGregorian });
    }

    console.log('[🔄 RLRAHI-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // RUF-1: Refund Request (Establishment)
  const prefillRUF1 = useCallback(() => {
    if (!isEditing || !editTopic || editTopic.SubTopicID !== 'RUF-1') {
      console.log('[🔄 RUF-1] Prefill skipped - isEditing:', isEditing, 'editTopic:', !!editTopic, 'SubTopicID:', editTopic?.SubTopicID);
      return;
    }

    console.log('[🔄 RUF-1] Starting prefill for RUF-1');
    console.log('[🔄 RUF-1] editTopic data:', editTopic);

    const refundType = editTopic.refundType || editTopic.RefundType || '';
    const amount = editTopic.refundAmount || editTopic.amount || editTopic.Amount || '';

    console.log('[🔄 RUF-1] refundType:', refundType);
    console.log('[🔄 RUF-1] amount:', amount);

    setValueOnly('RefundType', refundType);
    setValueOnly('refundAmount', amount); // Changed from 'amount' to 'refundAmount'

    console.log('[🔄 RUF-1] Set RefundType:', refundType);
    console.log('[🔄 RUF-1] Set refundAmount:', amount);

    console.log('[🔄 RUF-1] Prefill completed');
  }, [isEditing, editTopic, setValueOnly]);

  // Main prefill function that routes to appropriate handler
  const prefillSubTopic = useCallback(() => {
    console.log('[🔍 PREFILL DEBUG] prefillSubTopic called with:', {
      isEditing,
      editTopic: editTopic ? { SubTopicID: editTopic.SubTopicID, MainTopicID: editTopic.MainTopicID, index: editTopic.index } : null
    });

    if (!isEditing || !editTopic) {
      console.log('[🔍 PREFILL DEBUG] Early return - isEditing:', isEditing, 'editTopic exists:', !!editTopic);
      return;
    }

    const subTopicId = editTopic.SubTopicID;
    const topicIndex = editTopic.index;
    const topicId = editTopic.topicId || editTopic.id;

    // Create a unique identifier that includes topic-specific information
    // Use index as the primary differentiator since it's always unique per topic
    const uniqueKey = `${subTopicId}-${editTopic.MainTopicID}-${topicIndex}-${topicId || 'no-id'}`;

    console.log(`[🔍 PREFILL DEBUG] editTopic:`, {
      SubTopicID: editTopic.SubTopicID,
      MainTopicID: editTopic.MainTopicID,
      index: editTopic.index,
      topicId: editTopic.topicId,
      id: editTopic.id,
      uniqueKey,
      currentPrefillDone: prefillDoneRef.current,
      // Add more details to help debug the issue
      fullEditTopic: editTopic
    });

    console.log(`[🔍 PREFILL DEBUG] Unique key comparison:`, {
      uniqueKey,
      currentPrefillDone: prefillDoneRef.current,
      keysMatch: prefillDoneRef.current === uniqueKey
    });

    // Reset prefillDoneRef when editTopic changes
    if (prefillDoneRef.current !== uniqueKey) {
      prefillDoneRef.current = uniqueKey;
      console.log(`[🔄 SUBTOPIC] Starting prefill for ${subTopicId} (index: ${topicIndex})`);
    } else {
      console.log(`[🔄 SUBTOPIC] Prefill already done for ${subTopicId} (index: ${topicIndex}), but continuing anyway to ensure form values are set`);
      // Continue with prefill even if already done to ensure form values are set
    }

    switch (subTopicId) {
      // Worker Subtopics
      case 'WR-1':
        prefillWR1();
        break;
      case 'WR-2':
        prefillWR2();
        break;
      case 'BPSR-1':
        prefillBPSR1();
        break;
      case 'MIR-1':
        prefillMIR1();
        break;
      case 'CMR-1':
        prefillCMR1();
        break;
      case 'CMR-3':
        prefillCMR3();
        break;
      case 'CMR-4':
        prefillCMR4();
        break;
      case 'CMR-5':
        prefillCMR5();
        break;
      case 'CMR-6':
        prefillCMR6();
        break;
      case 'CMR-7':
        prefillCMR7();
        break;
      case 'CMR-8':
        prefillCMR8();
        break;
      case 'BR-1':
        prefillBR1();
        break;
      case 'EDO-1':
        prefillEDO1();
        break;
      case 'EDO-2':
        prefillEDO2();
        break;
      case 'EDO-3':
        prefillEDO3();
        break;
      case 'EDO-4':
        prefillEDO4();
        break;
      case 'HIR-1':
        prefillHIR1();
        break;
      case 'JAR-2':
        prefillJAR2();
        break;
      case 'JAR-3':
        prefillJAR3();
        break;
      case 'JAR-4':
        prefillJAR4();
        break;
      case 'LRESR-1':
        prefillLRESR1();
        break;
      case 'TTR-1':
        prefillTTR1();
        break;
      case 'RFR-1':
        prefillRFR1();
        break;
      case 'RR-1':
        prefillRR1();
        break;
      case 'LCUT-1':
        prefillLCUT1();
        break;
      case 'DR-1':
        prefillDR1();
        break;

      // Establishment Subtopics
      case 'CR-1':
        prefillCR1();
        break;
      case 'LCUTE-1':
        prefillLCUTE1();
        break;
      case 'DPVR-1':
        prefillDPVR1();
        break;
      case 'AWRW-1':
        prefillAWRW1();
        break;
      case 'AWRW-2':
        prefillAWRW2();
        break;
      case 'RLRAHI-1':
        prefillRLRAHI1();
        break;
      case 'RUF-1':
        prefillRUF1();
        break;

      default:
        console.log(`[🔄 SUBTOPIC] No specific prefill handler for ${subTopicId}`);
        break;
    }
  }, [
    isEditing,
    editTopic,
    // Worker Subtopics
    prefillWR1,
    prefillWR2,
    prefillBPSR1,
    prefillMIR1,
    prefillCMR1,
    prefillCMR3,
    prefillCMR4,
    prefillCMR5,
    prefillCMR6,
    prefillCMR7,
    prefillCMR8,
    prefillBR1,
    prefillEDO1,
    prefillEDO2,
    prefillEDO3,
    prefillEDO4,
    prefillHIR1,
    prefillJAR2,
    prefillJAR3,
    prefillJAR4,
    prefillLRESR1,
    prefillTTR1,
    prefillRFR1,
    prefillRR1,
    prefillLCUT1,
    prefillDR1,
    // Establishment Subtopics
    prefillCR1,
    prefillLCUTE1,
    prefillDPVR1,
    prefillAWRW1,
    prefillAWRW2,
    prefillRLRAHI1,
    prefillRUF1,
  ]);

  return {
    prefillSubTopic,
    // Worker Subtopics
    prefillWR1,
    prefillWR2,
    prefillBPSR1,
    prefillMIR1,
    prefillCMR1,
    prefillCMR3,
    prefillCMR4,
    prefillCMR5,
    prefillCMR6,
    prefillCMR7,
    prefillCMR8,
    prefillBR1,
    prefillEDO1,
    prefillEDO2,
    prefillEDO3,
    prefillEDO4,
    prefillHIR1,
    prefillJAR2,
    prefillJAR3,
    prefillJAR4,
    prefillLRESR1,
    prefillTTR1,
    prefillRFR1,
    prefillRR1,
    prefillLCUT1,
    prefillDR1,
    // Establishment Subtopics
    prefillCR1,
    prefillLCUTE1,
    prefillDPVR1,
    prefillAWRW1,
    prefillAWRW2,
    prefillRLRAHI1,
    prefillRUF1,
  };
}; 