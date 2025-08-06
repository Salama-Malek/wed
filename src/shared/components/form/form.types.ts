export interface Option {
  value: string;
  label: string;
}

export interface FileAttachment {
  classification?: string;
  classificationLabel?: string; // shown to user
  classificationCode?: string; // passed to backend
  file: File | null;
  base64: string | null;
  fileName: string;
  fileType: string;
  attachmentKey?: string; // NEW
}

export interface AddAttachmentRenderProps {
  selectedFile: FileAttachment | null;
  openModal: () => void;
  removeFile: () => void;
}

export interface AddAttachmentProps {
  children: (props: AddAttachmentRenderProps) => React.ReactNode;
  onFileSelect: (fileData: FileAttachment) => void;
}
export type RadioOption = {
  label: string;
  value: string;
  description?: string;
};
export interface ValidationRules {
  required?: string | boolean;
  minLength?: {
    value: number;
    message: string;
  };
  maxLength?: {
    value: number;
    message: string;
  };
  pattern?: {
    value: RegExp;
    message: string;
  };
  validate?: (value: string) => boolean | string;
}
export type FormElement =
  | {
    type: "radio";
    name: string;
    hasIcon?: boolean;
    label: string;
    options: RadioOption[];
    value: string;
    validation?: ValidationRules;
    onChange: (value: string) => void;
    notRequired?: boolean;
    colSpan?: number;
    disabled?: boolean;
    condition?: boolean;
  }
  | {
    type: "input";
    name: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    inputType: string;
    onBlur?: () => void;
    placeholder?: string;
    validation?: ValidationRules;
    min?: number;
    notRequired?: boolean;
    colSpan?: number;
    maxLength?: number;
    isLoading?: boolean;
    disabled?: boolean;
    condition?: boolean;
    numberOnly?: boolean;
  }
  | {
    type: "autocomplete";
    label: string;
    options: Option[];
    value: any;
    name: string;
    onChange: (value: any) => void;
    validation?: ValidationRules;
    notRequired?: boolean;
    colSpan?: number;
    isLoading?: boolean;
    disabled?: boolean;
    condition?: boolean;
    onClear?: () => void;
    autoSelectValue?: string | { value: string; label: string };

  }
  | {
    type: "checkbox";
    label: string;
    name: string;
    checked: boolean;
    validation?: ValidationRules;
    onChange: (value: boolean) => void;
    notRequired?: boolean;
    colSpan?: number;
    disabled?: boolean;
    className?: string;
    rules?: any;
    condition?: boolean;
  }
  | {
    type: "dateOfBirth";
    hijriLabel: string;
    gregorianLabel: string;
    notRequired?: boolean;
    colSpan?: number;
    hijriFieldName?: string;
    gregorianFieldName?: string;
    name?: string;
    value?: any;
    showDateGregorian?: any;
    validation?: any;
    rules?: any;
    condition?: boolean;
  }
  | {
    type: "readonly";
    label: string;
    value: string;
    notRequired?: boolean;
    colSpan?: number;
    isLoading?: boolean;
    condition?: boolean;
  }
  | {
    type: "custom";
    component: JSX.Element;
    colSpan?: number;
    condition?: boolean;
    name?: string;
  }
  | {
    type: "button";
    label: string;
    onClick: () => void;
    name?: string;
    size?: "xs" | "xs20" | "sm" | "md" | "sl" | "lg";
    className?: string;
    colSpan?: number;
    disabled?: boolean;
    condition?: boolean;
  };

export type SectionLayout = {
  className: string | undefined;
  title?: string;
  isRadio?: boolean;
  condition?: boolean;
  gridCols: number;
  children: FormElement[];
  notrequired?: boolean;
  data?: { type: "readonly"; fields: Array<{ label: string; value: string }> };
  removeMargin?: boolean;
  requiredText?: string;
  isHidden?: boolean;
};

