import { useLanguageDirection } from "@/i18n/LanguageDirectionProvider";
import { AutoCompleteField } from "@/shared/components/form/AutoComplete";
import { ReadOnlyField } from "@/shared/components/ui/read-only-view";
import { Section } from "@/shared/layouts/Section";
import { classes } from "@/shared/lib/clsx";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { CheckboxField } from "@/shared/components/form/Checkbox";
import { RadioGroup, RadioOption } from "@/shared/components/form/RadioGroup";
import { ColumnDef } from "@tanstack/react-table";
import TableLoader from "@/shared/components/loader/TableLoader";
import { useTranslation } from "react-i18next";
import withStepNavigation, {
  WithStepNavigationProps,
} from "@/shared/HOC/withStepNavigation";
import {
  useGetAcknowledgementQuery,
  useLazyGetFileDetailsQuery,
} from "../../api/create-case/apis";
import { useGetCaseDetailsQuery } from "@/features/manage-hearings/api/myCasesApis";
import { useCookieState } from "../../hooks/useCookieState";
import { skipToken } from "@reduxjs/toolkit/query";
import Modal from "@/shared/components/modal/Modal";
import { Topic } from "../hearing-topics/hearing.topics.types";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { formatDate } from "@/utils/formatters";

function formatHijriWithSlashes(date: string): string {
  if (!date) return "";
  // If already contains slashes, return as is
  if (date.includes("/")) return date;
  // If 8 digits, format as DD/MM/YYYY
  if (/^\d{8}$/.test(date)) return formatDate(date);
  // If 6 digits (YYMMDD), try to format as best as possible
  if (/^\d{6}$/.test(date)) {
    const year = date.substring(0, 2);
    const month = date.substring(2, 4);
    const day = date.substring(4, 6);
    return `${day}/${month}/14${year}`;
  }
  // Otherwise, return as is
  return date;
}

const FileAttachment = lazy(
  () => import("@/shared/components/ui/file-attachment/FileAttachment")
);
const ReusableTable = lazy(() =>
  import("@/shared/components/table/ReusableTable").then((module) => ({
    default: module.ReusableTable,
  }))
);

type ReadOnlyDetail = { label: string; value: string };
type FileDetail = { fileName: string; fileKey: string };

type FileType = {
  FileKey: string;
  FileType: string;
  FileName: string;
};

type SectionData =
  | {
    type: "radio";
    name: string;
    label: string;
    options: RadioOption[];
    value: string;
    onChange: (value: string) => void;
  }
  | { type: "readonly"; fields: ReadOnlyDetail[] }
  | { type: "file"; files: FileDetail[] }
  | { type: "table"; records: Topic[] };

type ReviewSection = {
  title?: string;
  hideTitle?: boolean;
  data: SectionData;
};

