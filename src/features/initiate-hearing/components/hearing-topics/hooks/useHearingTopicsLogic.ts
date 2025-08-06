// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
//   useRef,
// } from "react";
// import { useForm, useWatch, useFormContext } from "react-hook-form";
// import { useTranslation } from "react-i18next";
// import { toast } from "react-toastify";
// import { useCookieState } from "../../../hooks/useCookieState";
// import { useLookup } from "../../../api/hook/useLookup";
// import { useSubTopicsSubLookupQuery } from "../../../api/create-case/addHearingApis";
// import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
// import { useAttachments } from "./useAttachments";
// import { useLazyGetFileDetailsQuery, useUpdateHearingTopicsMutation } from "../../../api/create-case/apis";
// import { getPayloadBySubTopicID } from "../api/case.topics.payload";
// import { TopicFormValues } from "../hearing.topics.types";
// import { TokenClaims } from "@/features/login/components/AuthProvider";
// import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";
// import { useGetRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/workDetailApis";
// import { Option } from "@/shared/components/form/form.types";
// import { DateObject } from "react-multi-date-picker";
// import gregorianCalendar from "react-date-object/calendars/gregorian";
// import gregorianLocale from "react-date-object/locales/gregorian_en";
// import arabicCalendar from "react-date-object/calendars/arabic";
// import arabicLocale from "react-date-object/locales/arabic_ar";
// import { useRemoveAttachmentMutation } from "../api/apis";
// import { isOtherCommission } from "../utils/isOtherCommission";
// import { isOtherAllowance } from "../utils/isOtherAllowance";
// import { useSubTopicPrefill } from "./useSubTopicPrefill";
// import useCaseTopicsPrefill from "./useCaseTopicsPrefill";
// import { useDateContext } from "@/shared/components/calanders/DateContext";
// import useToggle from "@/shared/hooks/generalSate";
// import { getHearingTopicsColumns } from "../config/colums";
// import { setFormData } from "@/redux/slices/formSlice";
// import { useNavigationService } from "@/shared/hooks/useNavigationService";
// import { steps } from "@/shared/modules/case-creation/components/tabs/tabsConfig";

// interface ApiResponse {
//   ServiceStatus: string;
//   SuccessCode: string;
//   CaseNumber?: string;
//   S2Cservicelink?: string;
//   ErrorDescription?: string;
//   ErrorCodeList: Array<{ ErrorCode: string; ErrorDesc: string }>;
// }

// interface UseHearingTopicsLogicProps {
//   mode: 'create' | 'edit';
//   showFooter: boolean;
//   onSaveApi?: (payload: any) => Promise<any>;
// }

// export const useHearingTopicsLogic = ({ mode, showFooter, onSaveApi }: UseHearingTopicsLogicProps) => {
//   const methods = useForm<any>();
//   const {
//     register,
//     handleSubmit,
//     watch,
//     setValue,
//     reset,
//     control,
//     getValues,
//     trigger,
//     formState,
//     formState: {
//       errors,
//       isValid,
//       isDirty,
//       isSubmitting,
//       isSubmitSuccessful,
//       submitCount,
//     },
//     unregister,
//     clearErrors,
//   } = methods;

//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const prefillDoneRef = useRef<string | null>(null);
//   const topicsLoadedRef = useRef(false);

//   useEffect(() => {
//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, []);

//   const [getCookie] = useCookieState({ caseId: "" });
//   const [caseId] = useState(getCookie("caseId"));
//   const [lastSaved, setLastSaved] = useState(false);
//   const [updateHearingTopics, { isLoading: addHearingLoading }] = useUpdateHearingTopicsMutation();
//   const UserClaims: TokenClaims = getCookie("userClaims");
//   const userType = getCookie("userType");
//   const defendantStatus = getCookie("defendantStatus");
//   const mainCategory2 = getCookie("mainCategory")?.value;
//   const subCategory2 = getCookie("subCategory")?.value;
//   const userID = getCookie("userClaims")?.UserID;
//   const fileNumber = getCookie("userClaims")?.File_Number;

//   const { i18n } = useTranslation();
//   const currentLanguage = i18n.language.toUpperCase();

//   const { handleResponse } = useApiErrorHandler();

//   const onSubmit = (data: TopicFormValues) => { };

//   const mainCategory = watch("mainCategory") ?? null;
//   const subCategory: any = watch("subCategory") ?? null;
//   const { t } = useTranslation("hearingtopics");
//   const { isOpen, close, toggle } = useToggle();
//   const userClaims = getCookie("userClaims");
//   const [caseTopics, setCaseTopics] = useState<any[]>([]);

//   const [delTopic, setDelTopic] = useState<any | null>(null);
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [editTopic, setEditTopic] = useState<any | null>(null);
//   const [editTopicIndex, setEditTopicIndex] = useState<number | null>(null);
//   const [showLegalSection, setShowLegalSection] = useState(false);
//   const [showTopicData, setShowTopicData] = useState(false);

//   // Define isEditing before any usage
//   const isEditing = Boolean(editTopic);
//   const isHIR1 = editTopic?.subCategory?.value === "HIR-1";
//   const lockAccommodationSource = isEditing && isHIR1;

//   const acknowledged = watch("acknowledged");
//   const regulatoryText = t("regulatory_text_content");
//   const { setDate } = useDateContext();

//   const goToLegalStep = () => {
//     if (!mainCategory || !subCategory) return;
//     setShowLegalSection(true);
//     setShowTopicData(false);
//     setValue("regulatoryText", regulatoryText);
//   };

//   const goToTopicDataStep = () => {
//     if (!acknowledged) return;
//     setShowTopicData(true);
//   };

//   const handleSend = () => {
//     console.log("[🚀 SEND TOPIC] Preparing to send. caseTopics:", caseTopics);
//     const result = saveTopic();
//     console.log("[🚀 SEND TOPIC] saveTopic() returned:", result);

//     reset();
//     setDate({ hijri: null, gregorian: null, dateObject: null });
//     setShowLegalSection(false);
//     setShowTopicData(false);
//     setEditTopic(null);
//     setEditTopicIndex(null);
//     close();
//   };

//   const handleAddTopic = async () => {
//     console.log("[🔥 ADD TOPIC] Current form values:", getValues());
//     console.log("[🔥 ADD TOPIC] Current caseTopics before add:", caseTopics);

//     const result = saveTopic();
//     if (result === 1) {
//       console.log("[✅ ADD TOPIC] Topic successfully added. New caseTopics:", caseTopics);

//       reset();
//       setDate({ hijri: null, gregorian: null, dateObject: null });
//       setShowLegalSection(false);
//       setShowTopicData(false);
//       setEditTopic(null);
//       setEditTopicIndex(null);
//     }
//     else {
//       console.warn("[⚠️ ADD TOPIC] Validation failed. Not adding topic.");
//     }
//   };

//   useEffect(() => {
//     // Don't interfere with prefilling when editing
//     if (isEditing) return;

//     if (subCategory?.value && mainCategory?.value) {
//       goToLegalStep();
//     }
//   }, [subCategory?.value, mainCategory?.value, isEditing]);

//   const [triggerCaseDetailsQuery, { data: caseDetailsData }] = useLazyGetCaseDetailsQuery();
  
//   // Lookups
//   const lookup = useLookup();
//   const {
//     data: mainCategoryData,
//     isFetching,
//     isLoading,
//   } = lookup.mainCategory(isOpen);

//   // Removed duplicate subCategory call - using useSubTopicsSubLookupQuery instead
//   const { data: amountPaidData } = lookup.amountPaidCategory(subCategory?.value);
//   const { data: travelingWayData } = lookup.travelingWayCategory(subCategory?.value);
//   const { data: leaveTypeData } = lookup.leaveTypeCategory(subCategory?.value);
//   const { data: forAllowanceData } = lookup.forAllowance(subCategory?.value);
//   const { data: typeOfRequestLookupData } = lookup.typeOfRequest(subCategory?.value);
//   const { data: commissionTypeLookupData } = lookup.commissionType(subCategory?.value);
//   const { data: accordingToAgreementLookupData } = lookup.accordingToAgreement(subCategory?.value);
//   const { data: typesOfPenaltiesData } = lookup.typesOfPenalties(subCategory?.value);
//   const { data: payIncreaseTypeData } = lookup.payIncreaseType(subCategory?.value);
  