export interface FormData {
  isDomestic?: string;
  EstablishmentData?: any;
  extractEstablishmentObject?: any;
  GetCookieEstablishmentData?: any;
  caseTopics?: any;
  getNicDetailObject?: any;
  attorneyData?: any;
  agencyNumber?: number | string | null;
  applicantType?: string;
  agencyRegionValue?: string;
  agencyCityValue?: string;
  agencyProfession?: string;
  agencyNationality?: string;
  agencyGender?: string;
  agentType?: string;
  agentName?: string;
  agencyStatus?: string;
  agencySource?: string;
  otp?: string;
  plaintiffStatus?: string;
  plaintiffCapacity?: string;
  addInternationalNumber?: string;
  profession?: string;
  certifiedRadio?: string;
  idNumber: string;
  userName: string;
  region: Option | null;
  city: Option | null;
  plaintiffRegion?: Option | null;
  plaintiffCity?: Option | null;
  defendantRegion?: Option | null;
  defendantCity?: Option | null;
  occupation: Option | null;
  gender: Option | null;
  hijriDate: string;
  gregorianDate: string;
  phoneNumber: string;
  // add new phonenumber for the establishment as defendent 
  establishment_phoneNumber: string;
  agentPhoneNumber?: string;
  interPhoneNumber?: null | string;
  claimantStatus: string;
  defendantStatus?: string;
  main_category_of_the_government_entity?: string;
  subcategory_of_the_government_entity?: string;
  DefendantFileNumber?: string;
  DefendantCRNumber?: string;
  DefendantNumber700?: string;
  DefendantEstablishmentName?: string;
  nationalIdNumber?: string;
  defendantHijriDOB?: string;
  defendantDetails?: string;
  defendantGregorianDOB?: string;
  applicant: string;
  isPhone: boolean;
  phoneCode: string;
  attachment?: FileAttachment;
  typeOfWage: Option | null;
  contractType: Option | null;
  // add new region and city for workdetails
  jobLocation?: Option | null;
  jobLocationCity?: Option | null;
  laborOffice?: Option | null;

  nationality: Option | null;
  workerAgentIdNumber?: string;
  workerAgentDateOfBirthHijri?: string;
  isVerified?: boolean;
  plaintiffHijriDOB?: string;
  countryCode?: string;
  mobileNumber?: string;
  worker_region?: { value: string };
  worker_city?: { value: string };
  Agent_ResidencyAddress?: string;
  Agent_CurrentPlaceOfWork?: string;
  // hassan add this
  Defendant_Establishment_data?: EstablishmentDetails;
  Defendant_Establishment_data_NON_SELECTED?: EstablishmentDetails;
  contractDateHijri?: string;
  contractExpiryDateHijri?: string;
  dateofFirstworkingdayHijri?: string;
  acknowledge?: boolean;
  dateoflastworkingdayHijri?: string;
  // hassan add this for embacy user
  Agent_EmbassyName: string,
  Agent_EmbassyNationality: string,
  Agent_EmbassyPhone: string,
  Agent_EmbassyFirstLanguage: string,
  Agent_EmbassyEmailAddress: string,


  DefendantsPrisonerName?: string;
  DefendantsRegion?: string;
  DefendantsCity?: string;
  DefendantsOccupation?: string;
  DefendantsGender?: string;
  DefendantsNationality?: string;
  DefendantsPrisonerId?: string;

  // Work Details Fields
  salary?: string | number;
  contractNumber?: string;
  contractDateGregorian?: string;
  contractExpiryDateGregorian?: string;
  isStillEmployed?: boolean;
  dateOfFirstWorkingDayGregorian?: string;
  dateOfLastWorkingDayGregorian?: string;
  dateOfFirstWorkingDayHijri?: string;
  dateOfLastWorkingDayHijri?: string;
  managerial_decision_date_hijri?: string;
  managerial_decision_date_gregorian?: string;
  managerialDecisionNumber?: string;

