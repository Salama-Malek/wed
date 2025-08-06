// src/lib/caseReviewMapping.ts

export interface FieldDef {
    key: string;      // the exact API field name
    labelKey: string; // your i18n key in reviewdetails.json
  }
  
  export interface SectionDef {
    titleKey: string;  // i18n key for the section heading
    fields: FieldDef[];
  }
  
  export const caseReviewMapping: SectionDef[] = [
    // 1) Agent’s Information
    {
      titleKey: "agentsInformation",
      fields: [
        { key: "CertifiedBy",           labelKey: "certifiedBy"           },
        { key: "CertifiedBy_Code",      labelKey: "certifiedBy"           },
        { key: "Agent_AgentID",         labelKey: "agentIdNumber"        },
        { key: "Agent_Name",            labelKey: "agentName"            },
        { key: "Agent_POANumber",       labelKey: "poaNumber"            },
        { key: "Agent_MandateStatus",   labelKey: "poaStatus"            },
        { key: "Agent_MandateSource",   labelKey: "mandateSource"        },
        { key: "Agent_MandateNumber",   labelKey: "mandateNumber"        },
        { key: "Agent_EntityName",      labelKey: "entityName"           },
        { key: "Agent_CurrentPlaceOfWork", labelKey: "workplace"         },
        { key: "Agent_ResidencyAddress",   labelKey: "residenceAddress"  },
        { key: "Agent_Status",          labelKey: "agencyStatus"         },
        { key: "EmbassyName",           labelKey: "embassyUser.name"          },
        { key: "EmbassyEmailAddress",   labelKey: "embassyUser.emailAddress" },
        { key: "EmbassyNationality",    labelKey: "embassyUser.nationality"  },
        { key: "EmbassyPhone",          labelKey: "embassyUser.phoneNumber"  },
        { key: "EmbassyFirstLanguage",  labelKey: "embassyUser.firstLanguage" },
        { key: "Agent_PhoneNumber",     labelKey: "agentPhoneNumber"     },
        { key: "Agent_EmailAddress",    labelKey: "agentEmail"           },
        { key: "Plaintiff_FirstLanguage",    labelKey: "plaintiffNativeLanguage" },
      ],
    },
  
    // 2) Plaintiff’s Details
    {
      titleKey: "plaintiffDetails",
      fields: [
        { key: "Plaintiff_FirstLanguage",         labelKey: "plaintiffNativeLanguage" },
        { key: "PlaintiffName",                   labelKey: "name"                   },
        { key: "PlaintiffId",                     labelKey: "idNumber"               },
        { key: "Plaintiff_Region",                labelKey: "region"                 },
        { key: "Plaintiff_City",                  labelKey: "city"                   },
        { key: "Plaintiff_HijiriDOB",             labelKey: "hijriDateOfBirth" },
        { key: "PlaintiffHijiriDOB",              labelKey: "hijriDateOfBirth"       },
        { key: "Plaintiff_ApplicantBirthDate",    labelKey: "gregorianDateOfBirth"   },
        { key: "Plaintiff_DOB_Hijri",             labelKey: "hijriDateOfBirth"       },
        { key: "Plaintiff_DOB_Gregorian",         labelKey: "gregorianDateOfBirth"   },
        { key: "Plaintiff_JobStartDate",          labelKey: "firstWorkingDay"        },
        { key: "Plaintiff_JobEndDate",            labelKey: "lastWorkingDay"         },
        { key: "Plaintiff_StillWorking",          labelKey: "stillEmployed"          },
        { key: "Plaintiff_StillWorking_Code",     labelKey: "stillEmployed"          },
        { key: "Plaintiff_SalaryType",            labelKey: "salaryType"             },
        { key: "Plaintiff_Salary",                labelKey: "currentSalary"          },
        { key: "Plaintiff_ContractType",          labelKey: "contractType"           },
        { key: "Plaintiff_ContractType_Code",     labelKey: "contractType"           },
        { key: "Plaintiff_ContractNumber",        labelKey: "contractNumber"         },
        { key: "Plaintiff_ContractStartDate",     labelKey: "contractStartDate"      },
        { key: "Plaintiff_ContractEndDate",       labelKey: "contractExpiryDate"     },
        { key: "Plaintiff_Occupation",            labelKey: "occupation"             },
        { key: "Plaintiff_Nationality",           labelKey: "nationality"            },
        { key: "Plaintiff_Gender",                labelKey: "gender"                 },
        { key: "Plaintiff_Gender_Code",           labelKey: "gender"                 },
        { key: "Plaintiff_PhoneNumber",           labelKey: "phoneNumber"            },
        { key: "Plaintiff_MobileNumber",          labelKey: "phoneNumber"            },
        { key: "Plaintiff_EmailAddress",          labelKey: "email"                  },
      ],
    },
  
    // 3) Defendant’s Details
    {
      titleKey: "defendantDetails",
      fields: [
        { key: "RepresentativeType",             labelKey: "workerType"             },
        { key: "PlaintiffType",                  labelKey: "defendantType"          },
        { key: "PlaintiffType_Code",             labelKey: "defendantType"          },
        { key: "DefendantType",                  labelKey: "defendantType"          },
        { key: "DefendantType_Code",             labelKey: "defendantType"          },
        { key: "EstablishmentFullName",          labelKey: "establishmentName"      },
        { key: "DefendantEstFileNumber",         labelKey: "fileNumber"             },
        { key: "Defendant_CRNumber",             labelKey: "commercialRegistrationNumber" },
        { key: "Defendant_ContractNumber",       labelKey: "defendantContractNumber" },
        { key: "Rep_PhoneNumber",                labelKey: "phoneNumber"            },
        { key: "Defendant_Region",               labelKey: "region"                 },
        { key: "Defendant_Region_Code",          labelKey: "region"                 },
        { key: "Defendant_City",                 labelKey: "city"                   },
        { key: "Defendant_City_Code",            labelKey: "city"                   },
      ],
    },
  
    // 4) Work Details
    {
      titleKey: "workDetails",
      fields: [
        { key: "SettlementID",                   labelKey: "settlementId"           },
        { key: "StatusWork",                     labelKey: "statusWork"             },
        { key: "StatusWork_Code",                labelKey: "statusWork"             },
        { key: "CertifiedBy",                    labelKey: "certifiedBy"            },
        { key: "CertifiedBy_Code",               labelKey: "certifiedBy"            },
        { key: "DownloadPDF",                    labelKey: "downloadPDF"            },
        { key: "DownloadClaimForm",              labelKey: "downloadClaimForm"      },
        { key: "DomesticWorker",                 labelKey: "domesticWorker"         },
        { key: "ApplicantType",                  labelKey: "applicantType"          },
        { key: "ApplicantType_Code",             labelKey: "applicantType"          },
        { key: "OtherAttachments",               labelKey: "otherAttachments"       },
        { key: "RegionalAttachments",            labelKey: "regionalAttachments"    },
        { key: "CaseTopicAttachments",           labelKey: "caseTopicAttachments"   },
        { key: "RegionalAttachments",            labelKey: "regionalAttachments"    },
        { key: "pxCreateDateTime",               labelKey: "createdAt"              },
      ],
    },
  
    // 5) Work Location Details
    {
      titleKey: "workLocationDetails",
      fields: [
        { key: "Plaintiff_JobLocation",          labelKey: "region"                 },
        { key: "Plaintiff_JobLocation_Code",     labelKey: "region"                 },
        { key: "PlaintiffJobCity",               labelKey: "city"                   },
        { key: "PlaintiffJobCity_Code",          labelKey: "city"                   },
        { key: "OfficeName",                     labelKey: "nearestLaborOffice"     },
        { key: "OfficeName_Code",                labelKey: "nearestLaborOffice"     },
      ],
    },
  ];
  