import React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "@/shared/layouts/Section";
import { ReadOnlyField } from "@/shared/components/ui/read-only-view";
import { formatDate } from "@/utils/formatters";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";

function formatHijriWithSlashes(date: string): string {
  if (!date) return "";
  if (date.includes("/")) return date;
  if (/^\d{8}$/.test(date)) return formatDate(date);
  if (/^\d{6}$/.test(date)) {
    const year = date.substring(0, 2);
    const month = date.substring(2, 4);
    const day = date.substring(4, 6);
    return `${day}/${month}/14${year}`;
  }
  return date;
}

interface DataDetailsProps {
  hearing: any;
}
interface SectionOrder {
  [key: string]: {
    title: string;
    fields: string[];
  };
}

const formatLabel = (key: string): string =>
  key
    .replace(/[_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

// Legel Rep Review
const sectionOrder: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: ["Plaintiff_MainGovt", "Plaintiff_SubGovt"],
  },
  representative: {
    title: "representative_details",
    fields: [
      "RepresentativeType",
      "RepresentativeName",
      "RepresentativeID",
      "Rep_PhoneNumber",
      "Rep_EmailAddress",
      "Rep_BirthDate",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: [
      "DefendantId",
      "DefendantName",
      "Defendant_ApplicantBirthDate",
      "DefendantHijiriDOB",
      "Defendant_PhoneNumber",
      "Defendant_MobileNumber",
      "Defendant_EmailAddress",
      "Defendant_Occupation",
      "Defendant_Region",
      "Defendant_City",
      "Defendant_Gender",
      "Defendant_Nationality",
    ],
  },
  work: {
    title: "work_details",
    fields: [
      "Defendant_SalaryType",
      "Defendant_Salary",
      "Defendant_ContractType",
      "Defendant_ContractNumber",
      "Defendant_ContractStartDate",
      "Defendant_ContractEndDate",
      "Defendant_StillWorking",
      "Defendant_JobStartDate",
      "Defendant_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Defendant_JobLocation", "DefendantJobCity", "OfficeName"],
  },
};
// Legel Rep Review As Defendent
const legelRepSectionOrderAsDef: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_PhoneNumber",
      "Plaintiff_MobileNumber",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_Nationality",
      "Plaintiff_FirstLanguage",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Region",
      "Plaintiff_City",
    ],
  },

  defendant: {
    title: "defendant_details",
    fields: ["Defendant_MainGovtDefend", "DefendantSubGovtDefend"],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],
  },
};
// hassan code 700
// Establishments Review
const sectionForEstablishmentOrder: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffEstFileNumber",
      "Plaintiff_CRNumber",
      "Plaintiff_Number700",
      "PlaintiffName",
      "Plaintiff_Region",
      "Plaintiff_City",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: [
      "DefendantId",
      "DefendantName",
      "Defendant_PhoneNumber",
      "DefendantHijiriDOB",
      "Defendant_ApplicantBirthDate",
      // "Defendant_MobileNumber",
      // "Defendant_EmailAddress",
      "Defendant_Region",
      "Defendant_City",
      "Defendant_Gender",
      "Defendant_Nationality",
      "Defendant_Occupation",
    ],
  },
  work: {
    title: "work_details",
    fields: [
      "Defendant_SalaryType",
      "Defendant_Salary",
      "Defendant_ContractType",
      "Defendant_ContractNumber",
      "Defendant_ContractStartDateHijri",
      "Defendant_ContractStartDate",
      "Defendant_ContractEndDateHijri",
      "Defendant_ContractEndDate",
      "Defendant_StillWorking",
      "Defendant_JobStartDate",
      "Defendant_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Defendant_JobLocation", "DefendantJobCity", "OfficeName"],
  },
};
// hassan code 700
const EstablishmentSectionOrderAsDef: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_PhoneNumber",
      "Plaintiff_MobileNumber",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_Nationality",
      "Plaintiff_FirstLanguage",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Region",
      "Plaintiff_City",
    ],
  },

  defendant: {
    title: "defendant_details",
    fields: [
      "DefendantEstFileNumber",
      "Defendant_CRNumber",
      "Defendant_Number700",
      "DefendantName",
      "Defendant_Region",
      "Defendant_City",
    ],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],
  },
};

const workerSectionOrderAgainistGover: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_PhoneNumber",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_Nationality",
      "Plaintiff_FirstLanguage",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Region",
      "Plaintiff_City",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: ["Defendant_MainGovtDefend", "DefendantSubGovtDefend"],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],

  },
};
const workerSectionOrderAgainistEsta: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_PhoneNumber",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_Nationality",
      "Plaintiff_FirstLanguage",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Region",
      "Plaintiff_City",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: [
      "DefendantEstFileNumber",
      "Defendant_CRNumber",
      "Defendant_Number700",
      "EstablishmentFullName",
      "Defendant_Region",
      "Defendant_City",
    ],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],
  },
};