//   // typeOfCustodyData is not available in lookup, will be undefined
//   const typeOfCustodyData = undefined;

//   const PayIncreaseTypeOptions = useMemo<Option[]>(
//     () =>
//       payIncreaseTypeData?.DataElements?.map((item: any) => ({
//         value: item.ElementKey,
//         label: item.ElementValue,
//       })) || [],
//     [payIncreaseTypeData]
//   );

//   // helper (put it near your other utils)
//   const toOption = (list: any[] | undefined, code?: string) => {
//     if (!code) return null;
//     const hit = list?.find((i) => String(i.ElementKey) === String(code));
//     return hit
//       ? { value: String(hit.ElementKey), label: hit.ElementValue }
//       : { value: String(code), label: String(code) }; // temp fallback
//   };

//   // inside EditHearingTopicsDetails component
//   useEffect(() => {
//     // 1) get the current code (from editTopic or the form)
//     const code =
//       getValues("accordingToAgreement")?.value ||
//       editTopic?.AccordingToAgreement_Code ||
//       editTopic?.AccordingToAgreement ||
//       editTopic?.accordingToAgreement?.value;

//     if (!code) return;

//     // 2) only run when lookup is ready
//     const list = accordingToAgreementLookupData?.DataElements;
//     if (!list) return;

//     // 3) if the label is already correct, skip
//     const curr = getValues("accordingToAgreement");
//     if (curr?.label && curr.label !== curr.value) return;

//     // 4) update the field with the resolved label
//     setValue("accordingToAgreement", toOption(list, code), {
//       shouldDirty: false,
//       shouldValidate: false,
//     });
//   }, [accordingToAgreementLookupData?.DataElements, editTopic, getValues, setValue]);

//   const { data: regionData, isFetching: isRegionLoading } = useGetRegionLookupDataQuery({
//     AcceptedLanguage: currentLanguage,
//     context: "worker", // Always use WorkerRegion
//   });

//   const subTopicsLookupParams = useMemo(() => {
//     const base: any = {
//       LookupType: "CaseElements",
//       ModuleKey: mainCategory?.value,
//       ModuleName: "SubTopics",
//       SourceSystem: "E-Services",
//       AcceptedLanguage: currentLanguage,
//     };
//     if (caseDetailsData?.CaseDetails) {
//       base.PlaintiffID = caseDetailsData.CaseDetails.PlaintiffId;
//       base.Number700 = caseDetailsData.CaseDetails.Defendant_Number700;
//       base.DefendantType = caseDetailsData.CaseDetails.DefendantType;
//     }
//     return base;
//   }, [mainCategory?.value, currentLanguage, caseDetailsData?.CaseDetails]);

//   const { data: subCategoryData, isFetching: isSubCategoryLoading } = useSubTopicsSubLookupQuery(subTopicsLookupParams, {
//     skip: !mainCategory?.value || !caseDetailsData?.CaseDetails,
//   });

//   const [triggerFileDetails, { data: fileBase64 }] = useLazyGetFileDetailsQuery();
//   const {
//     attachments,
//     attachmentFiles,
//     previewFile,
//     showAttachmentModal,
//     handleAttachmentSave,
//     handleViewAttachment,
//     openAttachmentModal,
//     closeAttachmentModal,
//     closePreview,
//     setAttachments,
//     setAttachmentFiles,
//   } = useAttachments({ triggerFileDetails, fileBase64 });

//   const [topicData, setTopicData] = useState<any>(null);
//   const [legalSection, setLegalSection] = useState<any>(null);
//   const [fileKey, setFileKey] = useState("");
//   const [fileName, setFileName] = useState("");
//   const [previewFileModule, setPreviewFile] = useState(false);
//   const [localPreviewBase64, setLocalPreviewBase64] = useState<string | null>(null);
//   const [attachmentsModule, setAttachmentsModule] = useState<any[]>();

//   const handleView = async (attachment: any) => {
//     if (attachment.FileKey) {
//       setFileKey(attachment.FileKey);
//       setFileName(attachment.FileName);
//       setPreviewFile(true);
//       setLocalPreviewBase64(null);
//       await triggerFileDetails({
//         AttachmentKey: attachment.FileKey,
//         AcceptedLanguage: i18n.language.toUpperCase(),
//       });
//     } else if (attachment.base64) {
//       setFileName(attachment.FileName);
//       setLocalPreviewBase64(attachment.base64);
//       setPreviewFile(true);
//     }
//   };

//   // Add the missing functions from edit-index.tsx
//   const handleTopicSelect = (topic: any, index: number) => {
//     console.log("[🔍 EDIT TOPIC] Starting prefill for topic:", {
//       SubTopicID: topic.SubTopicID,
//       MainTopicID: topic.MainTopicID,
//       index,
//       topicKeys: Object.keys(topic)
//     });

//     // Reset form first to clear any previous data
//     reset();

//     // Reset prefill ref when selecting a new topic
//     prefillDoneRef.current = null;

//     // --- Normalize mainCategory and subCategory to always be objects ---
//     const mainCategoryOpt = typeof topic.mainCategory === "string"
//       ? { value: topic.mainCategory, label: topic.mainCategory }
//       : topic.mainCategory ?? { value: topic.MainTopicID, label: topic.CaseTopicName };
//     setValue("mainCategory", mainCategoryOpt);

//     const subCategoryOpt = typeof topic.subCategory === "string"
//       ? { value: topic.subCategory, label: topic.subCategory }
//       : topic.subCategory ?? { value: topic.SubTopicID, label: topic.SubTopicName };
//     setValue("subCategory", subCategoryOpt);

//     // Set the edit topic with the original topic data
//     setEditTopic(topic);
//     setEditTopicIndex(index);

//     // Show appropriate sections
//     setShowLegalSection(true);
//     setShowTopicData(true);
//     toggle();

//     // Use the centralized subtopic prefill handler
//     setTimeout(() => {
//       console.log("[🔍 EDIT TOPIC] Using centralized prefill handler");
//       // prefillSubTopic(); // TODO: Add this function
//     }, 100);
//   };

//   // Placeholder for saveTopic function - will be added next
//   const saveTopic = (): number => {
//     const newTopic = getValues();

//     // التحقق من القيم الفارغة
//     for (const [key, value] of Object.entries(newTopic)) {
//       if (
//         value === "" &&
//         key !== "housingSpecificationsInContract" &&
//         key !== "actualHousingSpecifications" &&
//         key !== "housingSpecificationInByLaws" &&
//         key !== "regulatoryText"
//       ) {
//         return 0;
//       }
//     }

//     // // التحقق من تكرار الموضوع
//     // const isDuplicate = caseTopics.some(
//     //   (topic) =>
//     //     topic.SubTopicID === newTopic.subCategory.value &&
//     //     topic.MainTopicID === newTopic.mainCategory.value &&
//     //     // استثناء الموضوع الحالي في حالة التعديل
//     //     (!editTopic ||
//     //       topic.SubTopicID !== editTopic?.subCategory.value ||
//     //       topic.MainTopicID !== editTopic?.mainCategory.value)
//     // );

//     // if (isDuplicate) {
//     //   toast.error(
//     //     t("duplicate_topic_error") ||
//     //     "This topic is already added. Please choose a different topic."
//     //   );
//     //   return 0;
//     // }

//     // Format dates for storage (remove slashes)
//     const formatDateForStorage = (date: string) => {
//       if (!date) return "";
//       return date.replace(/\//g, "");
//     };

