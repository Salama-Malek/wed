// import {
//   lazy,
//   Suspense,
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
//   useRef,
// } from "react";
// import { useForm, useWatch, useFormContext } from "react-hook-form";
// import Button from "@/shared/components/button";
// import TableLoader from "@/shared/components/loader/TableLoader";
// import { CustomPagination } from "@/shared/components/pagination/CustomPagination";
// import useToggle from "@/shared/hooks/generalSate";
// import { useTranslation } from "react-i18next";
// import auditIcon from "@/assets/audit-01.svg";
// import { Add01Icon } from "hugeicons-react";
// import { useDateContext } from "@/shared/components/calanders/DateContext";
// import AttachmentSection from "./components/AttachmentSection";
// import AttachmentModal from "./components/AttachmentModal";
// import FilePreviewModal from "../add-attachments/FilePreviewModal";
// import { useLookup } from "../../api/hook/useLookup";
// import { useSubTopicsSubLookupQuery } from "../../api/create-case/addHearingApis";
// import { FormProvider as RHFFormProvider } from "react-hook-form";
// import { setFormData } from "@/redux/slices/formSlice";
// import StepNavigation from "@/shared/modules/case-creation/components/StepNavigation";
// import { useNavigationService } from "@/shared/hooks/useNavigationService";
// import { steps } from "@/shared/modules/case-creation/components/tabs/tabsConfig";
// import {
//   useLazyGetFileDetailsQuery,
//   useUpdateHearingTopicsMutation,
// } from "../../api/create-case/apis";
// import { useCookieState } from "../../hooks/useCookieState";
// import { TableSkeletonLoader } from "@/shared/components/loader/SkeletonLoader";
// import { TopicFormValues } from "./hearing.topics.types";
// import { getHearingTopicsColumns } from "./config/colums";
// import { useAttachments } from "./hooks/useAttachments";
// import { useFormLayout as useFormLayoutWorker } from "./config/forms.layout.worker";
// import { useFormLayout as useFormLayoutEstablishment } from "./config/forms.layout.establishment";
// import { getPayloadBySubTopicID } from "./api/case.topics.payload";
// import { useLazyGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
// import { TokenClaims } from "@/features/login/components/AuthProvider";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { ApiResponse } from "@/shared/modules/case-creation/components/StepNavigation";
// import useCaseTopicsPrefill from "./hooks/useCaseTopicsPrefill";
// import { useGetRegionLookupDataQuery } from "@/features/initiate-hearing/api/create-case/workDetailApis";
// import { Option } from "@/shared/components/form/form.types";
// import FileAttachment from "@/shared/components/ui/file-attachment/FileAttachment";
// import { DateObject } from "react-multi-date-picker";
// import gregorianCalendar from "react-date-object/calendars/gregorian";
// import gregorianLocale from "react-date-object/locales/gregorian_en";
// import arabicCalendar from "react-date-object/calendars/arabic";
// import arabicLocale from "react-date-object/locales/arabic_ar";
// import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";
// import FeaturedIcon from "@/assets/Featured icon.svg";
// import { useRemoveAttachmentMutation } from "./api/apis";
// import { isOtherCommission } from "./utils/isOtherCommission";
// import { isOtherAllowance } from "./utils/isOtherAllowance";
// import { useSubTopicPrefill } from "./hooks/useSubTopicPrefill"; 

// const Modal = lazy(() => import("@/shared/components/modal/Modal"));
// const ReusableTable = lazy(() =>
//   import("@/shared/components/table/ReusableTable").then((m) => ({
//     default: m.ReusableTable,
//   }))
// );
// const DynamicForm = lazy(() =>
//   import("@/shared/components/form/DynamicForm").then((m) => ({
//     default: m.DynamicForm,
//   }))
// );

// const HearingCta = lazy(() => import("./components/HearingCta"));


// function resolveOption(
//   list: { ElementKey: string; ElementValue: string }[] | undefined,
//   code?: string,
//   fallbackLabel?: string
// ) {
//   if (!code) return null;
//   const hit = list?.find((i) => String(i.ElementKey) === String(code));
//   return { value: code, label: hit ? hit.ElementValue : (fallbackLabel ?? code) };
// }

// // const makeOption = (
// //   list: { ElementKey: string; ElementValue: string }[] | undefined,
// //   code?: string,
// //   fallbackLabel?: string
// // ): Option | null => {
// //   if (!code) return null;
// //   const hit = list?.find(i => String(i.ElementKey) === String(code));
// //   return { value: code, label: hit ? hit.ElementValue : (fallbackLabel ?? code) };
// // };

// export const ensureOption = (
//   opts: { ElementKey: string; ElementValue: string }[] | Option[] | undefined,
//   code?: any,
//   fallbackLabel?: string
// ): Option | null => {
//   if (!code) return null;
//   const val = String(code);
//   const hit =
//     (opts as any[])?.find((o) =>
//       "ElementKey" in o ? String(o.ElementKey) === val : String(o.value) === val
//     ) ?? null;

//   if (!hit) return { value: val, label: fallbackLabel ?? val };
//   return "ElementKey" in hit
//     ? { value: hit.ElementKey, label: hit.ElementValue }
//     : hit;
// };


// interface AttachmentFile {
//   FileType: string;
//   FileName: string;
//   FileKey: string;
// }

// export const useHearingTopics = () => {
//   const { i18n } = useTranslation();
//   const currentLanguage = i18n.language.toUpperCase();

//   return {
//     getTopics: () => ({
//       url: `/WeddiServices/V1/Topics`,
//       params: {
//         AcceptedLanguage: currentLanguage,
//         SourceSystem: "E-Services",
//       },
//     }),
//   };
// };

// function HearingTopicsDetails({
//   showFooter,
//   onSaveApi,
// }: {
//   showFooter: boolean;
//   onSaveApi?: (payload: any) => Promise<any>;
// }) {
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

//   useEffect(() => {
//     return () => {
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, []);

//   const [getCookie] = useCookieState({ caseId: "" });
//   const [caseId] = useState(getCookie("caseId"));
//   const navigate = useNavigate();
//   const [lastSaved, setLastSaved] = useState(false);
//   const { updateParams, currentStep, currentTab } = useNavigationService();
//   const [updateHearingTopics, { isLoading: addHearingLoading }] =
//     useUpdateHearingTopicsMutation();
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

//   useEffect(() => {
//     // Don't interfere with prefilling when editing
//     if (isEditing) return;

//     if (subCategory?.value && mainCategory?.value) {
//       goToLegalStep();
//     }
//   }, [subCategory?.value, mainCategory?.value, isEditing]);

//   const [triggerCaseDetailsQuery, { data: caseDetailsData }] =
//     useLazyGetCaseDetailsQuery();
//   // Lookups
//   const lookup = useLookup();
//   const {
//     data: mainCategoryData,
//     isFetching,
//     isLoading,
//   } = lookup.mainCategory(isOpen);
//   // Removed duplicate subCategory call - using useSubTopicsSubLookupQuery instead
//   const { data: amountPaidData } = lookup.amountPaidCategory(
//     subCategory?.value
//   );
//   const { data: travelingWayData } = lookup.travelingWayCategory(
//     subCategory?.value
//   );
//   const { data: leaveTypeData } = lookup.leaveTypeCategory(subCategory?.value);
//   const { data: forAllowanceData } = lookup.forAllowance(subCategory?.value);
//   const { data: typeOfRequestLookupData } = lookup.typeOfRequest(
//     subCategory?.value
//   );
//   const { data: commissionTypeLookupData } = lookup.commissionType(
//     subCategory?.value
//   );
//   const { data: accordingToAgreementLookupData } = lookup.accordingToAgreement(
//     subCategory?.value
//   );
//   const { data: typesOfPenaltiesData } = lookup.typesOfPenalties(
//     subCategory?.value
//   );
//   const { data: payIncreaseTypeData } = lookup.payIncreaseType(
//     subCategory?.value
//   );
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


