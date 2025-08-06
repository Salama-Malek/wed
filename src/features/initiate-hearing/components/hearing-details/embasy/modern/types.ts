// Types for Embassy Agent Form Logic

export interface EmbassyUserInfo {
  EmbassyUserId: string;
  EmbassyFirstLanguage: string;
  EmbassyID: string;
  EmbassyName: string;
  EmbassyNationality: string;
  EmabassyEmail: string;
  EmbassyPhone: string;
  Nationality_Code: string;
}

export interface NICDetails {
  PlaintiffName?: string;
  Region?: string;
  City?: string;
  DateOfBirthHijri?: string;
  DateOfBirthGregorian?: string;
  Occupation?: string;
  Gender?: string;
  Nationality?: string;
  Applicant_Code?: string;
  Applicant?: string;
  PhoneNumber?: string;
  Occupation_Code?: string;
  City_Code?: string;
  Gender_Code?: string;
  Region_Code?: string;
  Nationality_Code?: string;
}

export interface EmbassyAgentFormProps {
  control: any;
  watch: any;
  setValue: any;
  RegionOptions: any;
  CityOptions: any;
  OccupationOptions: any;
  GenderOptions: any;
  NationalityOptions: any;
  setError: (name: string, error: any) => void;
  clearErrors: (name: string) => void;
} 