//     const topicToSave = {
//       ...newTopic,
//       MainTopicID: newTopic.mainCategory.value,
//       SubTopicID: newTopic.subCategory.value,
//       MainSectionHeader: newTopic.mainCategory.label,
//       SubTopicName: newTopic?.subCategory.label,
//       CaseTopicName: newTopic?.mainCategory.label,
//       Date_New: newTopic.date_hijri,
//       ManDecsDate: newTopic.manDecsDate,
//       // Only send string codes for FromLocation and ToLocation
//       FromLocation:
//         newTopic?.fromLocation?.value || newTopic?.fromLocation || "",
//       ToLocation: newTopic?.toLocation?.value || newTopic?.toLocation || "",
//       fromJob: newTopic.fromJob || "",
//       toJob: newTopic.toJob || "",
//       Amount: newTopic.amount,
//       PayDue: newTopic.payDue,
//       DurationOfLeaveDue: newTopic.durationOfLeaveDue,
//       WagesAmount: newTopic.wagesAmount,
//       CompensationAmount: newTopic.compensationAmount,
//       InjuryType: newTopic.injuryType,
//       BonusAmount: newTopic.bonusAmount,
//       AccordingToAgreement:
//         newTopic?.accordingToAgreement?.value ||
//         newTopic?.accordingToAgreement ||
//         "",
//       OtherCommission: newTopic.otherCommission,
//       AmountOfCompensation: newTopic.amountOfCompensation,
//       DamagedValue: newTopic.damagedValue,
//       RequiredJobTitle: newTopic.requiredJobTitle,
//       CurrentJobTitle: newTopic.currentJobTitle,
//       DamagedType: newTopic.damagedType,
//       CurrentInsuranceLevel: newTopic.currentInsuranceLevel,
//       TheReason: newTopic.theReason,
//       TheWantedJob: newTopic.theWantedJob,
//       CurrentPosition: newTopic.currentPosition,
//       TypeOfCustody: newTopic.typeOfCustody,
//       AmountsPaidFor: newTopic.amountsPaidFor,
//       GregorianDate: newTopic.gregorianDate,
//       DecisionNumber: newTopic.decisionNumber,
//       RegionCode: newTopic.DefendantsEstablishmentRegion,
//       CityCode: newTopic.DefendantsEstablishmentCity,
//       OccupationCode: newTopic.DefendantsEstablishOccupation,
//       GenderCode: newTopic.DefendantsEstablishmentGender,
//       NationalityCode: newTopic.DefendantsEstablishmentNationality,
//       PrisonerId: newTopic.DefendantsEstablishmentPrisonerId,
//       ForAllowance:
//         newTopic?.forAllowance?.value || newTopic?.forAllowance || "",
//       RewardType: newTopic.rewardType,
//       Consideration: newTopic.consideration,
//       TravelingWay:
//         newTopic?.travelingWay?.value || newTopic?.travelingWay || "",
//       PenalityType:
//         newTopic.typesOfPenalties?.value || newTopic.typesOfPenalties || "",
//       LoanAmount: newTopic.loanAmount,
//       ManagerialDecisionNumber: newTopic.managerialDecisionNumber,
//       ManagerialDecisionDateHijri: formatDateForStorage(
//         newTopic.managerial_decision_date_hijri
//       ),
//       ManagerialDecisionDateGregorian: formatDateForStorage(
//         newTopic.managerial_decision_date_gregorian
//       ),
//       TypesOfPenalties:
//         newTopic.typesOfPenalties?.value || newTopic.typesOfPenalties || "",
//       TypesOfPenaltiesLabel: newTopic.typesOfPenalties?.label || "",
//       // --- Normalize kindOfHoliday for CMR-5 ---
//       kindOfHoliday:
//         newTopic.subCategory?.value === "CMR-5"
//           ? newTopic.kindOfHoliday && typeof newTopic.kindOfHoliday === "object"
//             ? newTopic.kindOfHoliday
//             : newTopic.kindOfHoliday
//               ? {
//                 value: newTopic.kindOfHoliday,
//                 label:
//                   (leaveTypeData?.DataElements || []).find(
//                     (item: any) => item.ElementKey === newTopic.kindOfHoliday
//                   )?.ElementValue || newTopic.kindOfHoliday,
//               }
//               : null
//           : newTopic.kindOfHoliday && typeof newTopic.kindOfHoliday === "object"
//             ? newTopic.kindOfHoliday
//             : newTopic.kindOfHoliday
//               ? { value: newTopic.kindOfHoliday, label: newTopic.kindOfHoliday }
//               : null,
//       kindOfHolidayLabel:
//         newTopic.subCategory?.value === "CMR-5"
//           ? typeof newTopic.kindOfHoliday === "object"
//             ? newTopic.kindOfHoliday.label
//             : (leaveTypeData?.DataElements || []).find(
//               (item: any) => item.ElementKey === newTopic.kindOfHoliday
//             )?.ElementValue ||
//             newTopic.kindOfHoliday ||
//             ""
//           : undefined,
//       totalAmount:
//         newTopic.subCategory?.value === "CMR-5"
//           ? newTopic.totalAmount || ""
//           : undefined,
//       workingHours:
//         newTopic.subCategory?.value === "CMR-5"
//           ? newTopic.workingHours || ""
//           : undefined,
//       additionalDetails:
//         newTopic.subCategory?.value === "CMR-5"
//           ? newTopic.additionalDetails || ""
//           : undefined,
//       // --- END CMR-5 special handling ---
//       // Additional date fields
//       InjuryDateHijri: formatDateForStorage(newTopic.injury_date_hijri),
//       InjuryDateGregorian: formatDateForStorage(newTopic.injury_date_gregorian),
//       RequestDateHijri: formatDateForStorage(newTopic.request_date_hijri),
//       RequestDateGregorian: formatDateForStorage(
//         newTopic.request_date_gregorian
//       ),
//       DateHijri: formatDateForStorage(newTopic.date_hijri),
//       DateGregorian: formatDateForStorage(newTopic.date_gregorian),
//       FromDateHijri: formatDateForStorage(newTopic.from_date_hijri),
//       FromDateGregorian: formatDateForStorage(newTopic.from_date_gregorian),
//       ToDateHijri: formatDateForStorage(newTopic.to_date_hijri),
//       ToDateGregorian: formatDateForStorage(newTopic.to_date_gregorian),
//       // --- EDO-3 Amount Of Reduction save ---
//       amountOfReduction:
//         newTopic.subCategory?.value === "EDO-3"
//           ? newTopic.amountOfReduction || ""
//           : undefined,
//       // ──────────────── EDO SUBTOPICS MAPPING ────────────────
//       // EDO-1: Cancellation of the location transfer decision
//       ...(newTopic.SubTopicID === "EDO-1" && {
//         fromLocation: newTopic.FromLocation_Code
//           ? { value: newTopic.FromLocation_Code, label: newTopic.FromLocation }
//           : null,
//         toLocation: newTopic.ToLocation_Code
//           ? { value: newTopic.ToLocation_Code, label: newTopic.ToLocation }
//           : null,
//         managerial_decision_date_hijri: newTopic.Date_New || "",
//         managerial_decision_date_gregorian: newTopic.ManDecsDate || "",
//         managerialDecisionNumber: newTopic.ManagerialDecisionNumber || "",
//       }),
//       // EDO-2: Cancellation of the job transfer decision
//       ...(newTopic.SubTopicID === "EDO-2" && {
//         fromJob: newTopic.FromJob || "",
//         toJob: newTopic.ToJob || "",
//         managerial_decision_date_hijri: newTopic.Date_New || "",
//         managerial_decision_date_gregorian: newTopic.ManDecsDate || "",
//         managerialDecisionNumber: newTopic.ManagerialDecisionNumber || "",
//       }),
//       // EDO-3: Cancellation of the wage reduction decision
//       ...(newTopic.SubTopicID === "EDO-3" && {
//         amountOfReduction: newTopic.AmountOfReduction || "",
//         managerial_decision_date_hijri: newTopic.pyTempDate || "",
//         managerial_decision_date_gregorian:
//           newTopic.ManagerialDecisionDate_New || "",
//         managerialDecisionNumber: newTopic.ManagerialDecisionNumber || "",
//       }),
//       // EDO-4: Cancellation of disciplinary penalty decision
//       ...(newTopic.SubTopicID === "EDO-4" && {
//         typesOfPenalties: newTopic.PenalityType_Code
//           ? { value: newTopic.PenalityType_Code, label: newTopic.PenalityType }
//           : null,
//         managerial_decision_date_hijri: newTopic.Date_New || "",
//         managerial_decision_date_gregorian: newTopic.ManDecsDate || "",
//         managerialDecisionNumber: newTopic.ManagerialDecisionNumber || "",
//       }),
//       // ──────────────── END EDO SUBTOPICS MAPPING ────────────────
//       // Add correct mapping for WR-2 fields
//       ...(newTopic.SubTopicID === "WR-2"
//         ? {
//           amount: newTopic.OverdueWagesAmount || "",
//           from_date_hijri: newTopic.pyTempDate || "",
//           from_date_gregorian: newTopic.FromDate_New || "",
//           to_date_hijri: newTopic.Date_New || "",
//           to_date_gregorian: newTopic.ToDate_New || "",
//         }
//         : {}),
//       // ──────────────── MIR SUBTOPICS MAPPING ────────────────
//       ...(newTopic.SubTopicID === "MIR-1"
//         ? {
//           typeOfRequest: newTopic.typeOfRequest
//             ? {
//               value: newTopic.typeOfRequest.value,
//               label: newTopic.typeOfRequest.label,
//             }
//             : null,
//           requiredDegreeOfInsurance: newTopic.requiredDegreeOfInsurance || "",
//           theReason: newTopic.theReason || "",
//           currentInsuranceLevel: newTopic.currentInsuranceLevel || "",
//         }
//         : {}),
//       // ──────────────── END MIR SUBTOPICS MAPPING ────────────────