// Embassy as Agent vs Government
const embasyAsAgentVsGovSectionOrder: SectionOrder = {
  agent: {
    title: "AgentInformation",
    fields: [
      "EmbassyName",
      "EmbassyEmailAddress",
      "EmbassyNationality",
      "EmbassyPhone",
      "EmbassyFirstLanguage",
    ],
  },
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_Region",
      "Plaintiff_City",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_PhoneNumber",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Nationality",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: ["Defendant_MainGovtDefend", "DefendantSubGovtDefend"],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],
  },
};
// hassan code 700
// Embassy as Agent vs Establishment
const embasyAsAgentVsEstSectionOrder: SectionOrder = {
  agent: {
    title: "AgentInformation",
    fields: [
      "EmbassyName",
      "EmbassyEmailAddress",
      "EmbassyNationality",
      "EmbassyPhone",
      "EmbassyFirstLanguage",
    ],
  },
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_Region",
      "Plaintiff_City",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_PhoneNumber",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Nationality",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: [
      "DefendantEstFileNumber",
      "Defendant_CRNumber",
     "Defendant_Number700",
      "DefendantName",
      "EstablishmentFullName",
      "Defendant_Region",
      "Defendant_City",
    ],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],
  },
};
// Embassy as Self vs Government
const embasyAsSelfVsGovSectionOrder: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_PhoneNumber",
      "Plaintiff_MobileNumber",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_Nationality",
      "Plaintiff_FirstLanguage",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Region",
      "Plaintiff_City",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: ["Defendant_MainGovtDefend", "DefendantSubGovtDefend"],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],
  },
};
// Embassy as Self vs Establishment
const embasyAsSelfVsEstSectionOrder: SectionOrder = {
  plaintiff: {
    title: "plaintiff_details",
    fields: [
      "PlaintiffId",
      "PlaintiffName",
      "Plaintiff_PhoneNumber",
      "Plaintiff_MobileNumber",
      "PlaintiffHijiriDOB",
      "Plaintiff_ApplicantBirthDate",
      "Plaintiff_Nationality",
      "Plaintiff_FirstLanguage",
      "Plaintiff_Occupation",
      "Plaintiff_Gender",
      "Plaintiff_Region",
      "Plaintiff_City",
    ],
  },
  defendant: {
    title: "defendant_details",
    fields: [
      "DefendantEstFileNumber",
      "Defendant_CRNumber",
     "Defendant_Number700",
      "DefendantName",
      "Defendant_Region",
      "Defendant_City",
    ],
  },
  work: {
    title: "work_details",
    fields: [
      "Plaintiff_SalaryType",
      "Plaintiff_Salary",
      "Plaintiff_ContractType",
      "Plaintiff_ContractNumber",
      "Plaintiff_ContractStartDate",
      "Plaintiff_ContractEndDate",
      "Plaintiff_StillWorking",
      "Plaintiff_JobStartDate",
      "Plaintiff_JobEndDate",
    ],
  },
  location: {
    title: "work_location_details",
    fields: ["Plaintiff_JobLocation", "PlaintiffJobCity", "OfficeName"],

  },
};

// Hassan Add This  for legel rep
const filterAndOrderData = (data: any, userType?: string) => {
  let selected_Section: SectionOrder = {};
  if (userType?.toLowerCase() === "legal representative") {
    if (data["DefendantType_Code"] === "Government") {
      selected_Section = legelRepSectionOrderAsDef;
    } else {
      selected_Section = sectionOrder;
    }
  }
  if (userType?.toLowerCase() === "establishment") {
    if (data["DefendantType_Code"] === "Establishment") {
      selected_Section = EstablishmentSectionOrderAsDef;
    } else {
      selected_Section = sectionForEstablishmentOrder;
    }
  }
  if (userType?.toLowerCase() === "embassy user") {
    if (data["PlaintiffType_Code"].toLowerCase() === "agent") {
      if (data["DefendantType_Code"] === "Government") {
        selected_Section = embasyAsAgentVsGovSectionOrder;
      } else {
        selected_Section = embasyAsAgentVsEstSectionOrder;
      }
    } else {
      if (data["DefendantType_Code"] === "Government") {
        selected_Section = embasyAsSelfVsGovSectionOrder;
      } else {
        selected_Section = embasyAsSelfVsEstSectionOrder;
      }
    }
  }

  if (userType?.toLowerCase() === "worker") {
    if (data["DefendantType_Code"] === "Government") {
      selected_Section = workerSectionOrderAgainistGover;
    } else {
      selected_Section = workerSectionOrderAgainistEsta;
    }
  }

  const orderedSections = Object.entries(selected_Section).map(
    ([key, section]) => {
      const filteredFields = section?.fields
        .map((fieldName) => {
          let value = data[fieldName];
          if (
            fieldName === "Defendant_StillWorking" ||
            fieldName === "Plaintiff_StillWorking"
          ) {
            value =
              data[fieldName] === "Yes" || data[fieldName] === "SW1"
                ? "Yes"
                : "No";
          }
          // Only include fields that have values
          if (value !== null && value !== undefined && value !== "") {
            return [fieldName, value];
          }
          return [fieldName, "-------"];
        })
        .filter(Boolean); // Remove null entries

      return {
        title: section.title,
        fields: filteredFields,
      };
    }
  );

  return orderedSections;
};