//   const { data: regionData, isFetching: isRegionLoading } =
//     useGetRegionLookupDataQuery({
//       AcceptedLanguage: currentLanguage,
//       context: "worker", // Always use WorkerRegion
//     });

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

//   const { data: subCategoryData, isFetching: isSubCategoryLoading } =
//     useSubTopicsSubLookupQuery(subTopicsLookupParams, {
//       skip: !mainCategory?.value || !caseDetailsData?.CaseDetails,
//     });

//   const [triggerFileDetails, { data: fileBase64 }] =
//     useLazyGetFileDetailsQuery();
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
//   const [localPreviewBase64, setLocalPreviewBase64] = useState<string | null>(
//     null
//   );
//   const [attachmentsModule, setAttachmentsModule] =
//     useState<AttachmentFile[]>();

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

//   useEffect(() => {
//     if (!caseId || caseDetailsData?.CaseDetails) return;

//     const fetchCaseDetails = async () => {
//       const userConfigs: Record<string, any> = {
//         Worker: {
//           UserType: userType,
//           IDNumber: userID,
//         },
//         "Embassy User": {
//           UserType: userType,
//           IDNumber: userID,
//         },
//         Establishment: {
//           UserType: userType,
//           IDNumber: userID,
//           FileNumber: fileNumber,
//         },
//         "Legal representative": {
//           UserType: userType,
//           IDNumber: userID,
//           MainGovernment: mainCategory2 || "",
//           SubGovernment: subCategory2 || "",
//         },
//       };

//       await triggerCaseDetailsQuery({
//         ...userConfigs[userType],
//         CaseID: caseId,
//         AcceptedLanguage: currentLanguage,
//         SourceSystem: "E-Services",
//       });
//     };

//     fetchCaseDetails();
//   }, [
//     caseId,
//     currentLanguage,
//     triggerCaseDetailsQuery,
//     userType,
//     fileNumber,
//     mainCategory2,
//     subCategory2,
//     userID,
//     caseDetailsData,
//   ]);

//   // Add a ref to track if topics have been loaded from caseDetailsData
//   const topicsLoadedRef = useRef(false);

//   useEffect(() => {
//     if ((caseDetailsData as any)?.CaseDetails && !topicsLoadedRef.current) {
//       const formattedTopics = (
//         caseDetailsData as any
//       ).CaseDetails.CaseTopics.map((topic: any) => ({
//         ...topic,
//         // Main/sub category for form
//         mainCategory: { value: topic.MainTopicID, label: topic.CaseTopicName },
//         subCategory: { value: topic.SubTopicID, label: topic.SubTopicName },

//         // Dates
//         date_hijri: topic.Date_New || "",
//         from_date_hijri: topic.FromDateHijri || "",
//         to_date_hijri: topic.ToDateHijri || "",
//         managerial_decision_date_hijri: topic.ManDecsDate || "",
//         // managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
//         date_gregorian: topic.DateGregorian || "",
//         from_date_gregorian: topic.FromDateGregorian || "",
//         to_date_gregorian: topic.ToDateGregorian || "",
//         injury_date_hijri:
//           topic.SubTopicID === "CMR-3"
//             ? topic.pyTempText || ""
//             : topic.injury_date_hijri || "",
//         injury_date_gregorian:
//           topic.SubTopicID === "CMR-3"
//             ? topic.InjuryDate_New || ""
//             : topic.injury_date_gregorian || "",
//         request_date_hijri: topic.RequestDateHijri || "",
//         request_date_gregorian: topic.RequestDateGregorian || "",

//         // Job fields
//         fromJob: topic.FromJob || "",
//         toJob: topic.ToJob || "",
//         requiredJobTitle: topic.RequiredJobTitle || "",
//         currentJobTitle: topic.CurrentJobTitle || "",
//         theWantedJob: topic.TheWantedJob || "",

//         // Amounts and numbers
//         amount: topic.Amount || "",
//         wagesAmount: topic.WagesAmount || "",
//         bonusAmount: topic.BonusAmount || "",
//         payDue: topic.PayDue || "",
//         durationOfLeaveDue: topic.DurationOfLeaveDue || "",
//         compensationAmount: topic.CompensationAmount || "",
//         injuryType: topic.InjuryType || "",
//         otherCommission: topic.OtherCommission || "",
//         amountOfCompensation: topic.AmountOfCompensation || "",
//         damagedValue: topic.DamagedValue || "",
//         requiredDegreeOfInsurance: topic.RequiredDegreeOfInsurance || "",
//         currentInsuranceLevel: topic.CurrentInsuranceLevel || "",
//         theReason: topic.TheReason || "",
//         currentPosition: topic.CurrentPosition || "",
//         typeOfCustody: topic.TypeOfCustody || "",
//         amountsPaidFor: topic.AmountsPaidFor || "",
//         gregorianDate: topic.GregorianDate || "",
//         decisionNumber: topic.DecisionNumber || "",
//         regionCode: topic.RegionCode || "",
//         cityCode: topic.CityCode || "",
//         occupationCode: topic.OccupationCode || "",
//         genderCode: topic.GenderCode || "",
//         nationalityCode: topic.NationalityCode || "",
//         prisonerId: topic.PrisonerId || "",
//         rewardType: topic.RewardType || "",
//         consideration: topic.Consideration || "",
//         // travelingWay: topic.TravelingWay || "",
//         loanAmount: topic.LoanAmount || "",
//         managerialDecisionNumber: topic.ManagerialDecisionNumber || "",

//         // Dropdowns
//         forAllowance: topic.ForAllowance
//           ? { value: topic.ForAllowance, label: topic.ForAllowance }
//           : null,

//         accordingToAgreement: topic.AccordingToAgreement
//           ? {
//             value: topic.AccordingToAgreement,
//             label: topic.AccordingToAgreement,
//           }
//           : null,
//         travelingWay: topic.TravelingWay
//           ? { value: topic.TravelingWay, label: topic.TravelingWay }
//           : null,
//         typeOfRequest:
//           topic.RequestType || topic.RequestType_Code
//             ? {
//               value: topic.RequestType_Code || topic.RequestType,
//               label: topic.RequestType || topic.RequestType_Code,
//             }
//             : null,
//         kindOfHoliday: topic.KindOfHoliday
//           ? { value: topic.KindOfHoliday, label: topic.KindOfHoliday }
//           : null,
//         fromLocation:
//           topic.FromLocation || topic.FromLocation_Code
//             ? {
//               value: topic.FromLocation_Code || topic.FromLocation,
//               label: topic.FromLocation || topic.FromLocation_Code,
//             }
//             : null,
//         toLocation:
//           topic.ToLocation || topic.ToLocation_Code
//             ? {
//               value: topic.ToLocation_Code || topic.ToLocation,
//               label: topic.ToLocation || topic.ToLocation_Code,
//             }
//             : null,
//         typesOfPenalties:
//           topic.PenalityType ||
//             topic.PenalityType_Code ||
//             topic.TypesOfPenalties
//             ? {
//               value:
//                 topic.PenalityType_Code ||
//                 topic.PenalityType ||
//                 topic.TypesOfPenalties,
//               label:
//                 topic.PenalityTypeLabel ||
//                 topic.TypesOfPenaltiesLabel ||
//                 topic.PenalityType ||
//                 topic.TypesOfPenalties,
//             }
//             : null,

//         // Booleans
//         doesBylawsIncludeAddingAccommodations:
//           topic.IsBylawsIncludeAddingAccommodiation === "Yes" ||
//           topic.doesBylawsIncludeAddingAccommodations === true,
//         doesContractIncludeAddingAccommodations:
//           topic.IsContractIncludeAddingAccommodiation === "Yes" ||
//           topic.doesContractIncludeAddingAccommodations === true,

//         // Housing
//         housingSpecificationInByLaws:
//           topic.HousingSpecificationsInBylaws ||
//           topic.housingSpecificationInByLaws ||
//           "",
//         housingSpecificationsInContract:
//           topic.HousingSpecificationsInContract ||
//           topic.housingSpecificationsInContract ||
//           "",
//         actualHousingSpecifications:
//           topic.HousingSpecifications ||
//           topic.actualHousingSpecifications ||
//           "",