//       // ──────────────── TTR SUBTOPICS MAPPING ────────────────
//       ...(newTopic.SubTopicID === "TTR-1"
//         ? {
//           travelingWay: newTopic.TravelingWay_Code
//             ? {
//               value: newTopic.TravelingWay_Code,
//               label: newTopic.TravelingWay,
//             }
//             : null,
//         }
//         : {}),
//       // ──────────────── END TTR SUBTOPICS MAPPING ────────────────

//       // ──────────────── CMR SUBTOPICS MAPPING ────────────────
//       // CMR-1: Treatment refunds
//       ...(newTopic.SubTopicID === "CMR-1" && {
//         amountsPaidFor:
//           newTopic.amountsPaidFor && typeof newTopic.amountsPaidFor === "object"
//             ? newTopic.amountsPaidFor
//             : null,
//         theAmountRequired:
//           newTopic.theAmountRequired !== undefined &&
//             newTopic.theAmountRequired !== null
//             ? String(newTopic.theAmountRequired)
//             : "",
//       }),
//       // CMR-3: Request compensation for work injury
//       ...(newTopic.SubTopicID === "CMR-3" && {
//         compensationAmount:
//           newTopic.compensationAmount !== undefined &&
//             newTopic.compensationAmount !== null
//             ? String(newTopic.compensationAmount)
//             : "",
//         injury_date_hijri: newTopic.injury_date_hijri ?? "",
//         injury_date_gregorian: newTopic.injury_date_gregorian ?? "",
//         injuryType: newTopic.injuryType ?? "",
//       }),
//       // CMR-4: Request compensation for the duration of the notice
//       ...(newTopic.subCategory?.value === "CMR-4" && {
//         amount:
//           newTopic.noticeCompensationAmount !== undefined && newTopic.noticeCompensationAmount !== null
//             ? String(newTopic.noticeCompensationAmount)
//             : "",
//       }),
//       // CMR-5: Pay for work during vacation
//       ...(newTopic.SubTopicID === "CMR-5" && {
//         kindOfHoliday:
//           newTopic.kindOfHoliday && typeof newTopic.kindOfHoliday === "object"
//             ? newTopic.kindOfHoliday
//             : null,
//         totalAmount:
//           newTopic.totalAmount !== undefined && newTopic.totalAmount !== null
//             ? String(newTopic.totalAmount)
//             : "",
//         workingHours:
//           newTopic.workingHours !== undefined && newTopic.workingHours !== null
//             ? String(newTopic.workingHours)
//             : "",
//         additionalDetails: newTopic.additionalDetails ?? "",
//       }),
//       // CMR-6: The Wage Difference/increase
//       ...(newTopic.SubTopicID === "CMR-6" && {
//         from_date_hijri: newTopic.from_date_hijri ?? "",
//         from_date_gregorian: newTopic.from_date_gregorian ?? "",
//         to_date_hijri: newTopic.to_date_hijri ?? "",
//         to_date_gregorian: newTopic.to_date_gregorian ?? "",
//         newPayAmount: newTopic.newPayAmount != null ? String(newTopic.newPayAmount) : "",
//         payIncreaseType: (newTopic.payIncreaseType && typeof newTopic.payIncreaseType === "object") ? newTopic.payIncreaseType : null,
//         wageDifference: newTopic.wageDifference != null ? String(newTopic.wageDifference) : "",
//       }),

//       // CMR-7: Request for overtime pay
//       ...(newTopic.SubTopicID === "CMR-7" && {
//         pyTempDate: newTopic.pyTempDate ?? "",
//         toDate_gregorian: newTopic.toDate_gregorian ?? "",
//         date_hijri: newTopic.date_hijri ?? "",
//         fromDate_gregorian: newTopic.fromDate_gregorian ?? "",
//         durationOfLeaveDue:
//           newTopic.durationOfLeaveDue !== undefined &&
//             newTopic.durationOfLeaveDue !== null
//             ? String(newTopic.durationOfLeaveDue)
//             : "",
//         payDue:
//           newTopic.payDue !== undefined && newTopic.payDue !== null
//             ? String(newTopic.payDue)
//             : "",
//       }),
//       // CMR-8: Pay stop time
//       ...(newTopic.SubTopicID === "CMR-8" && {
//         pyTempDate: newTopic.pyTempDate ?? "",
//         toDate_gregorian: newTopic.toDate_gregorian ?? "",
//         date_hijri: newTopic.date_hijri ?? "",
//         fromDate_gregorian: newTopic.fromDate_gregorian ?? "",
//         wagesAmount:
//           newTopic.wagesAmount !== undefined && newTopic.wagesAmount !== null
//             ? String(newTopic.wagesAmount)
//             : "",
//       }),
//       // ──────────────── END CMR SUBTOPICS MAPPING ────────────────

//       // ──────────────── BR SUBTOPICS MAPPING ────────────────
//       // BR-1: Bonus Request
//       ...(newTopic.SubTopicID === "BR-1" && {
//         AccordingToAgreement: newTopic.accordingToAgreement?.value ?? "",
//         BonusAmount: newTopic.bonusAmount ?? "",
//         date_hijri: newTopic.date_hijri ?? "",
//         date_gregorian: newTopic.date_gregorian ?? "",
//       }),
//       // ──────────────── END BR SUBTOPICS MAPPING ────────────────

//       // ──────────────── BPSR SUBTOPICS MAPPING ────────────────
//       // BPSR-1: Bonus and Profit Share Request
//       ...(newTopic.SubTopicID === "BPSR-1" && {
//         CommissionType: newTopic.commissionType?.value ?? "",
//         AccordingToAgreement: newTopic.accordingToAgreement?.value ?? "",
//         Amount: newTopic.bonusProfitShareAmount ?? "",
//         AmountRatio: newTopic.amountRatio ?? "",
//         pyTempDate: newTopic.from_date_hijri ?? "",
//         FromDate_New: newTopic.from_date_gregorian ?? "",
//         Date_New: newTopic.to_date_hijri ?? "",
//         ToDate_New: newTopic.to_date_gregorian ?? "",
//         OtherCommission: isOtherCommission(newTopic.commissionType)
//           ? newTopic.otherCommission ?? ""
//           : "",
//       }),

//       // ──────────────── END BPSR SUBTOPICS MAPPING ────────────────

//       // ──────────────── DR SUBTOPICS MAPPING ────────────────
//       // DR-1: Documents Requests
//       ...(newTopic.SubTopicID === "DR-1" && {
//         documentType: newTopic.documentType ?? null,
//         documentReason: newTopic.documentReason ?? "",
//       }),
//       // ──────────────── END DR SUBTOPICS MAPPING ────────────────

//       // ──────────────── RR SUBTOPICS MAPPING ────────────────
//       // RR-1: Reward Request
//       ...(newTopic.SubTopicID === "RR-1" && {
//         amount: newTopic.amount ?? "",
//         rewardType: newTopic.rewardType ?? "",
//       }),
//       // ──────────────── END RR SUBTOPICS MAPPING ────────────────

