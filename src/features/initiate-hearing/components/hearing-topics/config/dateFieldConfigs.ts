import { FormElement } from "@/shared/components/form/form.types";
import { formatHijriDate } from "@/shared/lib/helpers";
import { useTranslation } from "react-i18next";

export const dateFieldConfigs = (
  t: (key: string) => string,
  isEditing: boolean,
  from_date_hijri?: string,
  to_date_hijri?: string,
  topicData?: any
) => {
  return {
    fromDate: {
      name: "from_date",
      type: "dateOfBirth" as const,
      hijriLabel: t("fromDateHijri"),
      gregorianLabel: t("fromDateGregorian"),
      value: isEditing && (from_date_hijri || topicData?.FromDateHijri || topicData?.pyTempDate) 
        ? formatHijriDate(from_date_hijri || topicData?.FromDateHijri || topicData?.pyTempDate) 
        : undefined,
      hijriFieldName: "from_date_hijri",
      gregorianFieldName: "from_date_gregorian",
    },
    toDate: {
      name: "to_date",
      type: "dateOfBirth" as const,
      hijriLabel: t("toDateHijri"),
      gregorianLabel: t("toDateGregorian"),
      value: isEditing && (to_date_hijri || topicData?.ToDateHijri || topicData?.Date_New) 
        ? formatHijriDate(to_date_hijri || topicData?.ToDateHijri || topicData?.Date_New) 
        : undefined,
      hijriFieldName: "to_date_hijri",
      gregorianFieldName: "to_date_gregorian",
    },
  };
};

export const singleDateFieldConfig = (
  t: (key: string) => string,
  isEditing: boolean,
  date_hijri?: string,
  hijriLabel: string = "dateHijri",
  gregorianLabel: string = "gregorianDate",
  topicData?: any
) => {
  return {
    name: "date",
    type: "dateOfBirth" as const,
    hijriLabel: t(hijriLabel),
    gregorianLabel: t(gregorianLabel),
    value: isEditing && (date_hijri || topicData?.Date_New || topicData?.pyTempDate) 
      ? formatHijriDate(date_hijri || topicData?.Date_New || topicData?.pyTempDate) 
      : undefined,
    hijriFieldName: "date_hijri",
    gregorianFieldName: "date_gregorian",
  };
};

export const injuryDateFieldConfig = (
  t: (key: string) => string,
  isEditing: boolean,
  injury_date_hijri?: string,
  topicData?: any
) => {
  return {
    name: "injury_date",
    type: "dateOfBirth" as const,
    hijriLabel: t("injuryDateHijri"),
    gregorianLabel: t("injuryDateGregorian"),
    value: isEditing && (injury_date_hijri || topicData?.pyTempText || topicData?.InjuryDate_New) 
      ? formatHijriDate(injury_date_hijri || topicData?.pyTempText || topicData?.InjuryDate_New) 
      : undefined,
    hijriFieldName: "injury_date_hijri",
    gregorianFieldName: "injury_date_gregorian",
  };
};

export const managerialDecisionDateFieldConfig = (
  t: (key: string) => string,
  isEditing: boolean,
  managerial_decision_date_hijri?: string,
  topicData?: any
) => {
  return {
    name: "managerial_decision_date",
    type: "dateOfBirth" as const,
    hijriLabel: t("managerialDecisionDateHijri"),
    gregorianLabel: t("managerialDecisionDateGregorian"),
    value: isEditing && (managerial_decision_date_hijri || topicData?.Date_New || topicData?.ManDecsDate) 
      ? formatHijriDate(managerial_decision_date_hijri || topicData?.Date_New || topicData?.ManDecsDate) 
      : undefined,
    hijriFieldName: "managerial_decision_date_hijri",
    gregorianFieldName: "managerial_decision_date_gregorian",
  };
};

export const requestDateFieldConfig = (
  t: (key: string) => string,
  isEditing: boolean,
  request_date_hijri?: string,
  topicData?: any
) => {
  return {
    name: "request_date",
    type: "dateOfBirth" as const,
    hijriLabel: t("requestDateHijri"),
    gregorianLabel: t("requestDateGregorian"),
    value: isEditing && (request_date_hijri || topicData?.Date_New || topicData?.RequestDate_New) 
      ? formatHijriDate(request_date_hijri || topicData?.Date_New || topicData?.RequestDate_New) 
      : undefined,
    hijriFieldName: "request_date_hijri",
    gregorianFieldName: "request_date_gregorian",
  };
}; 