//         // Any other fields you want to add...
//         // Add correct mapping for CMR-5 leave fields
//         ...(topic.SubTopicID === "CMR-5"
//           ? {
//             kindOfHoliday: (() => {
//               if (topic.LeaveType_Code) {
//                 return {
//                   value: topic.LeaveType_Code,
//                   label: topic.LeaveType,
//                 };
//               }
//               if (
//                 topic.kindOfHoliday &&
//                 typeof topic.kindOfHoliday === "object"
//               ) {
//                 return topic.kindOfHoliday;
//               }
//               if (
//                 typeof topic.kindOfHoliday === "string" &&
//                 leaveTypeData?.DataElements
//               ) {
//                 const found = leaveTypeData.DataElements.find(
//                   (item: any) => item.ElementKey === topic.kindOfHoliday
//                 );
//                 return found
//                   ? { value: found.ElementKey, label: found.ElementValue }
//                   : {
//                     value: topic.kindOfHoliday,
//                     label: topic.kindOfHoliday,
//                   };
//               }
//               return null;
//             })(),
//             totalAmount: topic.TotalAmountRequired || "",
//             workingHours: topic.WorkingHoursCount || "",
//             additionalDetails: topic.AdditionalDetails || "",
//           }
//           : {}),

//         // Add correct mapping for JAR-3 promotion mechanism fields
//         ...(topic.SubTopicID === "JAR-3"
//           ? {
//             doesTheInternalRegulationIncludePromotionMechanism:
//               topic.PromotionMechanism === "Yes",
//             doesContractIncludeAdditionalUpgrade:
//               topic.AdditionalUpgrade === "Yes",
//           }
//           : {}),

//         // Add correct mapping for BPSR-1 date fields
//         ...(topic.SubTopicID === "BPSR-1"
//           ? {
//             from_date_hijri: topic.pyTempDate || "",
//             from_date_gregorian: topic.FromDate_New || "",
//             to_date_hijri: topic.Date_New || "",
//             to_date_gregorian: topic.ToDate_New || "",
//           }
//           : {}),
//         // Add correct mapping for RFR-1 date fields
//         ...(topic.SubTopicID === "RFR-1" && {
//           amount: topic.Amount ?? "",
//           consideration: topic.Consideration ?? "",
//           // map API fields into our form props
//           date_hijri: topic.pyTempDate ?? "",
//           date_gregorian: topic.Date_New ?? "",
//         }),
//         // --- EDO-3 Amount Of Reduction mapping ---
//         ...(topic.SubTopicID === "EDO-3"
//           ? {
//             amountOfReduction: topic.AmountOfReduction || "",
//             managerial_decision_date_hijri: topic.pyTempDate || "",
//             managerial_decision_date_gregorian:
//               topic.ManagerialDecisionDate_New || "",
//             managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
//           }
//           : {}),
//         // ──────────────── EDO SUBTOPICS MAPPING ────────────────
//         // EDO-1: Cancellation of the location transfer decision
//         ...(topic.SubTopicID === "EDO-1" && {
//           fromLocation: topic.FromLocation_Code
//             ? { value: topic.FromLocation_Code, label: topic.FromLocation }
//             : null,
//           toLocation: topic.ToLocation_Code
//             ? { value: topic.ToLocation_Code, label: topic.ToLocation }
//             : null,
//           managerial_decision_date_hijri: topic.Date_New || "",
//           managerial_decision_date_gregorian: topic.ManDecsDate || "",
//           managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
//         }),
//         // EDO-2: Cancellation of the job transfer decision
//         ...(topic.SubTopicID === "EDO-2" && {
//           fromJob: topic.FromJob || "",
//           toJob: topic.ToJob || "",
//           managerial_decision_date_hijri: topic.Date_New || "",
//           managerial_decision_date_gregorian: topic.ManDecsDate || "",
//           managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
//         }),
//         // EDO-3: Cancellation of the wage reduction decision
//         ...(topic.SubTopicID === "EDO-3" && {
//           amountOfReduction: topic.AmountOfReduction || "",
//           managerial_decision_date_hijri: topic.pyTempDate || "",
//           managerial_decision_date_gregorian:
//             topic.ManagerialDecisionDate_New || "",
//           managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
//         }),
//         // EDO-4: Cancellation of disciplinary penalty decision
//         ...(topic.SubTopicID === "EDO-4" && {
//           typesOfPenalties: topic.PenalityType_Code
//             ? { value: topic.PenalityType_Code, label: topic.PenalityType }
//             : null,
//           managerial_decision_date_hijri: topic.Date_New || "",
//           managerial_decision_date_gregorian: topic.ManDecsDate || "",
//           managerialDecisionNumber: topic.ManagerialDecisionNumber || "",
//         }),
//         // ──────────────── END EDO SUBTOPICS MAPPING ────────────────

//         // ──────────────── WR SUBTOPICS MAPPING ────────────────

//         // Add correct mapping for WR-1 date fields
//         ...(topic.SubTopicID === "WR-1"
//           ? {
//             from_date_hijri: topic.pyTempDate || topic.from_date_hijri || "",
//             from_date_gregorian:
//               topic.FromDate_New || topic.from_date_gregorian || "",
//             to_date_hijri: topic.Date_New || topic.to_date_hijri || "",
//             to_date_gregorian:
//               topic.ToDate_New || topic.to_date_gregorian || "",
//           }
//           : {}),
//         // Add correct mapping for forAllowance dropdown (WR-1 only)
//         ...(topic.SubTopicID === "WR-1"
//           ? {
//             forAllowance: topic.ForAllowance_Code
//               ? { value: topic.ForAllowance_Code, label: topic.ForAllowance }
//               : null,
//             otherAllowance: topic.OtherAllowance || "",
//           }
//           : {}),

//         // Add correct mapping for WR-2 fields
//         ...(topic.SubTopicID === "WR-2"
//           ? {
//             amount: topic.OverdueWagesAmount || "",
//             from_date_hijri: topic.pyTempDate || "",
//             from_date_gregorian: topic.FromDate_New || "",
//             to_date_hijri: topic.Date_New || "",
//             to_date_gregorian: topic.ToDate_New || "",
//           }
//           : {}),
//         // ──────────────── END WR SUBTOPICS MAPPING ────────────────

//         // ──────────────── HIR SUBTOPICS MAPPING ────────────────
//         ...(topic.SubTopicID === "HIR-1"
//           ? {
//             doesBylawsIncludeAddingAccommodations:
//               topic.IsBylawsIncludeAddingAccommodiation === "Yes" ||
//               topic.doesBylawsIncludeAddingAccommodations === true,
//             doesContractIncludeAddingAccommodations:
//               topic.IsContractIncludeAddingAccommodiation === "Yes" ||
//               topic.doesContractIncludeAddingAccommodations === true,
//             housingSpecificationInByLaws:
//               topic.HousingSpecificationsInBylaws ||
//               topic.housingSpecificationInByLaws ||
//               "",
//             housingSpecificationsInContract:
//               topic.HousingSpecificationsInContract ||
//               topic.housingSpecificationsInContract ||
//               "",
//             actualHousingSpecifications:
//               topic.HousingSpecifications ||
//               topic.actualHousingSpecifications ||
//               "",
//           }
//           : {}),
//         // ──────────────── END HIR SUBTOPICS MAPPING ────────────────

//         // ──────────────── MIR SUBTOPICS MAPPING ────────────────
//         ...(topic.SubTopicID === "MIR-1"
//           ? {
//             typeOfRequest: topic.RequestType_Code
//               ? { value: topic.RequestType_Code, label: topic.RequestType }
//               : null,
//             requiredDegreeOfInsurance: topic.RequiredDegreeInsurance || "",
//             theReason: topic.Reason || "",
//             currentInsuranceLevel: topic.CurrentInsuranceLevel || "",
//           }
//           : {}),
//         // ──────────────── END MIR SUBTOPICS MAPPING ────────────────