//       // ──────────────── JAR SUBTOPICS MAPPING ────────────────
//       // JAR-2: Job Application Request (currentJobTitle, requiredJobTitle)
//       ...(newTopic.SubTopicID === "JAR-2" && {
//         currentJobTitle: newTopic.currentJobTitle ?? "",
//         requiredJobTitle: newTopic.requiredJobTitle ?? "",
//       }),
//       // JAR-3: Promotion Mechanism
//       ...(newTopic.SubTopicID === "JAR-3"
//         ? {
//           doesTheInternalRegulationIncludePromotionMechanism:
//             newTopic.doesTheInternalRegulationIncludePromotionMechanism ?? false,
//           doesContractIncludeAdditionalUpgrade:
//             newTopic.doesContractIncludeAdditionalUpgrade ?? false,
//         }
//         : {}),
//       // JAR-4: Job Application Request (currentPosition, theWantedJob)
//       ...(newTopic.SubTopicID === "JAR-4" && {
//         currentPosition: newTopic.currentPosition ?? "",
//         theWantedJob: newTopic.theWantedJob ?? "",
//       }),
//       // ──────────────── END JAR SUBTOPICS MAPPING ────────────────
//       // ──────────────── LRESR SUBTOPICS MAPPING ────────────────
//       // LRESR-1: End of Service Reward
//       ...(newTopic.SubTopicID === "LRESR-1" && {
//         amount: newTopic.amount ?? "",
//       }),
//       // LRESR-2: End of Service Reward (amount, consideration)
//       ...(newTopic.SubTopicID === "LRESR-2" && {
//         amount: newTopic.amount ?? "",
//         consideration: newTopic.consideration ?? "",
//       }),
//       // LRESR-3: End of Service Reward (amount, rewardType)
//       ...(newTopic.SubTopicID === "LRESR-3" && {
//         amount: newTopic.amount ?? "",
//         rewardType: newTopic.rewardType ?? "",
//       }),
//       // ──────────────── END LRESR SUBTOPICS MAPPING ────────────────
//     };

//     // MIR-1: Always save these fields
//     if (newTopic.subCategory?.value === "MIR-1" || newTopic.SubTopicID === "MIR-1") {
//       topicToSave.typeOfRequest = newTopic.typeOfRequest;
//       topicToSave.requiredDegreeOfInsurance = newTopic.requiredDegreeOfInsurance;
//       topicToSave.theReason = newTopic.theReason;
//       topicToSave.currentInsuranceLevel = newTopic.currentInsuranceLevel;
//     }

//     // تحديث حالة caseTopics
//     setCaseTopics((prev) => {
//       const newTopics = [...prev, topicToSave];
//       return newTopics;
//     });

//     // إضافة رسالة نجاح
//     toast.success(t("topic_added_successfully") || "Topic added successfully");

//     return 1;
//   };
//   // Placeholder for handleUpdate function - will be added next
//   const handleUpdate = () => {
//     if (!editTopic) return;

//     const updatedValues = getValues();
//     console.log("[📝 UPDATE TOPIC] Original topic:", editTopic);
//     console.log("[📝 UPDATE TOPIC] New form values:", updatedValues);
//     console.log("[📝 UPDATE TOPIC] otherAllowance value:", updatedValues.otherAllowance);
//     console.log("[📝 UPDATE TOPIC] forAllowance value:", updatedValues.forAllowance);

//     const mainCategoryValue =
//       updatedValues.mainCategory?.value ||
//       editTopic?.MainTopicID ||
//       editTopic?.mainCategory?.value;
//     const mainCategoryLabel =
//       updatedValues.mainCategory?.label ||
//       editTopic?.MainSectionHeader ||
//       editTopic?.mainCategory?.label;
//     const subCategoryValue =
//       updatedValues.subCategory?.value ||
//       editTopic?.SubTopicID ||
//       editTopic?.subCategory?.value;
//     const subCategoryLabel =
//       updatedValues.subCategory?.label ||
//       editTopic?.SubTopicName ||
//       editTopic?.subCategory?.label;

//     const formatDateForStorage = (date: string) =>
//       date ? date.replace(/\//g, "") : "";

//     // Base topic structure
//     const updatedTopic: any = {
//       MainTopicID: mainCategoryValue,
//       SubTopicID: subCategoryValue,
//       MainSectionHeader: mainCategoryLabel,
//       SubTopicName: subCategoryLabel,
//       CaseTopicName: mainCategoryLabel,
//       subCategory: { value: subCategoryValue, label: subCategoryLabel },
//       mainCategory: { value: mainCategoryValue, label: mainCategoryLabel },
//       acknowledged: updatedValues.acknowledged || editTopic?.acknowledged,
//     };

//     // ==================== SUBTOPIC-SPECIFIC HANDLERS ====================

//     // WR-1: Worker Rights - Salary Payment
//     if (subCategoryValue === "WR-1") {
//       const {
//         forAllowance,
//         otherAllowance,
//         wageAmount,
//         from_date_hijri,
//         from_date_gregorian,
//         to_date_hijri,
//         to_date_gregorian,
//       } = updatedValues;

//       console.log("[📝 UPDATE TOPIC] WR-1 Debug - forAllowance:", forAllowance);
//       console.log("[📝 UPDATE TOPIC] WR-1 Debug - otherAllowance:", otherAllowance);

//       Object.assign(updatedTopic, {
//         ForAllowance: forAllowance?.label ?? "",
//         ForAllowance_Code: forAllowance?.value ?? "",
//         OtherAllowance: otherAllowance ?? "",
//         Amount: wageAmount ?? "",
//         FromDateHijri: formatDateForStorage(from_date_hijri),
//         FromDateGregorian: formatDateForStorage(from_date_gregorian),
//         ToDateHijri: formatDateForStorage(to_date_hijri),
//         ToDateGregorian: formatDateForStorage(to_date_gregorian),
//       });

//       console.log("[📝 UPDATE TOPIC] WR-1 Debug - Final OtherAllowance:", updatedTopic.OtherAllowance);
//     }

//     // WR-2: Worker Rights - Overdue Wages
//     else if (subCategoryValue === "WR-2") {
//       const {
//         wageAmount,
//         from_date_hijri,
//         from_date_gregorian,
//         to_date_hijri,
//         to_date_gregorian,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         Amount: wageAmount ?? "",
//         FromDateHijri: formatDateForStorage(from_date_hijri),
//         FromDateGregorian: formatDateForStorage(from_date_gregorian),
//         ToDateHijri: formatDateForStorage(to_date_hijri),
//         ToDateGregorian: formatDateForStorage(to_date_gregorian),
//       });
//     }

//     // BPSR-1: Bonus and Profit Share Request
//     else if (subCategoryValue === "BPSR-1") {
//       const {
//         commissionType,
//         accordingToAgreement,
//         bonusProfitShareAmount,
//         amountRatio,
//         from_date_hijri,
//         from_date_gregorian,
//         to_date_hijri,
//         to_date_gregorian,
//         otherCommission,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         CommissionType: commissionType?.label ?? "",
//         CommissionType_Code: commissionType?.value ?? "",
//         AccordingToAgreement: accordingToAgreement?.label ?? "",
//         AccordingToAgreement_Code: accordingToAgreement?.value ?? "",
//         Amount: bonusProfitShareAmount ?? "",
//         AmountRatio: amountRatio ?? "",
//         pyTempDate: formatDateForStorage(from_date_hijri),
//         FromDate_New: formatDateForStorage(from_date_gregorian),
//         Date_New: formatDateForStorage(to_date_hijri),
//         ToDate_New: formatDateForStorage(to_date_gregorian),
//         OtherCommission: otherCommission ?? "",
//       });
//     }

//     // MIR-1: Medical Insurance Request
//     else if (subCategoryValue === "MIR-1") {
//       const {
//         typeOfRequest,
//         requiredDegreeOfInsurance,
//         theReason,
//         currentInsuranceLevel,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         RequestType: typeOfRequest?.label ?? "",
//         RequestType_Code: typeOfRequest?.value ?? "",
//         RequiredDegreeInsurance: requiredDegreeOfInsurance ?? "",
//         Reason: theReason ?? "",
//         CurrentInsuranceLevel: currentInsuranceLevel ?? "",
//       });
//     }

//     // CMR-1: Compensation Request - Amounts Paid For
//     else if (subCategoryValue === "CMR-1") {
//       const {
//         amountsPaidFor,
//         theAmountRequired,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         AmountsPaidFor: amountsPaidFor?.label ?? "",
//         AmountsPaidFor_Code: amountsPaidFor?.value ?? "",
//         AmountRequired: theAmountRequired ?? "",
//       });
//     }

