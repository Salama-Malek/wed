import { ReviewSection } from "./ReviewSectionRenderer";
import { useTranslation } from "react-i18next";

interface Topic {
  TopicName?: string;
  SubTopicName?: string;
}

interface Attachment {
  FileName?: string;
  FileKey?: string;
}

interface Details {
  ApplicantType?: string;
  PlaintiffId?: string;
  PlaintiffName?: string;
  Plaintiff_Region?: string;
  Plaintiff_City?: string;
  PlaintiffHijiriDOB?: string;
  Plaintiff_Gregorian?: string;
  Plaintiff_PhoneNumber?: string;
  Plaintiff_Occupation?: string;
  Plaintiff_Gender?: string;
  Plaintiff_Nationality?: string;
  Plaintiff_Nationality_Code?: string;
  Agent_PhoneNumber?: string;
  Plaintiff_FirstLanguage?: string;
  Agent_EmailAddress?: string;
  DefendantType?: string;
  Defendant_CRNumber?: string;
  Defendant_Region?: string;
  Defendant_City?: string;
  Plaintiff_SalaryType?: string;
  Plaintiff_Salary?: string;
  Plaintiff_ContractType?: string;
  Plaintiff_ContractNumber?: string;
  Plaintiff_JobStartDate?: string;
  Plaintiff_JobEndDate?: string;
  Plaintiff_StillWorking?: string;
  RegionalAttachments?: Attachment[];
  CaseTopics?: Topic[];
}

export function buildReviewSections(details: Details): ReviewSection[] {
  const { t } = useTranslation("reviewdetails");

  return [
    {
      title: t("claimantDetails"),
      fields: [
        { label: t("idNumber"), value: details.PlaintiffId },
        { label: t("name"), value: details.PlaintiffName },
        { label: t("region"), value: details.Plaintiff_Region },
        { label: t("city"), value: details.Plaintiff_City },
        { label: t("hijriDate"), value: details.PlaintiffHijiriDOB },
        { label: t("gregorianDate"), value: details.Plaintiff_Gregorian },
        { label: t("phoneNumber"), value: details.Plaintiff_PhoneNumber },
        { label: t("occupation"), value: details.Plaintiff_Occupation },
        { label: t("gender"), value: details.Plaintiff_Gender },
        { label: t("nationality"), value: details.Plaintiff_Nationality },
      ],
    },
    {
      title: t("agentInformation"),
      fields: [
        { label: t("phoneNumber"), value: details.Agent_PhoneNumber },
        { label: t("plaintiffNativeLanguage"), value: details.Plaintiff_FirstLanguage },
        { label: t("E-mail"), value: details.Agent_EmailAddress },
      ],
    },
    {
      title: t("defendantDetails"),
      fields: [
        { label: t("typeOfDefendant"), value: details.DefendantType },
        { label: t("CRNumber"), value: details.Defendant_CRNumber },
        { label: t("region"), value: details.Defendant_Region },
        { label: t("city"), value: details.Defendant_City },
      ],
    },
    {
      title: t("workDetails"),
      fields: [
        { label: t("typeOfWage"), value: details.Plaintiff_SalaryType },
        { label: t("currentSalary"), value: details.Plaintiff_Salary },
        { label: t("contractType"), value: details.Plaintiff_ContractType },
        { label: t("contractNumber"), value: details.Plaintiff_ContractNumber },
        { label: t("contractHijriDate"), value: details.Plaintiff_JobStartDate },
        { label: t("contractGregorianDate"), value: details.Plaintiff_JobEndDate },
        { label: t("stillEmployed"), value: details.Plaintiff_StillWorking },
      ],
    },
    {
      title: t("attachedFiles"),
      fields: (details.RegionalAttachments || []).map(att => ({
        label: att.FileName || "",
        value: att.FileKey || "",
      })),
    },
    {
      title: t("hearingTopics"),
      fields: (details.CaseTopics || []).flatMap((tp, i) => [
        { label: `${i + 1}. ${t("mainCategory")}`, value: tp.TopicName },
        { label: `${i + 1}. ${t("subCategory")}`, value: tp.SubTopicName },
      ]),
    },
  ];
}