//         // ──────────────── TTR SUBTOPICS MAPPING ────────────────
//         ...(topic.SubTopicID === "TTR-1"
//           ? {
//             travelingWay: topic.TravelingWay_Code
//               ? { value: topic.TravelingWay_Code, label: topic.TravelingWay }
//               : null,
//           }
//           : {}),
//         // ──────────────── END TTR SUBTOPICS MAPPING ────────────────

//         // ──────────────── CMR SUBTOPICS MAPPING ────────────────
//         // CMR-1: Treatment refunds
//         ...(topic.SubTopicID === "CMR-1" && {
//           amountsPaidFor:
//             topic.AmountsPaidFor_Code && topic.AmountsPaidFor
//               ? {
//                 value: topic.AmountsPaidFor_Code,
//                 label: topic.AmountsPaidFor,
//               }
//               : topic.AmountsPaidFor_Code
//                 ? {
//                   value: topic.AmountsPaidFor_Code,
//                   label: topic.AmountsPaidFor_Code,
//                 }
//                 : null,
//           theAmountRequired: topic.AmountRequired
//             ? String(topic.AmountRequired)
//             : "",
//         }),
//         // CMR-3: Request compensation for work injury
//         ...(topic.SubTopicID === "CMR-3" && {
//           compensationAmount: topic.Amount ? String(topic.Amount) : "",
//           injury_date_hijri: topic.pyTempText || "",
//           injury_date_gregorian: topic.InjuryDate_New || "",
//           injuryType: topic.TypeOfWorkInjury || "",
//         }),
//         // CMR-4: Request compensation for the duration of the notice
//         ...(topic.SubTopicID === "CMR-4" && {
//           amount: topic.Amount ? String(topic.Amount) : "",
//         }),
//         // CMR-5: Pay for work during vacation
//         ...(topic.SubTopicID === "CMR-5" && {
//           kindOfHoliday:
//             topic.LeaveType_Code && topic.LeaveType
//               ? { value: topic.LeaveType_Code, label: topic.LeaveType }
//               : topic.LeaveType_Code
//                 ? { value: topic.LeaveType_Code, label: topic.LeaveType_Code }
//                 : null,
//           totalAmount: topic.TotalAmountRequired
//             ? String(topic.TotalAmountRequired)
//             : "",
//           workingHours: topic.WorkingHoursCount
//             ? String(topic.WorkingHoursCount)
//             : "",
//           additionalDetails: topic.AdditionalDetails || "",
//         }),

//         // CMR-6: The Wage Difference/increase
//         ...(topic.SubTopicID === "CMR-6" && {
//           from_date_hijri: topic.pyTempDate || "",
//           from_date_gregorian: topic.FromDate_New || "",
//           to_date_hijri: topic.Date_New || "",
//           to_date_gregorian: topic.ToDate_New || "",
//           newPayAmount: topic.NewPayAmount ? String(topic.NewPayAmount) : "",
//           payIncreaseType: topic.PayIncreaseType_Code
//             ? { value: topic.PayIncreaseType_Code, label: topic.PayIncreaseType }
//             : null,
//           wageDifference: topic.WageDifference ? String(topic.WageDifference) : "",
//         }),
//         // CMR-7: Request for overtime pay
//         ...(topic.SubTopicID === "CMR-7" && {
//           pyTempDate: topic.pyTempDate || "",
//           toDate_gregorian: topic.ToDate_New || "",
//           date_hijri: topic.Date_New || "",
//           fromDate_gregorian: topic.FromDate_New || "",
//           durationOfLeaveDue: topic.DurationOfLeaveDue
//             ? String(topic.DurationOfLeaveDue)
//             : "",
//           payDue: topic.PayDue ? String(topic.PayDue) : "",
//         }),
//         // CMR-8: Pay stop time
//         ...(topic.SubTopicID === "CMR-8" && {
//           pyTempDate: topic.pyTempDate || "",
//           toDate_gregorian: topic.ToDate_New || "",
//           date_hijri: topic.Date_New || "",
//           fromDate_gregorian: topic.FromDate_New || "",
//           wagesAmount: topic.WagesAmount ? String(topic.WagesAmount) : "",
//         }),
//         // ──────────────── END CMR SUBTOPICS MAPPING ────────────────

//         // ──────────────── BR SUBTOPICS MAPPING ────────────────
//         // BR-1: Bonus Request
//         ...(topic.SubTopicID === "BR-1" && (() => {
//           const code = topic.AccordingToAgreement_Code || topic.AccordingToAgreement;
//           return {
//             accordingToAgreement: resolveOption(
//               accordingToAgreementLookupData?.DataElements,
//               code,
//               topic.AccordingToAgreement
//             ),
//             bonusAmount: topic.Premium ?? topic.BonusAmount ?? "",
//             date_hijri: topic.pyTempDate || "",
//             date_gregorian: topic.Date_New || "",
//           };
//         })()),
//         // ──────────────── END BR SUBTOPICS MAPPING ────────────────



//         // ──────────────── END BR SUBTOPICS MAPPING ────────────────

//         // ──────────────── BPSR SUBTOPICS MAPPING (FIXED) ────────────────
//         ...(topic.SubTopicID === "BPSR-1" && {
//           commissionType: ensureOption(
//             commissionTypeLookupData?.DataElements,
//             topic.CommissionType_Code ?? topic.CommissionType
//           ),
//           accordingToAgreement: ensureOption(
//             accordingToAgreementLookupData?.DataElements,
//             topic.AccordingToAgreement_Code ?? topic.AccordingToAgreement
//           ),
//           amount: String(topic.Amount ?? topic.amount ?? ""),
//           amountRatio: String(topic.AmountRatio ?? topic.amountRatio ?? ""),
//           from_date_hijri: topic.pyTempDate ?? topic.FromDateHijri ?? topic.from_date_hijri ?? "",
//           from_date_gregorian: topic.FromDate_New ?? topic.FromDateGregorian ?? topic.from_date_gregorian ?? "",
//           to_date_hijri: topic.Date_New ?? topic.ToDateHijri ?? topic.to_date_hijri ?? "",
//           to_date_gregorian: topic.ToDate_New ?? topic.ToDateGregorian ?? topic.to_date_gregorian ?? "",
//           otherCommission: String(topic.OtherCommission ?? topic.otherCommission ?? ""),
//         }),
//         // ──────────────── END BPSR SUBTOPICS MAPPING (FIXED) ────────────────


//         // ──────────────── DR SUBTOPICS MAPPING ────────────────
//         // DR-1: Documents Requests
//         ...(topic.SubTopicID === "DR-1" && {
//           documentType: topic.documentType || null,
//           documentReason: topic.documentReason || "",
//         }),
//         // ──────────────── END DR SUBTOPICS MAPPING ────────────────

//         // ──────────────── RR SUBTOPICS MAPPING ────────────────
//         // RR-1: Reward Request
//         ...(topic.SubTopicID === "RR-1" && {
//           amount: topic.Amount || topic.amount || "",
//           rewardType: topic.Type || topic.rewardType || "",
//         }),
//         // ──────────────── END RR SUBTOPICS MAPPING ────────────────