//     // CMR-3: Compensation Request - Work Injury
//     else if (subCategoryValue === "CMR-3") {
//       const {
//         compensationAmount,
//         injury_date_hijri,
//         injury_date_gregorian,
//         injuryType,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         Amount: compensationAmount ?? "",
//         InjuryDateHijri: formatDateForStorage(injury_date_hijri),
//         InjuryDateGregorian: formatDateForStorage(injury_date_gregorian),
//         TypeOfWorkInjury: injuryType ?? "",
//       });
//     }

//     // CMR-4: Compensation Request - General
//     else if (subCategoryValue === "CMR-4") {
//       const {
//         noticeCompensationAmount,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         Amount: noticeCompensationAmount ?? "",
//       });
//     }

//     // CMR-5: Compensation Request - Holiday
//     else if (subCategoryValue === "CMR-5") {
//       const {
//         kindOfHoliday,
//         totalAmount,
//         workingHours,
//         additionalDetails,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         KindOfHoliday: kindOfHoliday?.label ?? "",
//         KindOfHoliday_Code: kindOfHoliday?.value ?? "",
//         TotalAmount: totalAmount ?? "",
//         WorkingHours: workingHours ?? "",
//         AdditionalDetails: additionalDetails ?? "",
//       });
//     }

//     // CMR-6: Compensation Request - Pay Increase
//     else if (subCategoryValue === "CMR-6") {
//       const {
//         newPayAmount,
//         payIncreaseType,
//         from_date_hijri,
//         from_date_gregorian,
//         to_date_hijri,
//         to_date_gregorian,
//         wageDifference,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         NewPayAmount: newPayAmount ?? "",
//         PayIncreaseType: payIncreaseType?.label ?? "",
//         PayIncreaseType_Code: payIncreaseType?.value ?? "",
//         FromDateHijri: formatDateForStorage(from_date_hijri),
//         FromDateGregorian: formatDateForStorage(from_date_gregorian),
//         ToDateHijri: formatDateForStorage(to_date_hijri),
//         ToDateGregorian: formatDateForStorage(to_date_gregorian),
//         WageDifference: wageDifference ?? "",
//       });
//     }

//     // CMR-7: Compensation Request - Leave
//     else if (subCategoryValue === "CMR-7") {
//       const {
//         from_date_hijri,
//         from_date_gregorian,
//         to_date_hijri,
//         to_date_gregorian,
//         durationOfLeaveDue,
//         payDue,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         FromDateHijri: formatDateForStorage(from_date_hijri),
//         FromDateGregorian: formatDateForStorage(from_date_gregorian),
//         ToDateHijri: formatDateForStorage(to_date_hijri),
//         ToDateGregorian: formatDateForStorage(to_date_gregorian),
//         DurationOfLeaveDue: durationOfLeaveDue ?? "",
//         PayDue: payDue ?? "",
//       });
//     }

//     // CMR-8: Compensation Request - Wages
//     else if (subCategoryValue === "CMR-8") {
//       const {
//         wagesAmount,
//         from_date_hijri,
//         from_date_gregorian,
//         to_date_hijri,
//         to_date_gregorian,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         WagesAmount: wagesAmount ?? "",
//         FromDateHijri: formatDateForStorage(from_date_hijri),
//         FromDateGregorian: formatDateForStorage(from_date_gregorian),
//         ToDateHijri: formatDateForStorage(to_date_hijri),
//         ToDateGregorian: formatDateForStorage(to_date_gregorian),
//       });
//     }

//     // BR-1: Bonus Request
//     else if (subCategoryValue === "BR-1") {
//       const {
//         accordingToAgreement,
//         amount,
//         from_date_hijri,
//         from_date_gregorian,
//         to_date_hijri,
//         to_date_gregorian,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         AccordingToAgreement: accordingToAgreement?.label ?? "",
//         AccordingToAgreement_Code: accordingToAgreement?.value ?? "",
//         Amount: amount ?? "",
//         FromDateHijri: formatDateForStorage(from_date_hijri),
//         FromDateGregorian: formatDateForStorage(from_date_gregorian),
//         ToDateHijri: formatDateForStorage(to_date_hijri),
//         ToDateGregorian: formatDateForStorage(to_date_gregorian),
//       });
//     }

//     // EDO-1: Establishment Decision - Location
//     else if (subCategoryValue === "EDO-1") {
//       const {
//         fromLocation,
//         toLocation,
//         managerial_decision_date_hijri,
//         managerial_decision_date_gregorian,
//         managerialDecisionNumber,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         FromLocation: fromLocation?.label ?? "",
//         FromLocation_Code: fromLocation?.value ?? "",
//         ToLocation: toLocation?.label ?? "",
//         ToLocation_Code: toLocation?.value ?? "",
//         ManagerialDecisionDateHijri: formatDateForStorage(managerial_decision_date_hijri),
//         ManagerialDecisionDateGregorian: formatDateForStorage(managerial_decision_date_gregorian),
//         ManagerialDecisionNumber: managerialDecisionNumber ?? "",
//       });
//     }

//     // EDO-2: Establishment Decision - Job
//     else if (subCategoryValue === "EDO-2") {
//       const {
//         fromJob,
//         toJob,
//         managerial_decision_date_hijri,
//         managerial_decision_date_gregorian,
//         managerialDecisionNumber,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         FromJob: fromJob ?? "",
//         ToJob: toJob ?? "",
//         ManagerialDecisionDateHijri: formatDateForStorage(managerial_decision_date_hijri),
//         ManagerialDecisionDateGregorian: formatDateForStorage(managerial_decision_date_gregorian),
//         ManagerialDecisionNumber: managerialDecisionNumber ?? "",
//       });
//     }

//     // EDO-3: Establishment Decision - Reduction
//     else if (subCategoryValue === "EDO-3") {
//       const {
//         amountOfReduction,
//         managerial_decision_date_hijri,
//         managerial_decision_date_gregorian,
//         managerialDecisionNumber,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         AmountOfReduction: amountOfReduction ?? "",
//         ManagerialDecisionDateHijri: formatDateForStorage(managerial_decision_date_hijri),
//         ManagerialDecisionDateGregorian: formatDateForStorage(managerial_decision_date_gregorian),
//         ManagerialDecisionNumber: managerialDecisionNumber ?? "",
//       });
//     }

//     // EDO-4: Establishment Decision - Penalty
//     else if (subCategoryValue === "EDO-4") {
//       const {
//         typesOfPenalties,
//         managerial_decision_date_hijri,
//         managerial_decision_date_gregorian,
//         managerialDecisionNumber,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         TypesOfPenalties: typesOfPenalties?.label ?? "",
//         TypesOfPenalties_Code: typesOfPenalties?.value ?? "",
//         ManagerialDecisionDateHijri: formatDateForStorage(managerial_decision_date_hijri),
//         ManagerialDecisionDateGregorian: formatDateForStorage(managerial_decision_date_gregorian),
//         ManagerialDecisionNumber: managerialDecisionNumber ?? "",
//       });
//     }

//     // HIR-1: Housing and Internal Regulations
//     else if (subCategoryValue === "HIR-1") {
//       const {
//         doesBylawsIncludeAddingAccommodations,
//         doesContractIncludeAddingAccommodations,
//         housingSpecificationInByLaws,
//         housingSpecificationsInContract,
//         actualHousingSpecifications,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         DoesBylawsIncludeAddingAccommodations: doesBylawsIncludeAddingAccommodations ?? false,
//         DoesContractIncludeAddingAccommodations: doesContractIncludeAddingAccommodations ?? false,
//         HousingSpecificationInByLaws: housingSpecificationInByLaws ?? "",
//         HousingSpecificationsInContract: housingSpecificationsInContract ?? "",
//         ActualHousingSpecifications: actualHousingSpecifications ?? "",
//       });
//     }

//     // JAR-2: Job and Assignment Request - Title
//     else if (subCategoryValue === "JAR-2") {
//       const {
//         currentJobTitle,
//         requiredJobTitle,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         CurrentJobTitle: currentJobTitle ?? "",
//         RequiredJobTitle: requiredJobTitle ?? "",
//       });
//     }

