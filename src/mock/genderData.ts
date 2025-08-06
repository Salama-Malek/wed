  export const genderData={
    ServiceStatus: "Success",
    SuccessCode: "200",
    DataElements: [
        {
            ElementKey: "GD1",
            ElementValue: "Male"
        },
        {
            ElementKey: "GD2",
            ElementValue: "Female"
        }
    ],
    SourceSystem: "E-Services"
}

  export const nicMockData= {
    SourceSystem: "E-Services",
    NICDetails: {
        NICErrorMessage: "",
        NICServiceFailed: "false",
        Nationality_Code: "305",
        OrganizationID: "7002747132",
        Gender: "Male",
        Occupation: "Software engineer",
        Nationality: "Egyptian",
        City: "Riyadh",
        City_Code: "1", //note
        PrisonerName: "صالح",
        PrisonerId: "0",
        PlaintiffName: "ss",
        Applicant_Code: "121212",
        Gender_Code: "Male",  //note
        Region: "Riyadh",
        Region_Code: "1",
        Imprisoned: "false",
        Occupation_Code: "",
        Applicant: ""
    }
}

  export const isEstablishmentName: any = {
    EstablishmentData: [
    {
        "EstablishmentFileNumber": "34-28427",
        "ServiceEndDate": "",
        "ServiceStartDate": "20170731T210000.000 GMT",
        "EstablishmentName": "مؤسسة التأسيس السعوديه للتجاره لصاحبها فهد ناصر سعد آل تميم ",
        "StillWorking": "Y"
    },
    {
        "EstablishmentFileNumber": "1-334422",
        "ServiceEndDate": "20170802T003000.000 GMT",
        "ServiceStartDate": "20150608T124500.000 GMT",
        "EstablishmentName": "محطة لتر للخدمات البترولية",
        "StillWorking": "N"
    },
    {
        "EstablishmentFileNumber": "1-89679",
        "ServiceEndDate": "20170731T210000.000 GMT",
        "ServiceStartDate": "20170731T210000.000 GMT",
        "EstablishmentName": "مؤسسة سعود عبدالعزيز العتيبي للمقاولات  .",
        "StillWorking": "N"
    },
    {
        "EstablishmentFileNumber": "1-1637265",
        "ServiceEndDate": "20170731T210000.000 GMT",
        "ServiceStartDate": "20170731T210000.000 GMT",
        "EstablishmentName": "مؤسسة الماس  الغرب للمقاولات",
        "StillWorking": "N"
    },
    {
        "EstablishmentFileNumber": "1-65092",
        "ServiceEndDate": "20150608T124500.000 GMT",
        "ServiceStartDate": "20130208T025000.000 GMT",
        "EstablishmentName": "محطة جواهر السلام",
        "StillWorking": "N"
    }
]


  ,
    ServiceStatus: "Success",
    SuccessCode: "200",
    SourceSystem: "E-Services"
};


export const establishmentDetails={
    ErrorDetails:[],
    EstablishmentInfo: [
        {
            EconomicActivity: "مقاولات التشييد والبناء",
            ZipCode: "12251",
            Number700: "1038139240",
            UnifiedSequenceno: "119844",
            City: "RIYADH",
            EstablishmentName: "مجموعه الناهض العربيه للمقاولات",
            EstablishmentID: "1-204757",
            City_Code: "1",
            Area: "الورود",
            EstablishmentStatusID: "1",
            CRNumber: "1010193202",
            Region: "الرياض",
            Street: "طريق العروبة",
            Region_Code: "1",
            OwnerEmailAddress: "",
            FileNumber: "1-204757",
            EstablishmentType: "فردية"
        }
    ],
    ServiceStatus: "Success",
    SuccessCode: "200",
    SourceSystem: "E-Services"
}


const jsonData = {
    "Agent": {
      "ErrorDescription": "Success",
      "pyErrorMessage": "MOJINT1001",
      "MandateStatus": "معتمدة",
      "AgentDetails": [
        { "IdentityNumber": "2273245197" },
        { "IdentityNumber": "1095195804" }
      ],
      "AgentNoData": "true",
      "Error": "",
      "GregorianDate": "20250217",
      "AgentName": "يوسف مساعد عبدالله الشبانه",
      "MandateSource": "خدمات الوكالات الإلكترونية",
      "MandateDate": "18-08-1446"
    },
    "AttorneyService": "false",
    "SourceSystem": "E-Services",
    "PartyList": [
      {
        "PartySefaTypeName": "أصالة عن نفسه",
        "FullName": "صلاح محمد صدقي حسن",
        "Gender": "M",
        "ID": "2273245197",
        "IdentityTypeName": "إقامة",
        "Nationality": "مصري",
        "IsValid": "Yes"
      }
    ]
  };



  export const subCategoryValue={
    value: "CR-1",
    label: "Request compensation for the duration of the notice"
}


export const  UserTypeLegalRepDataMock={
  GovRepDetails: [
  {
  GovernmentName: "جمعيات",
  SubGOVTID: "1066",
  SubGovernmentName: "الجمعية التعاونية للطهاة",
  GOVTID: "18",
  RepMobileNumber: "6567567576",
  RepNationalid: "1414141414",
  EmailAddress: "test@test.com",
  RepName: "twqywq"
  },
  {
    GovernmentName: "name 2",
    SubGOVTID: "22",
    SubGovernmentName: "sub 2 data test ",
    GOVTID: "19",
    RepMobileNumber: "6567567576",
    RepNationalid: "1414141414",
    EmailAddress: "test@test.com 2",
    RepName: "twqywq 2"
    }
  ],
  UserTypeList: [
  {
  UserTypeLabel: "",
  UserSubType: "",
  PlaintiffTypeList: [
  {
  PlaintiffType: "Agent",
  PlaintiffTypeLabel: ""
  },
  {
  PlaintiffType: "Self (Worker)",
  PlaintiffTypeLabel: ""
  }
  ],
  ApplicantTypeList: [
  {
  ApplicantType: "Worker",
  ApplicantTypeLabel: ""
  }
  ],
  UserType: "Worker"
  },
  {
  UserTypeLabel: "",
  UserSubType: "",
  RepresentativeTypeList: [
  {
  RepTypeLabel: "",
  RepType: "Worker"
  },
  {
  RepTypeLabel: "",
  RepType: "Legal representative"
  }
  ],
  UserType: "Legal representative"
  }
  ],
  ServiceStatus: "Success",
  SuccessCode: "200",
  SourceSystem: "E-Services"
  }


  // formDefaults.ts
export const FORM_DEFAULTS = {
  workDetails: {
    nationality:{value:"test",label:"test"},
  },
  plaintiffDetails: {
    idType: "national_id",
    nationality: "SA",
    gender: "male"
  },
  hearingDetails: {
    hearingType: "regular",
    priority: "normal"
  }
};