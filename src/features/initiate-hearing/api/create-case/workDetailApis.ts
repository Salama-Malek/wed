// src/features/initiate-hearing/api/create-case/workDetailApis.ts
import { api } from "@/config/api";

export const workDetailApi = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    // 1. Salary Type Lookup
    getSalaryTypeLookup: builder.query<any, { AcceptedLanguage: string }>({
      query: ({ AcceptedLanguage }) => ({
        url: `/WeddiServices/V1/MainLookUp`,
        params: {
          LookupType: "DataElements",
          ModuleKey: "MST1",
          ModuleName: "SalaryType",
          AcceptedLanguage,
          SourceSystem: "E-Services",
        },
      }),
    }),

    // 2. Contract Type Lookup (with userType / legalRepType / defendantStatus logic)
    getContractTypeLookup: builder.query<
      any,
      {
        userType: string;
        legalRepType: string;
        defendantStatus: string;
        AcceptedLanguage: string;
      }
    >({
      query: ({
        userType,
        legalRepType,
        defendantStatus,
        AcceptedLanguage,
      }) => ({
        url: `/WeddiServices/V1/MainLookUp`,
        params: {
          LookupType: "DataElements",
          ModuleKey:
            userType === "Legal representative" ||
              legalRepType === "Legal representative" ||
              (userType === "Worker" && defendantStatus === "Government") ||
              (userType === "Embassy User" && defendantStatus === "Government")
              ? "MCOTP2"
              : "MCOTP1",
          ModuleName: "ContractType",
          AcceptedLanguage,
          SourceSystem: "E-Services",
        },
      }),
    }),

    // 3. Extract Establishment Data
    getExtractEstablishmentData: builder.query<
      any,
      { AcceptedLanguage: string, WorkerID: string, FileNumber: string, CaseID?: string }
    >({
      query: ({ AcceptedLanguage, WorkerID, FileNumber, CaseID }) => ({
        url: `/WeddiServices/V1/ExtractEstabData`,
        params: {
          WorkerID: WorkerID,
          AcceptedLanguage,
          SourceSystem: "E-Services",
          FileNumber: FileNumber,
          ...(CaseID && { CaseID })
        },
      }),
    }),

    // 4. Region Lookup (worker / establishment / default)
    getRegionLookupData: builder.query<
      any,
      {
        AcceptedLanguage: string;
        context: "worker" | "establishment" | "default";
      }
    >({
      query: ({ AcceptedLanguage, context }) => {
        const key =
          context === "worker"
            ? "WorkerRegion"
            : context === "establishment"
              ? "EstablishmentRegion"
              : "RegionName";
        return {
          url: `/WeddiServices/V1/MainLookUp`,
          params: {
            LookupType: "CaseElements",
            ModuleKey: key,
            ModuleName: key,
            AcceptedLanguage,
            SourceSystem: "E-Services",
          },
        };
      },
    }),

    // 5. City Lookup (sub-lookup by region)
    getCityLookupData: builder.query<
      any,
      { AcceptedLanguage: string; mainRegionSelected: { value: string } }
    >({
      query: ({ AcceptedLanguage, mainRegionSelected }) => ({
        url: `/WeddiServices/V1/SubLookup`,
        params: {
          LookupType: "CaseElements",
          ModuleKey: mainRegionSelected.value,
          ModuleName: "City",
          AcceptedLanguage,
          SourceSystem: "E-Services",
        },
      }),
    }),
  }),
});

export const {
  useGetSalaryTypeLookupQuery,
  useGetContractTypeLookupQuery,
  useLazyGetContractTypeLookupQuery,
  useGetExtractEstablishmentDataQuery,
  useLazyGetExtractEstablishmentDataQuery,
  useGetRegionLookupDataQuery,
  useGetCityLookupDataQuery,
} = workDetailApi;