//     // JAR-3: Job and Assignment Request - Promotion
//     else if (subCategoryValue === "JAR-3") {
//       const {
//         doesTheInternalRegulationIncludePromotionMechanism,
//         doesContractIncludeAdditionalUpgrade,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         DoesTheInternalRegulationIncludePromotionMechanism: doesTheInternalRegulationIncludePromotionMechanism ?? false,
//         DoesContractIncludeAdditionalUpgrade: doesContractIncludeAdditionalUpgrade ?? false,
//       });
//     }

//     // JAR-4: Job and Assignment Request - Position
//     else if (subCategoryValue === "JAR-4") {
//       const {
//         currentPosition,
//         theWantedJob,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         CurrentPosition: currentPosition ?? "",
//         TheWantedJob: theWantedJob ?? "",
//       });
//     }

//     // LRESR-1: Labor Relations and Employment Service Request
//     else if (subCategoryValue === "LRESR-1") {
//       const {
//         amount,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         Amount: amount ?? "",
//       });
//     }

//     // TTR-1: Travel and Transportation Request
//     else if (subCategoryValue === "TTR-1") {
//       const {
//         travelingWay,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         TravelingWay: travelingWay?.label ?? "",
//         TravelingWay_Code: travelingWay?.value ?? "",
//       });
//     }

//     // RFR-1: Reward and Financial Request
//     else if (subCategoryValue === "RFR-1") {
//       const {
//         amount,
//         consideration,
//         date_hijri,
//         date_gregorian,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         Amount: amount ?? "",
//         Consideration: consideration ?? "",
//         DateHijri: formatDateForStorage(date_hijri),
//         DateGregorian: formatDateForStorage(date_gregorian),
//       });
//     }

//     // RR-1: Reward Request
//     else if (subCategoryValue === "RR-1") {
//       const {
//         amount,
//         rewardType,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         Amount: amount ?? "",
//         RewardType: rewardType ?? "",
//       });
//     }

//     // LCUT-1: Labor Contract and Unemployment Termination
//     else if (subCategoryValue === "LCUT-1") {
//       const {
//         amountOfCompensation,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         AmountOfCompensation: amountOfCompensation ?? "",
//       });
//     }

//     // DR-1: Damages Request
//     else if (subCategoryValue === "DR-1") {
//       const {
//         damagedValue,
//         damagedType,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         DamagedValue: damagedValue ?? "",
//         DamagedType: damagedType ?? "",
//       });
//     }

//     // CR-1: Custody Request
//     else if (subCategoryValue === "CR-1") {
//       const {
//         typeOfCustody,
//         amount,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         TypeOfCustody: typeOfCustody?.label ?? "",
//         TypeOfCustody_Code: typeOfCustody?.value ?? "",
//         Amount: amount ?? "",
//       });
//     }

//     // LCUTE-1: Labor Contract and Unemployment Termination - Establishment
//     else if (subCategoryValue === "LCUTE-1") {
//       const {
//         amountOfCompensation,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         AmountOfCompensation: amountOfCompensation ?? "",
//       });
//     }

//     // DPVR-1: Damages and Property Value Request
//     else if (subCategoryValue === "DPVR-1") {
//       const {
//         damagedValue,
//         damagedType,
//         amountOfCompensation,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         DamagedValue: damagedValue ?? "",
//         DamagedType: damagedType ?? "",
//         AmountOfCompensation: amountOfCompensation ?? "",
//       });
//     }

//     // AWRW-1: Additional Worker Rights and Wages
//     else if (subCategoryValue === "AWRW-1") {
//       const {
//         amount,
//         from_date_hijri,
//         from_date_gregorian,
//         to_date_hijri,
//         to_date_gregorian,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         Amount: amount ?? "",
//         FromDateHijri: formatDateForStorage(from_date_hijri),
//         FromDateGregorian: formatDateForStorage(from_date_gregorian),
//         ToDateHijri: formatDateForStorage(to_date_hijri),
//         ToDateGregorian: formatDateForStorage(to_date_gregorian),
//       });
//     }

//     // AWRW-2: Additional Worker Rights and Wages
//     else if (subCategoryValue === "AWRW-2") {
//       const {
//         amount,
//         from_date_hijri,
//         from_date_gregorian,
//         to_date_hijri,
//         to_date_gregorian,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         Amount: amount ?? "",
//         FromDateHijri: formatDateForStorage(from_date_hijri),
//         FromDateGregorian: formatDateForStorage(from_date_gregorian),
//         ToDateHijri: formatDateForStorage(to_date_hijri),
//         ToDateGregorian: formatDateForStorage(to_date_gregorian),
//       });
//     }

//     // RLRAHI-1: Regional Labor Relations and Additional Housing Information
//     else if (subCategoryValue === "RLRAHI-1") {
//       const {
//         fromLocation,
//         toLocation,
//         managerial_decision_date_hijri,
//         managerial_decision_date_gregorian,
//         managerialDecisionNumber,
//         additionalDetails,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         FromLocation: fromLocation?.label ?? "",
//         FromLocation_Code: fromLocation?.value ?? "",
//         ToLocation: toLocation?.label ?? "",
//         ToLocation_Code: toLocation?.value ?? "",
//         ManagerialDecisionDateHijri: formatDateForStorage(managerial_decision_date_hijri),
//         ManagerialDecisionDateGregorian: formatDateForStorage(managerial_decision_date_gregorian),
//         ManagerialDecisionNumber: managerialDecisionNumber ?? "",
//         AdditionalDetails: additionalDetails ?? "",
//       });
//     }

//     // RUF-1: Regional Union Formation
//     else if (subCategoryValue === "RUF-1") {
//       const {
//         fromLocation,
//         toLocation,
//         managerial_decision_date_hijri,
//         managerial_decision_date_gregorian,
//         managerialDecisionNumber,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         FromLocation: fromLocation?.label ?? "",
//         FromLocation_Code: fromLocation?.value ?? "",
//         ToLocation: toLocation?.label ?? "",
//         ToLocation_Code: toLocation?.value ?? "",
//         ManagerialDecisionDateHijri: formatDateForStorage(managerial_decision_date_hijri),
//         ManagerialDecisionDateGregorian: formatDateForStorage(managerial_decision_date_gregorian),
//         ManagerialDecisionNumber: managerialDecisionNumber ?? "",
//       });
//     }

//     // Default case for any unhandled subtopics
//     else {
//       console.warn(`[⚠️ UPDATE TOPIC] No specific handler for subtopic: ${subCategoryValue}`);
//       // Fallback to generic mapping for unhandled subtopics
//       Object.assign(updatedTopic, {
//         ...updatedValues,
//         // Add any common fields that should be mapped for all subtopics
//       });
//     }

//     // ====================================================
//     console.log("[📝 UPDATE TOPIC] Mapped payload to save:", updatedTopic);
//     console.log("[📝 UPDATE TOPIC] otherAllowance in updatedTopic:", updatedTopic.otherAllowance);
//     console.log("[📝 UPDATE TOPIC] forAllowance in updatedTopic:", updatedTopic.forAllowance);

//     setCaseTopics((prev) => {
//       const newTopics = prev.map((topic, idx) => (idx === editTopicIndex ? updatedTopic : topic));
//       console.log("[📝 UPDATE TOPIC] Updated caseTopics:", newTopics);
//       return newTopics;
//     });

//     toast.success(t("topic_updated_successfully") || "Topic updated successfully");
//     console.log("[✅ UPDATE TOPIC] caseTopics after update:", caseTopics);

//     reset();
//     setDate({ hijri: null, gregorian: null, dateObject: null });
//     setShowLegalSection(false);
//     setShowTopicData(false);
//     setEditTopic(null);
//     setEditTopicIndex(null);
//     close();
//   };

//   // Add handleCancel function
//   const handleCancel = () => {
//     reset();
//     setShowLegalSection(false);
//     setShowTopicData(false);
//     setEditTopic(null);
//     close();
//     // Reset prefill ref when modal closes
//     prefillDoneRef.current = null;
//   };

//   // Add handleSave function
//   const handleSave = () => {
//     if (!showLegalSection) {
//       goToLegalStep();
//     } else if (!showTopicData) {
//       goToTopicDataStep();
//     }
//   };

//   // Add lastAction state
//   const [lastAction, setLastAction] = useState<"Save" | "Next" | undefined>(undefined);

//   // Add navigation-related state and functions
//   const { updateParams, currentStep, currentTab } = useNavigationService();
//   const [removeAttachment] = useRemoveAttachmentMutation();