  // Case Topics Date Fields
  from_date_hijri?: string;
  from_date_gregorian?: string;
  to_date_hijri?: string;
  to_date_gregorian?: string;
  date_hijri?: string;
  date_gregorian?: string;
  injury_date_hijri?: string;
  injury_date_gregorian?: string;
  request_date_hijri?: string;
  request_date_gregorian?: string;
  externalAgencyNumber?: string;
  certifiedAgency?: string;
  // Principal-prefixed fields for principal claimant
  principal_userName?: string;
  principal_region?: Option | null;
  principal_city?: Option | null;
  principal_occupation?: Option | null;
  principal_gender?: Option | null;
  principal_nationality?: Option | null;
  principal_hijriDate?: string;
  principal_gregorianDate?: string;
  principal_applicant?: string;
  principal_phoneNumber?: string;
  // Local agency-prefixed fields for local agency representative
  localAgent_userName?: string;
  localAgent_region?: Option | null;
  localAgent_city?: Option | null;
  localAgent_occupation?: Option | null;
  localAgent_gender?: Option | null;
  localAgent_nationality?: Option | null;
  localAgent_gregorianDate?: string;
  localAgent_phoneNumber?: string;
  // External agency-prefixed fields for external agency representative
  externalAgent_userName?: string;
  externalAgent_region?: Option | null;
  externalAgent_city?: Option | null;
  externalAgent_occupation?: Option | null;
  externalAgent_gender?: Option | null;
  externalAgent_nationality?: Option | null;
  externalAgent_gregorianDate?: string;
  externalAgent_phoneNumber?: string;
  externalAgent_agentPhoneNumber?: string;
  // Local agency agent and plaintiff fields
  localAgent_agentName?: string;
  localAgent_agencyNumber?: string;
  localAgent_agencyStatus?: string;
  localAgent_agencySource?: string;
  localAgent_currentPlaceOfWork?: string;
  localAgent_residencyAddress?: string;
  localAgent_workerAgentIdNumber?: string;
  localAgent_workerAgentDateOfBirthHijri?: string;
  // External agency agent and plaintiff fields
  externalAgent_agentName?: string;
  externalAgent_agencyNumber?: string;
  externalAgent_agencyStatus?: string;
  externalAgent_agencySource?: string;
  externalAgent_currentPlaceOfWork?: string;
  externalAgent_residencyAddress?: string;
  externalAgent_workerAgentIdNumber?: string;
  externalAgent_workerAgentDateOfBirthHijri?: string;
}

export type UseFormLayoutParams = {
  t: (key: string) => string;
  MainTopicID: any;
  SubTopicID: any;
  FromLocation: any;
  ToLocation: any;
  AcknowledgementTerms: boolean;
  showLegalSection: boolean;
  showTopicData: boolean;
  setValue: (field: string, value: any) => void;
  handleAdd: () => void;
  handleAcknowledgeChange: (val: boolean) => void;
  handleAddTopic: () => void;
  handleSend: () => void;
  regulatoryText: string;
  decisionNumber: string;
  isEditing: boolean;
  mainCategoryData: any;
  subCategoryData: any;
  watch: any;
  forAllowanceData: any;
  typeOfRequestLookupData: any;
  commissionTypeLookupData: any;
  accordingToAgreementLookupData: any;
  matchedSubCategory: any;
  subTopicsLoading: boolean;
  amountPaidData: any;
  leaveTypeData: any;
  travelingWayData: any;
  editTopic: any;
  caseTopics: any;
  typesOfPenaltiesData?: any;
  setShowLegalSection: (value: boolean) => void;
  setShowTopicData: (value: boolean) => void;
  isValid?: boolean;
  isMainCategoryLoading?: boolean;
  isSubCategoryLoading?: boolean;
  control: any;
  trigger?: (fields: string[]) => void;
  lockAccommodationSource?: boolean;
  errors?: any;
  payIncreaseTypeData?: any;
  PayIncreaseTypeOptions?: Option[];
};

interface EstablishmentDetails {
  EconomicActivity?: string;
  ZipCode?: string;
  Number700?: string;
  UnifiedSequenceno?: string;
  EstablishmentName?: string;
  EstablishmentID?: string;
  Area?: string;
  EstablishmentStatusID?: string;
  CRNumber?: string;
  Street?: string;
  ContactNumber?: string;
  OwnerEmailAddress?: string;
  FileNumber?: string;
  EstablishmentType?: string;
  region: Option | null;
  city: Option | null;
}