const DataDetails: React.FC<DataDetailsProps> = ({ hearing }) => {
  const { t } = useTranslation("manageHearingDetails");
  const caseData = hearing || {};

  const [getCookie] = useCookieState();
  const userType = getCookie("userType");
  const newCaseDetailsView = filterAndOrderData(caseData, userType);

  const entries = Object.entries(caseData);
  const filterFields = (prefix: string) =>
    entries.filter(([key]) => key.toLowerCase().startsWith(prefix));

  const renderSection = (title: string, fields: [string, any][]) => {
    const filter_include_Data = fields.filter(
      (item) => !item[0].toLowerCase().includes("code") && item
    );
    const filter_format_date = filter_include_Data.filter((item) => {
      if (
        item[0].toLowerCase().includes("date") &&
        !item[0].toLowerCase().includes("/")
      ) {
        item[1] = formatDate(item[1]);
      }
      return item;
    });

    return (
      <Section
        title={title}
        className="grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 "
      >
        {filter_format_date.map(([key, value]) => (
          <ReadOnlyField
            key={key}
            label={t(key) !== key ? t(key) : formatLabel(key)}
            value={
              value !== null && value !== undefined && value !== ""
                ? formatHijriWithSlashes(value)
                : "-------"
            }
            notRequired
          />
        ))}
      </Section>
    );
  };

  const applicantType = caseData?.ApplicantType_Code?.toLowerCase();
  const representativeType = caseData?.RepresentativeType_Code?.toLowerCase();
  const isGovernmentUser = representativeType === "legal representative";

  const plaintiffFields = filterFields("plaintiff");
  const defendantFields = filterFields("defendant");
  const workFields = entries?.filter(([key]) =>
    ["contract", "salary", "stillworking"].some((prefix) =>
      key.toLowerCase().includes(prefix)
    )
  );
  const workLocationFields = entries?.filter(
    ([key]) =>
      key === "Plaintiff_JobLocation" ||
      key === "PlaintiffJobCity" ||
      key === "Defendant_JobLocation" ||
      key === "DefendantJobCity" ||
      key === "OfficeName"
  );
  const representativeFields = entries.filter(
    ([key]) =>
      key.toLowerCase().startsWith("rep") ||
      key.toLowerCase().startsWith("representative")
  );

  const additionalRepFields = (
    [
      ["RepresentativeName", caseData.RepresentativeName],
      ["RepresentativeID", caseData.RepresentativeID],
      ["Rep_PhoneNumber", caseData.Rep_PhoneNumber],
      ["Rep_EmailAddress", caseData.Rep_EmailAddress],
    ] as [string, any][]
  ).filter(([_, val]) => val !== undefined);

  const mergedRepMap = new Map<string, any>([
    ...representativeFields,
    ...additionalRepFields,
  ]);
  const mergedRepFields: [string, any][] = Array.from(mergedRepMap.entries());

  const usedKeys = new Set(
    [
      ...plaintiffFields,
      ...defendantFields,
      ...workFields,
      ...workLocationFields,
      ...mergedRepFields,
    ].map(([key]) => key)
  );

  const additionalFields = entries.filter(([key]) => !usedKeys.has(key));

  return (
    <div className="space-y-6">
      {userType?.toLowerCase() === "legal representative" ||
        userType?.toLowerCase() === "establishment" ||
        userType?.toLowerCase() === "embassy user" ||
        userType?.toLowerCase() === "worker" ? (
        newCaseDetailsView &&
        newCaseDetailsView?.map((item) =>
          item?.fields
            ? renderSection(t(`${item?.title}`), item?.fields as any[])
            : null
        )
      ) : (
        <>
          {renderSection(
            t("plaintiff_details") || "Plaintiff's Details",
            plaintiffFields
          )}
          {isGovernmentUser &&
            mergedRepFields.length > 0 &&
            renderSection(
              t("representative_details") || "Legal Representative's Details",
              mergedRepFields
            )}
          {renderSection(
            t("defendant_details") || "Defendant Details",
            defendantFields
          )}
          {renderSection(t("work_details") || "Work Details", workFields)}
          {renderSection(
            t("work_location_details") || "Work Location Details",
            workLocationFields
          )}
        </>
      )}
    </div>
  );
};

export default DataDetails;