//         // ──────────────── JAR SUBTOPICS MAPPING ────────────────
//         // JAR-2: Job Application Request (currentJobTitle, requiredJobTitle)
//         ...(topic.SubTopicID === "JAR-2" && {
//           currentJobTitle: topic.CurrentJobTitle || topic.currentJobTitle || "",
//           requiredJobTitle:
//             topic.RequiredJobTitle || topic.requiredJobTitle || "",
//         }),
//         // JAR-3: Promotion Mechanism
//         ...(topic.SubTopicID === "JAR-3"
//           ? {
//             doesTheInternalRegulationIncludePromotionMechanism:
//               topic.PromotionMechanism === "Yes" || topic.doesTheInternalRegulationIncludePromotionMechanism,
//             doesContractIncludeAdditionalUpgrade:
//               topic.AdditionalUpgrade === "Yes" || topic.doesContractIncludeAdditionalUpgrade,
//           }
//           : {}),
//         // JAR-4: Job Application Request (currentPosition, theWantedJob)
//         ...(topic.SubTopicID === "JAR-4" && {
//           currentPosition: topic.CurrentPosition || topic.currentPosition || "",
//           theWantedJob: topic.TheWantedJob || topic.theWantedJob || topic.WantedJob || "",
//         }),
//         // ──────────────── END JAR SUBTOPICS MAPPING ────────────────
//         // ──────────────── LRESR SUBTOPICS MAPPING ────────────────
//         // LRESR-1: End of Service Reward
//         ...(topic.SubTopicID === "LRESR-1" && {
//           amount: topic.Amount || topic.amount || "",
//         }),
//         // LRESR-2: End of Service Reward (amount, consideration)
//         ...(topic.SubTopicID === "LRESR-2" && {
//           amount: topic.Amount || topic.amount || "",
//           consideration: topic.Consideration || topic.consideration || "",
//         }),
//         // LRESR-3: End of Service Reward (amount, rewardType)
//         ...(topic.SubTopicID === "LRESR-3" && {
//           amount: topic.Amount || topic.amount || "",
//           rewardType: topic.RewardType || topic.rewardType || "",
//         }),
//         // ──────────────── END LRESR SUBTOPICS MAPPING ────────────────
//       }));
//       setCaseTopics(formattedTopics);
//       topicsLoadedRef.current = true;

//       if (
//         caseDetailsData?.CaseDetails?.OtherAttachments?.length > 0 ||
//         caseDetailsData?.CaseDetails?.CaseTopicAttachments?.length > 0
//       ) {
//         const formattedAttachments =
//           caseDetailsData.CaseDetails.OtherAttachments.map(
//             (attachment: any) => ({
//               fileKey: attachment.FileKey,
//               fileType: attachment.FileType,
//               fileName: attachment.FileName,
//             })
//           );

//         setAttachments(formattedAttachments);
//         setAttachmentsModule([
//           ...(caseDetailsData?.CaseDetails?.OtherAttachments || []),
//           ...(caseDetailsData?.CaseDetails?.CaseTopicAttachments || []),
//         ]);
//       }
//     }
//   }, [caseDetailsData]);

//   const matchedSubCategory = subCategoryData?.DataElements?.find(
//     (item: any) => item.ElementKey === subCategory?.value
//   );

//   const acknowledged = watch("acknowledged");
//   const fromLocation = watch("fromLocation") ?? null;
//   const toLocation = watch("toLocation") ?? null;
//   const hijriDate = watch("hijriDate");
//   const gregorianDate = watch("gregorianDate");
//   const decisionNumber = watch("decisionNumber");
//   const regulatoryText = t("regulatory_text_content");
//   const { setDate } = useDateContext();

//   const [pagination, setPagination] = useState({
//     pageIndex: 0,
//     pageSize: 5,
//   });

//   const getPaginatedTopics = useMemo(() => {
//     const start = pagination.pageIndex * pagination.pageSize;
//     const end = start + pagination.pageSize;
//     return caseTopics.slice(start, end);
//   }, [caseTopics, pagination.pageIndex, pagination.pageSize]);

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
//       prefillSubTopic();
//     }, 100);
//   };

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
//         amount,
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
//         Amount: amount ?? "",
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

//     // BPSR-1: Bonus and Profit Share Request
//     else if (subCategoryValue === "BPSR-1") {
//       const {
//         commissionType,
//         accordingToAgreement,
//         amount,
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
//         Amount: amount ?? "",
//         AmountRatio: amountRatio ?? "",
//         FromDateHijri: formatDateForStorage(from_date_hijri),
//         FromDateGregorian: formatDateForStorage(from_date_gregorian),
//         ToDateHijri: formatDateForStorage(to_date_hijri),
//         ToDateGregorian: formatDateForStorage(to_date_gregorian),
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
//         amount,
//       } = updatedValues;

//       Object.assign(updatedTopic, {
//         Amount: amount ?? "",
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


//   const handleCancel = () => {
//     reset();
//     setShowLegalSection(false);
//     setShowTopicData(false);
//     setEditTopic(null);
//     close();
//     // Reset prefill ref when modal closes
//     prefillDoneRef.current = null;
//   };

//   const handleSave = () => {
//     if (!showLegalSection) {
//       goToLegalStep();
//     } else if (!showTopicData) {
//       goToTopicDataStep();
//     }
//   };

//   const [lastAction, setLastAction] = useState<"Save" | "Next" | undefined>(
//     undefined
//   );

//   const handleSaveApi = async (): Promise<ApiResponse> => {
//     console.log("[📡 SAVE API] Last saved flag before:", lastSaved);
//     setLastAction("Save");
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
//       setLastAction(undefined);
//       toast.error(error?.message || t("save_error"));
//       return Promise.reject(error);
//     }
//   };


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
//       ...(newTopic.SubTopicID === "CMR-4" && {
//         amount:
//           newTopic.amount !== undefined && newTopic.amount !== null
//             ? String(newTopic.amount)
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
//         Amount: newTopic.amount ?? "",
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

//   const isStep3 = showTopicData;
//   const isStep2 = showLegalSection;

//   // Use the new centralized subtopic prefill hook
//   const { prefillSubTopic } = useSubTopicPrefill({
//     setValue,
//     trigger,
//     isEditing,
//     editTopic,
//     lookupData: {
//       commissionTypeLookupData,
//       accordingToAgreementLookupData,
//       typeOfRequestLookupData,
//       forAllowanceData,
//       regionData,
//       leaveTypeData,
//       payIncreaseTypeData,
//       amountPaidData,
//       travelingWayData,
//       typesOfPenaltiesData,
//       typeOfCustodyData,
//     },
//   });

//   // Use the legacy prefilling hook for backward compatibility
//   useCaseTopicsPrefill({
//     setValue,
//     trigger,
//     caseTopics,
//     isEditing,
//     editTopic,
//   });

//   // Utility to convert Hijri (YYYYMMDD) to Gregorian (YYYYMMDD)
//   function hijriToGregorian(hijri: string) {
//     if (!hijri) return "";
//     const dateObj = new DateObject({
//       date: hijri,
//       calendar: arabicCalendar,
//       locale: arabicLocale,
//       format: "YYYYMMDD",
//     });
//     return dateObj
//       .convert(gregorianCalendar, gregorianLocale)
//       .format("YYYYMMDD");
//   }

//   // Handle date context and section visibility when editing
//   useEffect(() => {
//     if (isEditing && editTopic && isOpen) {
//       console.log("[🔧 MODAL OPEN] Setting up form for editing:", editTopic);
      
//       // Use centralized subtopic prefill when modal opens
//       console.log("[🔧 MODAL OPEN] Using centralized prefill handler");
//       prefillSubTopic();
      
//       // Show appropriate sections
//       setShowLegalSection(true);
//       setShowTopicData(true);
//     }
//   }, [isEditing, editTopic?.SubTopicID, editTopic?.id, isOpen, setShowLegalSection, setShowTopicData]);

//   const handleClearMainCategory = useCallback(() => {
//     setValue("mainCategory", null);
//     setValue("subCategory", null);
//     setValue("acknowledged", false);
//     setShowTopicData(false);
//     setShowLegalSection(false);
//     setValue("regulatoryText", "");
//   }, [setShowTopicData, setShowLegalSection]);

//   const handleClearSubCategory = useCallback(() => {
//     setValue("subCategory", null);
//     setValue("acknowledged", false);
//     setShowTopicData(false);
//     setValue("regulatoryText", "");
//   }, [setShowTopicData]);

//   const bylawsValue = useWatch({
//     control,
//     name: "doesBylawsIncludeAddingAccommodations",
//   });
//   const contractValue = useWatch({
//     control,
//     name: "doesContractIncludeAddingAccommodations",
//   });

//   useEffect(() => {
//     if (bylawsValue && contractValue) {
//       setValue("doesContractIncludeAddingAccommodations", false);
//       setValue("housingSpecificationsInContract", "");
//     } else if (contractValue && bylawsValue) {
//       setValue("doesBylawsIncludeAddingAccommodations", false);
//       setValue("housingSpecificationInByLaws", "");
//     }
//   }, [bylawsValue, contractValue]);