//   // Add handleNext function
//   const handleNext = async () => {
//     const latestFormValues = getValues();
//     setFormData(latestFormValues);
//     try {
//       setLastAction("Next");
//       const payload = getPayloadBySubTopicID(
//         caseTopics,
//         subCategory,
//         "Next",
//         caseId
//       );

//       const response = await updateHearingTopics(payload).unwrap();

//       // Use centralized error handling
//       const isSuccessful = handleResponse(response);

//       if (isSuccessful) {
//         // Only navigate if the API call is successful
//         updateParams(currentStep + 1, 0);
//       }
//       // Errors are automatically handled by the centralized error handler
//     } catch (error: any) {
//       setLastAction(undefined);
//       const errorMessage = error?.message || t("api_error_generic");
//       toast.error(errorMessage);
//     }
//   };

//   // Add handlePrevious function
//   const handlePrevious = useCallback(() => {
//     if (currentStep === 1) {
//       updateParams(0, [0, 1, 2].length - 1);
//     } else {
//       updateParams(
//         currentStep === 0 ? 0 : currentStep - 1,
//         Math.max(currentTab - 1, 0)
//       );
//     }
//   }, [currentStep, currentTab, updateParams]);

//   // Add handleRemoveAttachment function
//   const handleRemoveAttachment = async (attachment: any, index: number) => {
//     try {
//       await removeAttachment({
//         AttachmentKey: attachment.FileKey,
//         AcceptedLanguage: i18n.language.toUpperCase(),
//       }).unwrap();

//       setAttachments((prev) => prev.filter((_, i) => i !== index));
//       toast.success(t("attachment_removed_successfully") || "Attachment removed successfully");
//     } catch (error: any) {
//       console.error("[❌ REMOVE ATTACHMENT] Error:", error);
//       toast.error(error?.message || t("remove_attachment_error") || "Failed to remove attachment");
//     }
//   };

//   // Add utility functions
//   const resolveOption = (
//     list: { ElementKey: string; ElementValue: string }[] | undefined,
//     code?: string,
//     fallbackLabel?: string
//   ) => {
//     if (!code) return null;
//     const hit = list?.find((i) => String(i.ElementKey) === String(code));
//     return { value: code, label: hit ? hit.ElementValue : (fallbackLabel ?? code) };
//   };

//   const ensureOption = (
//     opts: { ElementKey: string; ElementValue: string }[] | Option[] | undefined,
//     code?: any,
//     fallbackLabel?: string
//   ): Option | null => {
//     if (!code) return null;
//     const hit = opts?.find((i: any) => {
//       if ('ElementKey' in i) {
//         return String(i.ElementKey) === String(code);
//       } else {
//         return String(i.value) === String(code);
//       }
//     });
    
//     if (hit) {
//       if ('ElementKey' in hit) {
//         return { value: String(hit.ElementKey), label: hit.ElementValue };
//       } else {
//         return { value: String(hit.value), label: hit.label };
//       }
//     }
    
//     return { value: String(code), label: fallbackLabel || String(code) };
//   };

//   const findOption = (options: Option[], value: string): Option | null => {
//     return options.find((option) => option.value === value) || null;
//   };

//   const hijriToGregorian = (hijri: string) => {
//     if (!hijri) return "";
//     try {
//       const date = new DateObject({
//         date: hijri,
//         calendar: arabicCalendar,
//         locale: arabicLocale,
//       });
//       return date.convert(gregorianCalendar, gregorianLocale).format("DD/MM/YYYY");
//     } catch (error) {
//       console.error("Error converting Hijri to Gregorian:", error);
//       return hijri;
//     }
//   };

//   // Placeholder for handleSaveApi function - will be added next
//   const handleSaveApi = async (): Promise<ApiResponse> => {
//     console.log("[📡 SAVE API] Last saved flag before:", lastSaved);
//     const payload = getPayloadBySubTopicID(caseTopics, subCategory, "Save", caseId);
//     console.log("[📡 SAVE API] Payload to send:", payload);

//     try {
//       const response = onSaveApi
//         ? await onSaveApi(payload)
//         : await updateHearingTopics(payload).unwrap();

//       console.log("[📡 SAVE API] Response received:", response);
//       if (
//         response?.SuccessCode === "200" &&
//         (!response?.ErrorCodeList || response?.ErrorCodeList.length === 0)
//       ) {
//         toast.success(t("save_success"));
//         setLastSaved(true);
//       }
//       return response;
//     } catch (error: any) {
//       console.error("[📡 SAVE API] Error during save:", error);
//       toast.error(error?.message || t("save_error"));
//       return Promise.reject(error);
//     }
//   };

//   // Add the columns function
//   const columns: any = useMemo(
//     () =>
//       getHearingTopicsColumns({
//         t,
//         onEdit: (topic, index) => handleTopicSelect(topic, index),
//         onDel: (topic, index) => {
//           setDelTopic({ topic, index });
//           setShowDeleteConfirm(true);
//         },
//       }),
//     [t, toggle]
//   );

//   // Add pagination state
//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 5,
//   });

//   const getPaginatedTopics = useMemo(() => {
//     const start = pagination.pageIndex * pagination.pageSize;
//     const end = start + pagination.pageSize;
//     return caseTopics.slice(start, end);
//   }, [caseTopics, pagination.pageIndex, pagination.pageSize]);

//   // Add the missing functions (saveTopic, handleUpdate, handleSaveApi)
//   // These will be copied from edit-index.tsx in the next step

//   return {
//     methods,
//     caseTopics,
//     setCaseTopics,
//     editTopic,
//     setEditTopic,
//     editTopicIndex,
//     setEditTopicIndex,
//     showLegalSection,
//     setShowLegalSection,
//     showTopicData,
//     setShowTopicData,
//     isEditing,
//     isHIR1,
//     lockAccommodationSource,
//     acknowledged,
//     regulatoryText,
//     goToLegalStep,
//     goToTopicDataStep,
//     handleSend,
//     handleAddTopic,
//     saveTopic,
//     handleUpdate,
//     handleTopicSelect,
//     handleSaveApi,
//     isOpen,
//     close,
//     toggle,
//     // Add all the new state and data
//     mainCategoryData,
//     subCategoryData,
//     amountPaidData,
//     travelingWayData,
//     leaveTypeData,
//     forAllowanceData,
//     typeOfRequestLookupData,
//     commissionTypeLookupData,
//     accordingToAgreementLookupData,
//     typesOfPenaltiesData,
//     payIncreaseTypeData,
//     PayIncreaseTypeOptions,
//     regionData,
//     isRegionLoading,
//     isSubCategoryLoading,
//     attachments,
//     attachmentFiles,
//     previewFile,
//     showAttachmentModal,
//     handleAttachmentSave,
//     handleViewAttachment,
//     openAttachmentModal,
//     closeAttachmentModal,
//     closePreview,
//     setAttachments,
//     setAttachmentFiles,
//     topicData,
//     setTopicData,
//     legalSection,
//     setLegalSection,
//     fileKey,
//     setFileKey,
//     fileName,
//     setFileName,
//     previewFileModule,
//     setPreviewFile,
//     localPreviewBase64,
//     setLocalPreviewBase64,
//     attachmentsModule,
//     setAttachmentsModule,
//     handleView,
//     triggerFileDetails,
//     fileBase64,
//     caseDetailsData,
//     triggerCaseDetailsQuery,
//     columns,
//     pagination,
//     setPagination,
//     getPaginatedTopics,
//     delTopic,
//     setDelTopic,
//     showDeleteConfirm,
//     setShowDeleteConfirm,
//     handleCancel,
//     handleSave,
//     lastAction,
//     setLastAction,
//     // Add other missing state and functions
//     lastSaved,
//     setLastSaved,
//     addHearingLoading,
//     timeoutRef,
//     prefillDoneRef,
//     topicsLoadedRef,
//     // Add navigation and utility functions
//     handleNext,
//     handlePrevious,
//     handleRemoveAttachment,
//     resolveOption,
//     ensureOption,
//     findOption,
//     hijriToGregorian,
//     currentStep,
//     currentTab,
//     updateParams,
//     // Add form-related functions
//     onSubmit,
//     // TODO: Return all other state and functions
//   };
// };