const ReviewDetails = ({
  control,
  setAcknowledgements,
  setSelectedLanguage,
}: WithStepNavigationProps) => {
  const { t, i18n } = useTranslation("reviewdetails");
  const { t:hearingdetails } = useTranslation("hearingdetails");

  const [selectedLang, setSelectedLang] = useState({
    label: i18n.language === "ar" ? "Arabic" : "English",
    value: i18n.language === "ar" ? "AR" : "EN",
  });

  const [getCookie] = useCookieState();
  const [fileKey, setFileKey] = useState("");
  const [fileName, setFileName] = useState("");
  const [previewFile, setPreviewFile] = useState(false);

  const { isRTL } = useLanguageDirection();
  const userClaims: TokenClaims = getCookie("userClaims");
  const caseId = getCookie("caseId");

  const UserClaims: TokenClaims = getCookie("userClaims");
  const userType = getCookie("userType");
  const mainCategory = getCookie("mainCategory")?.value;
  const subCategory = getCookie("subCategory")?.value;
  const userID = getCookie("userClaims")?.UserID;
  const fileNumber = getCookie("userClaims")?.File_Number;
  const defendantStatus = getCookie("defendantStatus");

  const userConfigs: any = {
    Worker: {
      UserType: userType,
      IDNumber: userID,
    },
    "Embassy User": {
      UserType: userType,
      IDNumber: userID,
    },
    Establishment: {
      UserType: userType,
      IDNumber: userID,
      FileNumber: fileNumber,
    },
    "Legal representative": {
      UserType: userType,
      IDNumber: userID,
      MainGovernment: mainCategory || "",
      SubGovernment: subCategory || "",
    },
  } as const;

  const queryArg = caseId
    ? {
      ...userConfigs[userType],
      CaseID: caseId,
      AcceptedLanguage: isRTL ? "AR" : "EN",
      SourceSystem: "E-Services",
    }
    : skipToken;

  const { data: caseDetailsData, refetch } = useGetCaseDetailsQuery(queryArg);

  useEffect(() => {
    refetch();
  }, []);

  const details = caseDetailsData?.CaseDetails || {};

  const { data: ackData } = useGetAcknowledgementQuery({
    LookupType: "DataElements",
    ModuleKey: "MACK1",
    ModuleName: "Acknowledge",
    AcceptedLanguage: selectedLang.value,
    SourceSystem: "E-Services",
  });

  const [triggerFileDetailsQuery, { data: fileBase64 }] =
    useLazyGetFileDetailsQuery();

  useEffect(() => {
    if (ackData?.DataElements && setAcknowledgements) {
      setAcknowledgements(ackData.DataElements);
    }
  }, [ackData, setAcknowledgements]);

  const onView = async (fileKey: string, fileName: string) => {
    setFileKey(fileKey);
    setFileName(fileName);
    setPreviewFile(true);
    await triggerFileDetailsQuery({
      AttachmentKey: fileKey,
      AcceptedLanguage: i18n.language.toUpperCase(),
    });
  };

  useEffect(() => {
    if (ackData?.DataElements && setAcknowledgements) {
      setAcknowledgements(ackData.DataElements);
    }
  }, [ackData, setAcknowledgements]);

  const hearingColumns: ColumnDef<Topic>[] = [
    {
      id: "id",
      header: t("no"),
      cell: ({ row }) => row.index + 1,
    },
    {
      id: "mainCategory",
      accessorKey: "mainCategory",
      header: t("mainCategory"),
    },
    {
      id: "subCategory",
      accessorKey: "subCategory",
      header: t("subCategory"),
    },
  ];

  const attachments = [
    ...(details?.CaseTopicAttachments || []),
    ...(details?.OtherAttachments || []),
    ...(details?.RegionalAttachments || []),
  ].map((f: FileType) => ({
    fileName: f.FileName || "Unnamed File",
    fileKey: f.FileKey,
  }));

  const reviewSections: ReviewSection[] = [
    {
      title: t("claimantStatus"),
      data: {
        type: "radio",
        name: "claimantStatus",
        label: t("applicant"),
        options: [
          {
            label: t("worker"),
            value: "Worker",
            description: t("representativeOfClaimant"),
          },
          {
            label: t("employer"),
            value: "Employer",
            description: t("claimant"),
          },
        ],
        value: details?.ApplicantType || "",
        onChange: () => { },
      },
    },
    {
      title: t("claimantDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("idNumber"), value: details?.PlaintiffId || "" },
          { label: t("name"), value: details?.PlaintiffName || "" },
          { label: t("region"), value: details?.Plaintiff_Region || "" },
          { label: t("city"), value: details?.Plaintiff_City || "" },
          {
            label: t("hijriDate"),
            value: formatHijriWithSlashes(details?.PlaintiffHijiriDOB) || "",
          },
          {
            label: t("gregorianDate"),
            value: formatDate(details?.Plaintiff_ApplicantBirthDate) || "",
          },
          {
            label: t("phoneNumber"),
            value: details?.Plaintiff_PhoneNumber || "",
          },
          {
            label: t("occupation"),
            value: details?.Plaintiff_Occupation || "",
          },
          {
            label: t("gender"),
            value: details?.Plaintiff_Gender || "",
          },
          {
            label: t("nationality"),
            value: details?.Plaintiff_Nationality || "",
          },
          {
            label: t("countryCode"),
            value: details?.Plaintiff_Nationality_Code || "",
          },
        ],
      },
    },
    {
      title: t("AgentInformation"),
      data: {
        type: "readonly",
        fields: [
          { label: t("agentCapacity"), value: details?.Agent_Capacity || "" },
          { label: t("emapssyName"), value: details?.Agent_Embassy || "" },
          { label: t("phoneNumber"), value: details?.Agent_PhoneNumber || "" },
          {
            label: t("plaintiffNativeLanguage"),
            value: details?.Plaintiff_FirstLanguage || "",
          },
          { label: t("E-mail"), value: details?.Agent_EmailAddress || "" },
          { label: t("nationality"), value: details?.Agent_Nationality || "" },
        ],
      },
    },
    {
      title: t("defendantDetails"),
      data: {
        type: "radio",
        name: "defendantStatus",
        label: t("Defendant's Type:"),
        options: [
          { label: hearingdetails("nonGovernmentalEntities"), value: "Establishment" },
          { label: t("establishments"), value: "Governmental Entities" },
        ],
        value: details?.DefendantType || "",
        onChange: () => { },
      },
    },
    {
      data: {
        type: "readonly",
        fields: [
          { label: t("fileNumber"), value: details?.FileNumber || "" },
          { label: t("CRNumber"), value: details?.Defendant_CRNumber || "" },
          {
            label: t("phoneNumber"),
            value: details?.Defendant_PhoneNumber || "",
          },
          { label: t("region"), value: details?.Defendant_Region || "" },
          { label: t("city"), value: details?.Defendant_City || "" },
          {
            label: t("nearestLabourOffice"),
            value: details?.Nearest_LabourOffice || "",
          },
        ],
      },
    },
    {
      title: t("hearingTopics"),
      data: {
        type: "table",
        records: (details?.CaseTopics || []).map(
          (topic: any, index: number) => ({
            id: index + 1,
            mainCategory: topic.CaseTopicName || "",
            subCategory: topic.SubTopicName || "",
          })
        ),
      },
    },
    {
      title: t("attachedFiles"),
      data: {
        type: "file",
        files: [
          ...(details?.CaseTopicAttachments || []),
          ...(details?.OtherAttachments || []),
          ...(details?.RegionalAttachments || []),
        ].map((f: FileType) => ({
          fileName: f.FileName || "Unnamed File",
          fileKey: f.FileKey,
        })),
      },
    },
  ];

  const reviewSectionWorkerGov: ReviewSection[] = [
    {
      title: t("claimantDetails"),
      data: {
        type: "readonly",
        fields: [
          {
            label: t("name"),
            value: details?.PlaintiffName || "",
          },
          {
            label: t("idNumber"),
            value: details?.PlaintiffId || "",
          },
          { label: t("region"), value: details?.Plaintiff_Region || "" },
          { label: t("city"), value: details?.Plaintiff_City || "" },
          {
            label: t("hijriDate"),
            value: formatHijriWithSlashes(details?.PlaintiffHijiriDOB) || "",
          },
          {
            label: t("gregorianDate"),
            value: formatDate(details?.Plaintiff_ApplicantBirthDate) || "",
          },
          {
            label: t("occupation"),
            value: details?.Plaintiff_Occupation || "",
          },
          {
            label: t("nationality"),
            value: details?.Plaintiff_Nationality || "",
          },
          { label: t("gender"), value: details?.Plaintiff_Gender || "" },
          { label: t("workerType"), value: details?.PlaintiffType || "" },
        ],
      },
    },
    {
      title: t("defendantDetails"),
      data: {
        type: "readonly",
        fields: [
          {
            label: t("mainCategory"),
            value: details?.Defendant_MainGovtDefend || "",
          },
          {
            label: t("subCategory"),
            value: details?.DefendantSubGovtDefend || "",
          },
        ],
      },
    },
    {
      title: t("workDetails"),
      data: {
        type: "readonly",
        fields: [
          {
            label: t("salaryType"),
            value: details?.Plaintiff_SalaryType || "",
          },
          { label: t("currentSalary"), value: details?.Plaintiff_Salary || "" },
          {
            label: t("contractType"),
            value: details?.Plaintiff_ContractType || "",
          },
          {
            label: t("contractNumber"),
            value: details?.Plaintiff_ContractNumber || "",
          },
          {
            label: t("contractDateHijri"),
            value: formatDate(details?.Plaintiff_ContractStartDateHijri) || "",
          },
          {
            label: t("contractDateGregorian"),
            value: formatDate(details?.Plaintiff_ContractStartDate) || "",
          },
          {
            label: t("contractExpiryDateHijri"),
            value: formatDate(details?.Plaintiff_ContractEndDateHijri) || "",
          },
          {
            label: t("contractExpiryDateGregorian"),
            value: formatDate(details?.Plaintiff_ContractEndDate) || "",
          },
          {
            label: t("stillEmployed"),
            value:
              details?.Plaintiff_StillWorking_Code === "SW1"
                ? t("yes")
                : t("not") || "",
          },
          {
            label: t("fristWorkingDayDate"),
            value: formatDate(details?.Plaintiff_JobStartDate) || "",
          },
          {
            label: t("lastWorkingDayDate"),
            value: formatDate(details?.Plaintiff_JobEndDate) || "",
          },
        ],
      },
    },
    {
      title: t("workLocationDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("region"), value: details?.Plaintiff_JobLocation || "" },
          { label: t("city"), value: details?.PlaintiffJobCity || "" },
          { label: t("nearestLabourOffice"), value: details?.OfficeName || "" },
        ],
      },
    },
    {
      title: t("hearingTopics"),
      data: {
        type: "table",
        records: (details?.CaseTopics || []).map(
          (topic: any, index: number) => ({
            id: index + 1,
            mainCategory: topic.CaseTopicName || "",
            subCategory: topic.SubTopicName || "",
          })
        ),
      },
    },
    {
      title: t("attachedFiles"),
      data: {
        type: "file",
        files: attachments,
      },
    },
  ];

  // hassan code 700
  const reviewSectionWorkerEstablishment: ReviewSection[] = [
    {
      title: t("claimantDetails"),
      data: {
        type: "readonly",
        fields: [
          {
            label: t("name"),
            value: details?.PlaintiffName || "",
          },
          {
            label: t("idNumber"),
            value: details?.PlaintiffId || "",
          },
          { label: t("region"), value: details?.Plaintiff_Region || "" },
          { label: t("city"), value: details?.Plaintiff_City || "" },
          {
            label: t("hijriDate"),
            value: formatHijriWithSlashes(details?.PlaintiffHijiriDOB) || "",
          },
          {
            label: t("gregorianDate"),
            value: formatDate(details?.Plaintiff_ApplicantBirthDate) || "",
          },
          {
            label: t("occupation"),
            value: details?.Plaintiff_Occupation || "",
          },
          {
            label: t("nationality"),
            value: details?.Plaintiff_Nationality || "",
          },
          { label: t("gender"), value: details?.Plaintiff_Gender || "" },
          { label: t("workerType"), value: details?.PlaintiffType || "" },
        ],
      },
    },
    // hassan code 700
    {
      title: t("defendantDetails"),
      data: {
        type: "readonly",
        fields: [
          {
            label: t("establishmentName"),
            value: details?.DefendantName || "",
          },
          {
            label: t("fileNumber"),
            value: details?.DefendantEstFileNumber || "",
          },
          {
            label: t("commercialRegistrationNumber"),
            value: details?.Defendant_CRNumber || "",
          },
          {
            label: t("number700"),
            value: details?.Defendant_Number700 || "",
          },
          {
            label: t("phoneNumber"),
            value: details?.Defendant_PhoneNumber || "",
          },
          { label: t("region"), value: details?.Defendant_Region || "" },
          { label: t("city"), value: details?.Defendant_City || "" },
        ],
      },
    },
    {
      title: t("workDetails"),
      data: {
        type: "readonly",
        fields: [
          {
            label: t("salaryType"),
            value: details?.Plaintiff_SalaryType || "",
          },
          { label: t("currentSalary"), value: details?.Plaintiff_Salary || "" },
          {
            label: t("contractType"),
            value: details?.Plaintiff_ContractType || "",
          },
          {
            label: t("contractNumber"),
            value: details?.Plaintiff_ContractNumber || "",
          },
          {
            label: t("contractDateHijri"),
            value: formatDate(details?.Plaintiff_ContractStartDateHijri) || "",
          },
          {
            label: t("contractDateGregorian"),
            value: formatDate(details?.Plaintiff_ContractStartDate) || "",
          },
          {
            label: t("contractExpiryDateHijri"),
            value: formatDate(details?.Plaintiff_ContractEndDateHijri) || "",
          },
          {
            label: t("contractExpiryDateGregorian"),
            value: formatDate(details?.Plaintiff_ContractEndDate) || "",
          },
          {
            label: t("stillEmployed"),
            value:
              details?.Plaintiff_StillWorking_Code === "SW1"
                ? t("yes")
                : t("not") || "",
          },
          {
            label: t("fristWorkingDayDate"),
            value: formatDate(details?.Plaintiff_JobStartDate) || "",
          },
          {
            label: t("lastWorkingDayDate"),
            value: formatDate(details?.Plaintiff_JobEndDate) || "",
          },
        ],
      },
    },
    {
      title: t("workLocationDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("region"), value: details?.Plaintiff_JobLocation || "" },
          { label: t("city"), value: details?.PlaintiffJobCity || "" },
          { label: t("nearestLabourOffice"), value: details?.OfficeName || "" },
        ],
      },
    },
    {
      title: t("hearingTopics"),
      data: {
        type: "table",
        records: (details?.CaseTopics || []).map(
          (topic: any, index: number) => ({
            id: index + 1,
            mainCategory: topic.CaseTopicName || "",
            subCategory: topic.SubTopicName || "",
          })
        ),
      },
    },
    {
      title: t("attachedFiles"),
      data: {
        type: "file",
        files: attachments,
      },
    },
  ];

  // hassan code 700
  const defSection: ReviewSection[] =
    details?.DefendantType_Code === "Establishment"
      ? [
        {
          data: {
            type: "readonly",
            fields: [
              {
                label: t("establishmentName"),
                value: details?.EstablishmentFullName || "",
              },
              { label: t("fileNumber"), value: details?.DefendantEstFileNumber || "" },
              {
                label: t("commercialRegistrationNumber"),
                value: details?.Defendant_CRNumber || "",
              },
              {
                label: t("number700"),
                value: details?.Defendant_Number700 || "",
              },
              {
                label: t("phoneNumber"),
                value: details?.Defendant_PhoneNumber || "",
              },
              { label: t("region"), value: details?.Defendant_Region || "" },
              { label: t("city"), value: details?.Defendant_City || "" },
            ],
          },
        },
      ]
      : [
        {
          data: {
            type: "readonly",
            fields: [
              {
                label: t("mainCategory"),
                value: details?.Defendant_MainGovtDefend || "",
              },
              {
                label: t("subCategory"),
                value: details?.DefendantSubGovtDefend || "",
              },
            ],
          },
        },
      ];

  const reviewSectionEmbasyAsPrincipal: ReviewSection[] = [
    {
      title: t("claimantDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("name"), value: details?.PlaintiffName || "" },
          { label: t("idNumber"), value: details?.PlaintiffId || "" },
          {
            label: t("nationality"),
            value: details?.Plaintiff_Nationality || "",
          },
          {
            label: t("phoneNumber"),
            value: details?.Plaintiff_PhoneNumber || "",
          },
          {
            label: t("plaintiffNativeLanguage"),
            value: details?.Plaintiff_FirstLanguage || "",
          },
          { label: t("region"), value: details?.Plaintiff_Region || "" },
          { label: t("city"), value: details?.Plaintiff_City || "" },
          {
            label: t("hijriDate"),
            value: formatHijriWithSlashes(details?.PlaintiffHijiriDOB) || "",
          },
          {
            label: t("gregorianDate"),
            value: formatDate(details?.Plaintiff_ApplicantBirthDate) || "",
          },
          {
            label: t("phoneNumber"),
            value: details?.Plaintiff_PhoneNumber || "",
          },
          {
            label: t("occupation"),
            value: details?.Plaintiff_Occupation || "",
          },
          {
            label: t("gender"),
            value: details?.Plaintiff_Gender || "",
          },
        ],
      },
    },
    {
      title: t("defendantDetails"),
      data: {
        type: "radio",
        name: "defendantStatus",
        label: t("Defendant's Type:"),
        options: [
          { label: hearingdetails("nonGovernmentalEntities"), value: "Establishment" },
          { label: t("establishments"), value: "Governmental Entities" },
        ],
        value: details?.DefendantType_Code || "",
        onChange: () => { },
      },
    },
    ...defSection,
    {
      title: t("workDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("currentSalary"), value: details?.Plaintiff_Salary || "" },
          {
            label: t("contractType"),
            value: details?.Plaintiff_SalaryType || "",
          },
          {
            label: t("contractNumber"),
            value: details?.Plaintiff_ContractNumber || "",
          },
          {
            label: t("contractDateGregorian"),
            value: formatDate(details?.Plaintiff_ContractStartDate) || "",
          },
          {
            label: t("contractExpiryDateGregorian"),
            value: formatDate(details?.Plaintiff_ContractEndDate) || "",
          },
          {
            label: t("stillEmployed"),
            value:
              details?.Plaintiff_StillWorking_Code === "SW1"
                ? t("yes")
                : t("not") || "",
          },
          {
            label: t("fristWorkingDayDate"),
            value: formatDate(details?.Plaintiff_JobStartDate) || "",
          },
          ...(!(details?.Plaintiff_StillWorking_Code === "SW1")
            ? [
              {
                label: t("lastWorkingDayDate"),
                value: formatDate(details?.Plaintiff_JobEndDate) || "",
              },
            ]
            : []),
        ],
      },
    },
    {
      title: t("workLocationDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("region"), value: details?.Plaintiff_JobLocation || "" },
          { label: t("city"), value: details?.PlaintiffJobCity || "" },
          { label: t("nearestLabourOffice"), value: details?.OfficeName || "" },
        ],
      },
    },
    {
      title: t("hearingTopics"),
      data: {
        type: "table",
        records: (details?.CaseTopics || []).map(
          (topic: any, index: number) => ({
            id: index + 1,
            mainCategory: topic.CaseTopicName || "",
            subCategory: topic.SubTopicName || "",
          })
        ),
      },
    },
    {
      title: t("attachedFiles"),
      data: {
        type: "file",
        files: [
          ...(details?.CaseTopicAttachments || []),
          ...(details?.OtherAttachments || []),
          ...(details?.RegionalAttachments || []),
        ].map((f: FileType) => ({
          fileName: f.FileName || "Unnamed File",
          fileKey: f.FileKey,
        })),
      },
    },
  ];

  const reviewSectionEmbasyAsAgent: ReviewSection[] = [
    {
      title: t("AgentInformation"),
      data: {
        type: "readonly",
        fields: [
          { label: t("emapssyName"), value: details?.EmbassyName || "" },
          { label: t("E-mail"), value: details?.EmbassyEmailAddress || "" },
          { label: t("nationality"), value: details?.EmbassyNationality || "" },
          { label: t("phoneNumber"), value: details?.EmbassyPhone || "" },
          {
            label: t("plaintiffNativeLanguage"),
            value: details?.EmbassyFirstLanguage || "",
          },
        ],
      },
    },
    {
      title: t("plaintiffDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("idNumber"), value: details?.PlaintiffId || "" },
          { label: t("name"), value: details?.PlaintiffName || "" },
          { label: t("region"), value: details?.Plaintiff_Region || "" },
          { label: t("city"), value: details?.Plaintiff_City || "" },
          {
            label: t("hijriDate"),
            value: formatHijriWithSlashes(details?.PlaintiffHijiriDOB) || "",
          },
          {
            label: t("gregorianDate"),
            value: formatDate(details?.Plaintiff_ApplicantBirthDate) || "",
          },
          {
            label: t("phoneNumber"),
            value: details?.Plaintiff_PhoneNumber || "",
          },
          {
            label: t("occupation"),
            value: details?.Plaintiff_Occupation || "",
          },
          { label: t("gender"), value: details?.Plaintiff_Gender || "" },
          {
            label: t("nationality"),
            value: details?.Plaintiff_Nationality || "",
          },
        ],
      },
    },
    {
      title: t("defendantDetails"),
      data: {
        type: "radio",
        name: "defendantStatus",
        label: t("Defendant's Type:"),
        options: [
          { label: hearingdetails("nonGovernmentalEntities"), value: "Establishment" },
          { label: t("establishments"), value: "Governmental Entities" },
        ],
        value: details?.DefendantType_Code || "",
        onChange: () => { },
      },
    },
    ...defSection,
    {
      title: t("workDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("currentSalary"), value: details?.Plaintiff_Salary || "" },
          {
            label: t("contractType"),
            value: details?.Plaintiff_SalaryType || "",
          },
          {
            label: t("contractNumber"),
            value: details?.Plaintiff_ContractNumber || "",
          },
          {
            label: t("contractDateGregorian"),
            value: formatDate(details?.Plaintiff_ContractStartDate) || "",
          },
          {
            label: t("contractExpiryDateGregorian"),
            value: formatDate(details?.Plaintiff_ContractEndDate) || "",
          },
          {
            label: t("stillEmployed"),
            value:
              details?.Plaintiff_StillWorking_Code === "SW1"
                ? t("yes")
                : t("not") || "",
          },
          {
            label: t("fristWorkingDayDate"),
            value: formatDate(details?.Plaintiff_JobStartDate) || "",
          },
          {
            label: t("lastWorkingDayDate"),
            value: formatDate(details?.Plaintiff_JobEndDate) || "",
          },
        ],
      },
    },
    {
      title: t("workLocationDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("region"), value: details?.Plaintiff_JobLocation || "" },
          { label: t("city"), value: details?.PlaintiffJobCity || "" },
          { label: t("nearestLabourOffice"), value: details?.OfficeName || "" },
        ],
      },
    },
    {
      title: t("hearingTopics"),
      data: {
        type: "table",
        records: (details?.CaseTopics || []).map(
          (topic: any, index: number) => ({
            id: index + 1,
            mainCategory: topic.CaseTopicName || "",
            subCategory: topic.SubTopicName || "",
          })
        ),
      },
    },
    {
      title: t("attachedFiles"),
      data: {
        type: "file",
        files: [
          ...(details?.CaseTopicAttachments || []),
          ...(details?.OtherAttachments || []),
          ...(details?.RegionalAttachments || []),
        ].map((f: FileType) => ({
          fileName: f.FileName || "Unnamed File",
          fileKey: f.FileKey,
        })),
      },
    },
  ];

  const reviewSectionLegRep: ReviewSection[] = [
    {
      title: t("claimantDetails"),
      data: {
        type: "readonly",
        fields: [
          {
            label: t("mainCategory"),
            value: details?.Plaintiff_MainGovt || "",
          },
          {
            label: t("subCategory"),
            value: details?.Plaintiff_SubGovt || "",
          },
        ],
      },
    },
    {
      title: t("legalRepDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("name"), value: details?.RepresentativeName || "" },
          { label: t("idNumber"), value: details?.RepresentativeID || "" },
          // {
          //   label: t("hijriDate"),
          //   value: details?.Rep_BirthDate ? formatDate(details.Rep_BirthDate) : "-",
          // },
          { label: t("phoneNumber"), value: details?.Rep_PhoneNumber || "" },
          { label: t("E-mail"), value: details?.Rep_EmailAddress || "" },
        ],
      },
    },
    {
      title: t("defendantDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("idNumber"), value: details?.DefendantId || "" },
          { label: t("name"), value: details?.DefendantName || "" },
          {
            label: t("phoneNumber"),
            value: details?.Defendant_PhoneNumber || "",
          },
          {
            label: t("hijriDate"),
            value: formatHijriWithSlashes(details?.DefendantHijiriDOB) || "",
          },
          {
            label: t("gregorianDate"),
            value: formatDate(details?.Defendant_ApplicantBirthDate) || "",
          },
          { label: t("region"), value: details?.Defendant_Region || "" },
          { label: t("city"), value: details?.Defendant_City || "" },
          { label: t("gender"), value: details?.Defendant_Gender || "" },
          {
            label: t("nationality"),
            value: details?.Defendant_Nationality || "",
          },
          {
            label: t("occupation"),
            value: details?.Defendant_Occupation || "",
          },
          { label: t("workerType"), value: details?.DefendantType || "" },
        ],
      },
    },
    {
      title: t("workDetails"),
      data: {
        type: "readonly",
        fields: [
          {
            label: t("typeOfWage"),
            value: details?.Defendant_SalaryType || "",
          },
          { label: t("currentSalary"), value: details?.Defendant_Salary || "" },
          {
            label: t("contractType"),
            value: details?.Defendant_ContractType || "",
          },
          {
            label: t("contractNumber"),
            value: details?.Defendant_ContractNumber || "",
          },
          {
            label: t("contractDateHijri"),
            value: formatDate(details?.Defendant_ContractStartDateHijri) || "",
          },
          {
            label: t("contractDateGregorian"),
            value: formatDate(details?.Defendant_ContractStartDate) || "",
          },
          {
            label: t("contractExpiryDateHijri"),
            value: formatDate(details?.Defendant_ContractEndDateHijri) || "",
          },
          {
            label: t("contractExpiryDateGregorian"),
            value: formatDate(details?.Defendant_ContractEndDate) || "",
          },
          {
            label: t("stillEmployed"),
            value:
              details?.Defendant_StillWorking_Code === "SW1"
                ? t("yes")
                : t("not") || "",
          },
          {
            label: t("fristWorkingDayDate"),
            value: formatDate(details?.Defendant_JobStartDate) || "",
          },
          {
            label: t("lastWorkingDayDate"),
            value: formatDate(details?.Defendant_JobEndDate) || "",
          },
        ],
      },
    },
    {
      title: t("workLocationDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("region"), value: details?.Defendant_JobLocation || "" },
          { label: t("city"), value: details?.DefendantJobCity || "" },
          { label: t("nearestLabourOffice"), value: details?.OfficeName || "" },
        ],
      },
    },
    {
      title: t("hearingTopics"),
      data: {
        type: "table",
        records: (details?.CaseTopics || []).map(
          (topic: any, index: number) => ({
            id: index + 1,
            mainCategory: topic.CaseTopicName || "",
            subCategory: topic.SubTopicName || "",
          })
        ),
      },
    },
    {
      title: t("attachedFiles"),
      data: {
        type: "file",
        files: [
          ...(details?.CaseTopicAttachments || []),
          ...(details?.OtherAttachments || []),
          ...(details?.RegionalAttachments || []),
        ].map((f: FileType) => ({
          fileName: f.FileName || "Unnamed File",
          fileKey: f.FileKey,
        })),
      },
    },
  ];

  // hassan code 700
  const reviewSectionEstablishment: ReviewSection[] = [
    {
      title: t("claimantDetails"),
      data: {
        type: "readonly",
        fields: [
          {
            label: t("establishmentName"),
            value: details?.PlaintiffName || "",
          },
          {
            label: t("fileNumber"),
            value: details?.PlaintiffEstFileNumber || "",
          },
          {
            label: t("number700"),
            value: details?.Plaintiff_Number700 || "",
          },
          {
            label: t("commercialRegistrationNumber"),
            value: details?.Plaintiff_CRNumber || "",
          },
          { label: t("region"), value: details?.Plaintiff_Region || "" },
          { label: t("city"), value: details?.Plaintiff_City || "" },
          {
            label: t("phoneNumber"),
            value: details?.Plaintiff_PhoneNumber || "",
          },
        ],
      },
    },
    {
      title: t("defendantDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("idNumber"), value: details?.DefendantId || "" },
          { label: t("name"), value: details?.DefendantName || "" },
          {
            label: t("hijriDate"),
            value: formatHijriWithSlashes(details?.DefendantHijiriDOB) || "",
          },
          {
            label: t("phoneNumber"),
            value: details?.Defendant_PhoneNumber || "",
          },
          { label: t("gender"), value: details?.Defendant_Gender || "" },
          {
            label: t("nationality"),
            value: details?.Defendant_Nationality || "",
          },
          { label: t("region"), value: details?.Defendant_Region || "" },
          { label: t("city"), value: details?.Defendant_City || "" },
        ],
      },
    },
    {
      title: t("workDetails"),
      data: {
        type: "readonly",
        fields: [
          {
            label: t("typeOfWage"),
            value: details?.Defendant_SalaryType || "",
          },
          { label: t("currentSalary"), value: details?.Defendant_Salary || "" },
          {
            label: t("contractType"),
            value: details?.Defendant_ContractType || "",
          },
          {
            label: t("contractNumber"),
            value: details?.Defendant_ContractNumber || "",
          },
          {
            label: t("contractDateGregorian"),
            value: formatDate(details?.Defendant_ContractStartDate) || "",
          },
          {
            label: t("contractExpiryDateGregorian"),
            value: formatDate(details?.Defendant_ContractEndDate) || "",
          },
          {
            label: t("stillEmployed"),
            value:
              details?.Defendant_StillWorking_Code === "SW1"
                ? t("yes")
                : t("not") || "",
          },
          {
            label: t("fristWorkingDayDate"),
            value: formatDate(details?.Defendant_JobStartDate) || "",
          },
          {
            label: t("lastWorkingDayDate"),
            value: formatDate(details?.Defendant_JobEndDate) || "",
          },
        ],
      },
    },
    {
      title: t("workLocationDetails"),
      data: {
        type: "readonly",
        fields: [
          { label: t("region"), value: details?.Defendant_JobLocation || "" },
          { label: t("city"), value: details?.DefendantJobCity || "" },
          { label: t("nearestLabourOffice"), value: details?.OfficeName || "" },
        ],
      },
    },
    {
      title: t("hearingTopics"),
      data: {
        type: "table",
        records: (details?.CaseTopics || []).map(
          (topic: any, index: number) => ({
            id: index + 1,
            mainCategory: topic.CaseTopicName || "",
            subCategory: topic.SubTopicName || "",
          })
        ),
      },
    },
    {
      title: t("attachedFiles"),
      data: {
        type: "file",
        files: attachments,
      },
    },
  ];

  const reviewSectionsMemo: ReviewSection[] = useMemo(() => {
    const typeOfUser = userType.toLowerCase();
    const claimantStatus = details?.PlaintiffType_Code?.toLowerCase();

    if (typeOfUser === "embassy user") {
      if (claimantStatus === "self(worker)") {
        return reviewSectionEmbasyAsPrincipal;
      }
      if (claimantStatus === "agent") {
        return reviewSectionEmbasyAsAgent;
      }
    }

    switch (typeOfUser) {
      case "legal representative":
        return reviewSectionLegRep;
      case "establishment":
        return reviewSectionEstablishment;
      case "worker":
        if (defendantStatus == "Government") {
          return reviewSectionWorkerGov;
        } else {
          return reviewSectionWorkerEstablishment;
        }
      default:
        return reviewSections;
    }
  }, [caseDetailsData, userType, details?.ApplicantType, defendantStatus]);

  return (
    <div className={classes("w-full space-y-6 !mb-0")}>
      {reviewSectionsMemo.map(({ title, data, hideTitle }, idx) => (
        <Section
          key={title || idx}
          title={hideTitle ? "" : title}
          className={`${data.type === "radio" || data.type === "table"
            ? "grid grid-cols-1 gap-x-6 gap-y-6"
            : "grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 gap-x-6 gap-y-6"
            }`}
        >
          {data.type === "radio" && (
            <RadioGroup
              notRequired
              name={data.name}
              label={data.label}
              options={data.options.filter((opt) => opt.value === data.value)}
              value={data.value}
              onChange={data.onChange}
            />
          )}
          {data.type === "readonly" &&
            data.fields.map(({ label, value }, i) => (
              <ReadOnlyField key={i} notRequired label={label} value={value} />
            ))}
          {data.type === "table" && (
            <Suspense fallback={<TableLoader />}>
              <ReusableTable
                data={data.records}
                //@ts-ignore
                columns={hearingColumns}
                page={1}
                totalPages={10}
                onPageChange={() => { }}
                hidePagination
              />
            </Suspense>
          )}
          {data.type === "file" && (
            <Suspense fallback={<p>Loading files...</p>}>
              <div className="grid grid-cols-1 gap-x-6 gap-y-6">
                {data.files.length === 0 ? (
                  <p className="text-gray-500 italic">{t("no_attachments")}</p>
                ) : (
                  data.files.map(({ fileName, fileKey }, i) => (
                    <FileAttachment
                      key={i}
                      fileName={fileName}
                      onView={() => onView(fileKey, fileName)}
                      className="w-full"
                    />
                  ))
                )}
              </div>
            </Suspense>
          )}
        </Section>
      ))}

      <Section
        title={t("acknowledgment")}
        className="grid-cols-1 gap-x-6 gap-y-6"
      >
        <AutoCompleteField
          className="!w-80"
          notRequired
          options={[
            { label: "English", value: "EN" },
            { label: "Arabic", value: "AR" },
          ]}
          label={t("ack_lang")}
          value={selectedLang}
          onChange={(selectedOption) => {
            if (selectedOption) {
              setSelectedLang(
                selectedOption as { label: string; value: string }
              );
            }
          }}
          invalidFeedback={selectedLang === null ? "Select language" : ""}
        />
        <div
          className="w-full space-y-4 medium tracking-wider"
          dir={selectedLang.value === 'AR' ? 'rtl' : 'ltr'}
        >
          {ackData?.DataElements?.map((val: any, idx: number) => (
            <p key={idx}>{val.ElementValue}</p>
          ))}
        </div>
        <CheckboxField
          name="acknowledge"
          label={t("acknowledge_desc")}
          control={control}
          rules={{ required: true }}
          defaultValue={false}
        />
      </Section>
      {/* <Section title={t("acknowledgment")} className="grid-cols-1 gap-x-6 gap-y-6">
        <AutoCompleteField
          className="!w-80"
          notRequired
          options={[
            { label: "English", value: "EN" },
            { label: "Arabic", value: "AR" },
          ]}
          label={t("ack_lang")}
          value={selectedLang}
          onChange={(selectedOption) => {
            if (selectedOption) {
              setSelectedLang(selectedOption as { label: string; value: string });
            }
          }}
          invalidFeedback={selectedLang === null ? "Select language" : ""}
        />
        <div className="w-full space-y-4 medium tracking-wider">
          {ackData?.DataElements?.map((val: any, idx: number) => (
            <p key={idx}>{val.ElementValue}</p>
          ))}
        </div>
        <CheckboxField
          name="acknowledge"
          label={t("acknowledge_desc")}
          control={control}
          rules={{ required: true }}
          defaultValue={false}
        />
      </Section> */}
      {fileBase64?.Base64Stream && fileKey && previewFile && (
        <Modal
          header={fileName}
          close={() => {
            setPreviewFile(false);
            setFileKey("");
            setFileName("");
          }}
          modalWidth={800}
          className="!max-h-max !m-0"
        >
          <div className="w-full h-[80vh] overflow-auto">
            {fileBase64?.pyFileName.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={`data:application/pdf;base64,${fileBase64.Base64Stream}`}
                className="w-full h-full border-none"
              />
            ) : (
              <img
                src={`data:image/*;base64,${fileBase64.Base64Stream}`}
                alt={fileName}
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default withStepNavigation(ReviewDetails);