//   // --- MOJ Contract Error UI and Handlers Disabled ---
//   // To re-enable, uncomment the mojContractError state, UI, and handler code blocks as needed.
//   // All references to mojContractError and setMojContractError are now commented out for linter compliance.
//   /*
//   useEffect(() => {
//     // Only run validation for Worker or Embassy User with Establishment defendant
//     if (
//       (userType === "Worker" ||
//         (userType === "Embassy User" && defendantStatus === "Establishment")) &&
//       subCategory?.value &&
//       mainCategory?.value === "WR"
//     ) {
//       // Guard: don't clear or set errors until lookup is ready
//       if (!matchedSubCategory) return;

//       const mojContractExists = matchedSubCategory?.MojContractExist === "true";
//       const errorMessage = matchedSubCategory?.MojContractExistError;

//       if (mojContractExists && errorMessage) {
//         // Clear any existing timeout
//         if (timeoutRef.current) {
//           clearTimeout(timeoutRef.current);
//         }

//         // Set error and remember which subcategory caused it
//         setMojContractError(errorMessage);
//         setLastErrorSubCategory(subCategory.value);
//         // Reset form state
//         setValue("subCategory", null);
//         setValue("acknowledged", false);
//         setShowLegalSection(false);
//         setShowTopicData(false);

//         // Set timeout to clear error after 10 seconds
//         timeoutRef.current = setTimeout(() => {
//           setMojContractError(null);
//           setLastErrorSubCategory(null);
//         }, 10000);
//       } else if (
//         lastErrorSubCategory === subCategory.value &&
//         (mojContractExists === false || !errorMessage)
//       ) {
//         // Only clear if the error was for this subcategory
//         if (timeoutRef.current) {
//           clearTimeout(timeoutRef.current);
//         }
//         setMojContractError(null);
//         setLastErrorSubCategory(null);
//       }
//     }
//   }, [
//     userType,
//     defendantStatus,
//     subCategory?.value,
//     mainCategory?.value,
//     matchedSubCategory,
//     lastErrorSubCategory,
//   ]);
//   */
//   // --- END MOJ Contract Error UI and Handlers Disabled ---

//   // Clear error when main category changes away from WR
//   // useEffect(() => {
//   //   if (mainCategory?.value !== "WR" && lastErrorSubCategory) {
//   //     if (timeoutRef.current) {
//   //       clearTimeout(timeoutRef.current);
//   //     }
//   //     setLastErrorSubCategory(null);
//   //   }
//   // }, [mainCategory?.value, lastErrorSubCategory]);

//   // // Clear error when user selects a different subcategory and allow new validation
//   // useEffect(() => {
//   //   if (
//   //     lastErrorSubCategory &&
//   //     subCategory?.value &&
//   //     subCategory.value !== lastErrorSubCategory &&
//   //     mainCategory?.value === "WR"
//   //   ) {
//   //     // Clear the previous error
//   //     if (timeoutRef.current) {
//   //       clearTimeout(timeoutRef.current);
//   //     }
//   //     setLastErrorSubCategory(null);

//   //     // The validation effect will run again for the new subcategory
//   //     // because we cleared the error and the subcategory changed
//   //   }
//   // }, [subCategory?.value, lastErrorSubCategory, mainCategory?.value]);

//   // ────────────────────────────────────────────────────────────────────────────────
//   // Move both layout hooks to the top level, then pick between them:
//   const formLayout =
//     userType === "Worker" || userType === "Embassy User"
//       ? useFormLayoutWorker({
//         t,
//         MainTopicID: mainCategory,
//         SubTopicID: subCategory,
//         FromLocation: fromLocation,
//         ToLocation: toLocation,
//         AcknowledgementTerms: acknowledged,
//         showLegalSection,
//         showTopicData,
//         setValue,
//         regulatoryText,
//         handleAdd: goToLegalStep,
//         handleAcknowledgeChange: (val: boolean) => {
//           setValue("acknowledged", val);
//           if (val) setShowTopicData(true);
//         },
//         handleAddTopic,
//         handleSend,
//         decisionNumber: decisionNumber || "",
//         isEditing,
//         mainCategoryData,
//         subCategoryData,
//         watch,
//         forAllowanceData,
//         typeOfRequestLookupData,
//         commissionTypeLookupData,
//         accordingToAgreementLookupData,
//         typesOfPenaltiesData,
//         matchedSubCategory,
//         subTopicsLoading: isSubCategoryLoading,
//         amountPaidData,
//         leaveTypeData,
//         travelingWayData,
//         editTopic,
//         caseTopics,
//         setShowLegalSection,
//         setShowTopicData,
//         isValid,
//         isMainCategoryLoading: isFetching || isLoading,
//         isSubCategoryLoading,
//         control,
//         trigger,
//         lockAccommodationSource,
//         errors,
//         payIncreaseTypeData,
//         PayIncreaseTypeOptions,
//       })
//       : useFormLayoutEstablishment({
//         t,
//         MainTopicID: mainCategory,
//         SubTopicID: subCategory,
//         FromLocation: fromLocation,
//         ToLocation: toLocation,
//         AcknowledgementTerms: acknowledged,
//         showLegalSection,
//         showTopicData,
//         setValue,
//         regulatoryText,
//         handleAdd: goToLegalStep,
//         handleAcknowledgeChange: (val: boolean) => {
//           setValue("acknowledged", val);
//           if (val) setShowTopicData(true);
//         },
//         handleAddTopic,
//         handleSend,
//         decisionNumber: decisionNumber || "",
//         isEditing,
//         mainCategoryData,
//         subCategoryData,
//         watch,
//         forAllowanceData,
//         typeOfRequestLookupData,
//         commissionTypeLookupData,
//         accordingToAgreementLookupData,
//         typesOfPenaltiesData,
//         matchedSubCategory,
//         subTopicsLoading: isSubCategoryLoading,
//         amountPaidData,
//         leaveTypeData,
//         travelingWayData,
//         editTopic,
//         caseTopics,
//         setShowLegalSection,
//         setShowTopicData,
//         isValid,
//         isMainCategoryLoading: isFetching || isLoading,
//         isSubCategoryLoading,
//         lockAccommodationSource,
//         errors,
//         payIncreaseTypeData,
//         PayIncreaseTypeOptions,
//         control,
//         trigger,
//       });

//   // Fix the FormData type issue
//   interface FormData {
//     mainCategory: any;
//     subCategory: any;
//     acknowledged: boolean;
//     regulatoryText: string;
//     topicData?: any;
//     legalSection?: any;
//   }

//   const updateForm = useCallback(
//     (updates: Partial<FormData>) => {
//       reset(updates);
//     },
//     [reset]
//   );

//   const updateTopicData = useCallback((data: any) => {
//     if (data?.TopicData) {
//       setTopicData(data.TopicData);
//       setShowTopicData(true);
//     }
//   }, []);

//   const updateLegalSection = useCallback((data: any) => {
//     if (data?.LegalSection) {
//       setLegalSection(data.LegalSection);
//       setShowLegalSection(true);
//     }
//   }, []);

//   const fetchTopicData = useCallback(async () => {
//     // Implementation will be added when the API is available
//   }, []);

//   const fetchLegalSection = useCallback(async () => { }, []);

//   useEffect(() => {
//     if (showTopicData && topicData) {
//       setValue("topicData", topicData);
//     }
//   }, [showTopicData, topicData]);

//   useEffect(() => {
//     if (showLegalSection && legalSection) {
//       setValue("legalSection", legalSection);
//     }
//   }, [showLegalSection, legalSection]);

//   useEffect(() => {
//     fetchTopicData();
//   }, [fetchTopicData]);

//   useEffect(() => {
//     fetchLegalSection();
//   }, [fetchLegalSection]);

//   useEffect(() => {
//     if (acknowledged) {
//       setShowTopicData(true);
//     }
//   }, [acknowledged]);

//   function findOption(options: Option[], value: string): Option | null {
//     if (!options) return null;
//     return (
//       options.find((opt: Option) =>
//         typeof opt === "object" ? opt.value === value : opt === value
//       ) || null
//     );
//   }

//   useEffect(() => {
//     if (isEditing && editTopic && typeOfRequestLookupData?.DataElements) {
//       const code =
//         editTopic?.RequestType_Code ||
//         editTopic?.RequestType ||
//         editTopic?.TypeOfRequest;
//       const matchedOption = findOption(
//         typeOfRequestLookupData.DataElements.map((item: any) => ({
//           value: item.ElementKey,
//           label: item.ElementValue,
//         })),
//         code
//       );
//       if (matchedOption) setValue("typeOfRequest", matchedOption);
//     }
//   }, [isEditing, editTopic, typeOfRequestLookupData]);

//   useEffect(() => {
//     if (isEditing && editTopic && regionData?.DataElements) {
//       let fromLocationCode =
//         editTopic?.fromLocation?.value ??
//         editTopic?.FromLocation_Code ??
//         editTopic?.fromLocation;
//       if (fromLocationCode && regionData?.DataElements) {
//         // Try both string and number comparison
//         const fromLocationOption = regionData.DataElements.find(
//           (item: any) =>
//             String(item.ElementKey) === String(fromLocationCode) ||
//             Number(item.ElementKey) === Number(fromLocationCode)
//         );
//         setValue("fromLocation", {
//           value: String(fromLocationCode),
//           label: fromLocationOption
//             ? fromLocationOption.ElementValue
//             : String(fromLocationCode),
//         });
//       }

//       let toLocationCode =
//         editTopic?.toLocation?.value ??
//         editTopic?.ToLocation_Code ??
//         editTopic?.toLocation;
//       if (toLocationCode && regionData?.DataElements) {
//         const toLocationOption = regionData.DataElements.find(
//           (item: any) =>
//             String(item.ElementKey) === String(toLocationCode) ||
//             Number(item.ElementKey) === Number(toLocationCode)
//         );
//         setValue("toLocation", {
//           value: String(toLocationCode),
//           label: toLocationOption
//             ? toLocationOption.ElementValue
//             : String(toLocationCode),
//         });
//       }
//     }
//   }, [isEditing, editTopic, regionData, setValue]);

//   const { t: tCommon } = useTranslation("common");

//   const [removeAttachment] = useRemoveAttachmentMutation();

//   // Custom handler for AttachmentSection
//   const handleRemoveAttachment = async (attachment: any, index: number) => {
//     // console.log("handleRemoveAttachment called", { attachment, index });
//     const key =
//       attachment.FileKey ||
//       attachment.fileKey ||
//       attachment.attachmentKey ||
//       "";
//     try {
//       const response = await removeAttachment({ AttachmentKey: key }).unwrap();
//       if (
//         response?.ServiceStatus === "Success" ||
//         response?.SuccessCode === "200"
//       ) {
//         setAttachments((prev: any[]) => prev.filter((_, i) => i !== index));
//         setAttachmentFiles((prev: any[]) => prev.filter((_, i) => i !== index));
//         console.log(
//           "Current language:",
//           i18n.language,
//           "Localized string:",
//           t("attachments.remove_success")
//         );
//         toast.success(t("attachments.remove_success"));
//       } else {
//         console.log(
//           "Current language:",
//           i18n.language,
//           "Localized string:",
//           t("attachments.remove_failed")
//         );
//         toast.error(t("attachments.remove_failed"));
//       }
//     } catch (error) {
//       console.log(
//         "Current language:",
//         i18n.language,
//         "Localized string:",
//         t("attachments.remove_failed")
//       );
//       toast.error(t("attachments.remove_failed"));
//     }
//   };


//   // DYNAMIC: only require otherCommission when commissionType === "Other"
//   const commissionTypeOpt = watch("commissionType");
//   useEffect(() => {
//     if (isOtherCommission(commissionTypeOpt)) {
//       // only register—and make it required—when we really need it
//       register("otherCommission", { required: t("fieldRequired") });
//     } else {
//       // completely unregister it (so no more validation or lingering errors)
//       unregister("otherCommission", { keepValue: false });
//     }
//     // no need to trigger here: RHF will skip any unregistered field
//   }, [commissionTypeOpt, register, unregister, t]);

//   // DYNAMIC: only require otherAllowance when forAllowance === "Other"
//   const forAllowanceOpt = watch("forAllowance");
//   const isWR1 = subCategory?.value === "WR-1" || editTopic?.SubTopicID === "WR-1";
//   useEffect(() => {
//     console.log("[🔧 DYNAMIC REG] forAllowanceOpt:", forAllowanceOpt);
//     console.log("[🔧 DYNAMIC REG] isWR1:", isWR1);
//     console.log("[🔧 DYNAMIC REG] isOtherAllowance:", isOtherAllowance(forAllowanceOpt));
    
//     if (!isWR1) return;

//     if (isOtherAllowance(forAllowanceOpt)) {
//       console.log("[🔧 DYNAMIC REG] Registering otherAllowance field");
//       // only register—and make it required—when we really need it
//       register("otherAllowance", { required: t("fieldRequired") });
//       // Trigger validation to clear any existing errors
//       trigger("otherAllowance");
//     } else {
//       console.log("[🔧 DYNAMIC REG] Unregistering otherAllowance field");
//       // unregister it but keep the value for when it's re-registered
//       unregister("otherAllowance", { keepValue: true });
//     }
//   }, [forAllowanceOpt, isWR1, register, unregister, t, trigger]);

//   // Trigger validation when otherAllowance value changes
//   const otherAllowanceValue = watch("otherAllowance");
//   useEffect(() => {
//     console.log("[🔧 VALIDATION] otherAllowanceValue changed:", otherAllowanceValue);
//     console.log("[🔧 VALIDATION] isWR1:", isWR1);
//     console.log("[🔧 VALIDATION] isOtherAllowance:", isOtherAllowance(forAllowanceOpt));
//     if (isWR1 && isOtherAllowance(forAllowanceOpt) && otherAllowanceValue !== undefined) {
//       console.log("[🔧 VALIDATION] Triggering otherAllowance validation");
//       trigger("otherAllowance");
//     }
//   }, [otherAllowanceValue, isWR1, forAllowanceOpt, trigger]);

//   // DYNAMIC: only require MIR-1 additional fields when typeOfRequest requires them
//   const typeOfRequestOpt = watch("typeOfRequest");
//   const isMIR1 = subCategory?.value === "MIR-1" || editTopic?.SubTopicID === "MIR-1";
//   useEffect(() => {
//     if (!isMIR1) return;

//     const requiresAdditionalFields = typeOfRequestOpt && ["REQT1", "REQT2", "REQT3"].includes(String(typeOfRequestOpt.value));
//     const requiresReasonAndCurrentLevel = typeOfRequestOpt && String(typeOfRequestOpt.value) === "REQT3";

//     if (requiresAdditionalFields) {
//       register("requiredDegreeOfInsurance", { required: t("fieldRequired") });
//     } else {
//       unregister("requiredDegreeOfInsurance", { keepValue: true });
//     }

//     if (requiresReasonAndCurrentLevel) {
//       register("theReason", { required: t("fieldRequired") });
//       register("currentInsuranceLevel", { required: t("fieldRequired") });
//     } else {
//       unregister("theReason", { keepValue: true });
//       unregister("currentInsuranceLevel", { keepValue: true });
//     }
//   }, [typeOfRequestOpt, isMIR1, register, unregister, t]);
  

//   // Add after handleTopicSelect and related hooks
//   useEffect(() => {
//     if (
//       isEditing &&
//       editTopic &&
//       travelingWayData?.DataElements &&
//       editTopic?.TravelingWay
//     ) {
//       const found = travelingWayData.DataElements.find(
//         (item: any) => item.ElementKey === editTopic?.TravelingWay
//       );
//       if (found) {
//         setValue("travelingWay", {
//           value: found.ElementKey,
//           label: found.ElementValue,
//         });
//       }
//     }
//   }, [isEditing, editTopic, travelingWayData, setValue]);

//   return (
//     <Suspense fallback={<TableLoader />}>
//       <StepNavigation<FormData>
//         onSubmit={handleSubmit(onSubmit)}
//         isValid={isValid && caseTopics.length > 0}
//         isFirstStep={currentStep === 0 && currentTab === 0}
//         isLastStep={currentStep === 3 - 1}
//         currentStep={currentStep}
//         goToNextStep={handleNext}
//         goToPrevStep={handlePrevious}
//         resetSteps={() => updateParams(0, 0)}
//         handleSave={handleSaveApi}
//         canProceed={!!caseTopics.length}
//         isButtonDisabled={(direction: "prev" | "next") =>
//           direction === "prev" ? currentStep === 0 && currentTab === 0 : false
//         }
//         isLoading={addHearingLoading}
//         lastAction={lastAction}
//         showFooterBtn={showFooter}
//       >
//         <div className="flex flex-col min-h-auto">
//           <div>
//             {caseTopics.length > 0 ? (
//               <>
//                 <div className="mx-4 sm:mx-6 md:mx-8">
//                   <p className="text-primary-600 font-semibold text-base sm:text-lg md:text-xl leading-6 font-primary mb-4 sm:mb-6 md:mb-8">
//                     {t("lawsuit_topics") || "Lawsuit Topics"}
//                   </p>
//                   <Button
//                     variant="primary"
//                     size="xs"
//                     type="button"
//                     onClick={() => {
//                       reset();
//                       setValue("subCategory", null);
//                       setValue("mainCategory", null);
//                       setValue("acknowledged", false);
//                       setShowLegalSection(false);
//                       setShowTopicData(false);
//                       setEditTopic(null);
//                       toggle();
//                     }}
//                     className="mb-4 sm:mb-6 md:mb-8"
//                   >
//                     <Add01Icon size={20} /> {t("add_topic") || "Add Topic"}
//                   </Button>
//                   <div className="border-b border-gray-300 mb-4 sm:mb-6 md:mb-8" />
//                 </div>
//                 <Suspense fallback={<TableSkeletonLoader />}>
//                   <div className="overflow-x-auto">
//                     <ReusableTable
//                       data={getPaginatedTopics}
//                       columns={columns}
//                       page={pagination.pageIndex + 1}
//                       totalPages={Math.ceil(
//                         caseTopics.length / pagination.pageSize
//                       )}
//                       onPageChange={(newPage) => {
//                         setPagination((prev) => ({
//                           ...prev,
//                           pageIndex: newPage - 1,
//                         }));
//                       }}
//                       PaginationComponent={CustomPagination}
//                     />
//                   </div>
//                 </Suspense>
//                 <AttachmentSection
//                   attachments={attachments}
//                   onAddClick={openAttachmentModal}
//                   onRemove={handleRemoveAttachment}
//                   onView={handleViewAttachment}
//                 />

//                 <AttachmentModal
//                   isOpen={showAttachmentModal}
//                   onClose={closeAttachmentModal}
//                   onSave={handleAttachmentSave}
//                 />
//               </>
//             ) : (
//               <Suspense fallback={<TableLoader />}>
//                 <HearingCta auditIcon={auditIcon} toggle={toggle} />
//               </Suspense>
//             )}
//           </div>
//           {isOpen && (
//             <Suspense fallback={<TableLoader />}>
//               <Modal
//                 modalWidth={800}
//                 close={handleCancel}
//                 header={
//                   editTopic
//                     ? t("edit_topic") || "Edit Topic"
//                     : t("add_topic") || "Add Topic"
//                 }
//                 className="h-[60vh] sm:h-[600px] overflow-y-auto w-full max-w-[800px]"
//               >
//                 {/* {mojContractError && (
//                   <div
//                     className="flex flex-col items-start p-4 md:p-6 gap-4 relative w-full bg-[#FFFBFA] border border-[#FECDCA] rounded-lg mb-4"
//                     style={{ boxSizing: 'border-box', isolation: 'isolate' }}
//                   >
//                     <div className="flex items-center w-full">
//                       <div className="flex-shrink-0 me-4 md:me-6">
//                         <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white">
//                           <img src={FeaturedIcon} alt="Notification Icon" className="w-10 h-10" />
//                         </div>
//                       </div>
//                       <div className="flex-1">
//                         <div className="text-red-700 font-bold text-xl mb-1">
//                           {tCommon('notification')}
//                         </div>
//                         <div className="text-gray-700 text-base">
//                           {t(mojContractError) !== mojContractError ? t(mojContractError) : mojContractError}
//                         </div>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setMojContractError(null);
//                           if (timeoutRef.current) {
//                             clearTimeout(timeoutRef.current);
//                           }
//                         }}
//                         className="end-4 ms-4 md:ms-6 text-gray-400 hover:text-gray-600"
//                         aria-label="Close"
//                       >
//                         <span className="text-2xl font-bold">&times;</span>
//                       </button>
//                     </div>
//                   </div>
//                 )} */}
//                 <RHFFormProvider {...methods}>
//                   <Suspense fallback={<TableLoader />}>
//                     {formLayout && (
//                       <DynamicForm
//                         formLayout={formLayout}
//                         register={register}
//                         errors={errors}
//                         setValue={setValue}
//                         control={control}
//                         watch={watch}
//                       />
//                     )}
//                   </Suspense>
//                   <div className="flex w-full justify-between mt-4 sm:mt-6">
//                     <Button
//                       variant="secondary"
//                       typeVariant="outline"
//                       size="sm"
//                       type="button"
//                       onClick={handleCancel}
//                       className="text-sm sm:text-base font-medium"
//                     >
//                       {t("cancel") || "Cancel"}
//                     </Button>
//                     <Button
//                       variant={isEditing ? "primary" : isValid && acknowledged ? "primary" : "disabled"}
//                       typeVariant={isEditing ? "brand" : isValid && acknowledged ? "brand" : "freeze"}
//                       size="sm"
//                       type="button"
//                       onClick={() => {
//                         if (isEditing) {
//                           handleUpdate();
//                         } else if (isStep3) {
//                           handleSend();
//                         } else if (isStep2 && acknowledged) {
//                           handleSave();
//                         }
//                       }}
//                       className="text-sm sm:text-base font-medium"
//                       disabled={isEditing ? !isValid : !isValid || !acknowledged}
//                     >
//                       {currentStep === steps.length - 1
//                         ? t("finalSubmit") || "Final Submit"
//                         : isEditing
//                           ? t("update") || "Update"
//                           : isStep3
//                             ? t("send") || "Send"
//                             : isStep2 && acknowledged
//                               ? t("Next") || "Next"
//                               : t("Next") || "Next"}
//                     </Button>
//                   </div>
//                 </RHFFormProvider>
//               </Modal>
//             </Suspense>
//           )}
//           <FilePreviewModal file={previewFile} onClose={closePreview} />
//           {showDeleteConfirm && (
//             <Modal
//               close={() => setShowDeleteConfirm(false)}
//               header={t("delete_topic") || "Delete Topic"}
//               modalWidth={500}
//             >
//               <p className="text-sm text-gray-700">
//                 {t("confirm_delete_topic") ||
//                   "Are you sure you want to delete this topic? This action cannot be undone."}
//               </p>
//               <div className="flex justify-end gap-3 mt-6">
//                 <Button
//                   variant="secondary"
//                   type="button"
//                   onClick={() => setShowDeleteConfirm(false)}
//                 >
//                   {t("no") || "No"}
//                 </Button>
//                 <Button
//                   variant="primary"
//                   type="button"
//                   onClick={() => {
//                     setCaseTopics((prev) => prev.filter((_, i) => i !== delTopic?.index));
//                     setShowDeleteConfirm(false);
//                     setDelTopic(null);
//                   }}
//                 >
//                   {t("yes") || "Yes"}
//                 </Button>
//               </div>
//             </Modal>
//           )}
//         </div>
//       </StepNavigation>
//     </Suspense>
//   );
// }

// export default HearingTopicsDetails;

