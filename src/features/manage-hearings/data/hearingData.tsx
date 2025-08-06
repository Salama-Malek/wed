import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { truncateText } from "../utils/tables/tableUtils";


export interface Hearing {
  requestNumber: string;
  hearingNumber: string;
  legalRepresentative?: string;
  defendantName: string;
  dateOfHearingCreation: string;
  hearingDate: string;
  sessionTiming: string;
  hearingStatus: string;
}

/* =====================
   SAMPLE DATA ARRAYS
   ===================== */

// ----- INDIVIDUAL -----
export const individualClaimantHearings: Hearing[] = [
  {
    requestNumber: "CS-100",
    hearingNumber: "111111",
    legalRepresentative: "John Smith",
    defendantName: "Jane Doe",
    dateOfHearingCreation: "10/01/2025",
    hearingDate: "10/15/2025",
    sessionTiming: "AM 09:30",
    hearingStatus: "Under negotiation",
  },
];
export const individualDefendantHearings: Hearing[] = [
  {
    requestNumber: "CS-100",
    hearingNumber: "111112",
    defendantName: "Jane Doe",
    dateOfHearingCreation: "10/01/2025",
    hearingDate: "10/15/2025",
    sessionTiming: "AM 10:00",
    hearingStatus: "Rejected",
  },
];

// ----- ESTABLISHMENT -----
export const establishmentClaimantHearings: Hearing[] = [
  {
    requestNumber: "ES-200",
    hearingNumber: "222221",
    legalRepresentative: "ACME Corp Lawyer",
    defendantName: "XYZ Inc.",
    dateOfHearingCreation: "11/05/2025",
    hearingDate: "11/20/2025",
    sessionTiming: "PM 02:00",
    hearingStatus: "Under review",
  },
];
export const establishmentDefendantHearings: Hearing[] = [
  {
    requestNumber: "ES-200",
    hearingNumber: "222222",
    defendantName: "XYZ Inc.",
    dateOfHearingCreation: "11/05/2025",
    hearingDate: "11/20/2025",
    sessionTiming: "PM 03:30",
    hearingStatus: "Completed",
  },
];

// ----- GOVERNMENT -----
export const governmentClaimantHearings: Hearing[] = [
  {
    requestNumber: "GV-300",
    hearingNumber: "333331",
    legalRepresentative: "Gov. Attorney",
    defendantName: "Private Entity",
    dateOfHearingCreation: "12/10/2025",
    hearingDate: "12/25/2025",
    sessionTiming: "AM 11:00",
    hearingStatus: "Under negotiation",
  },
  {
    requestNumber: "GV-300",
    hearingNumber: "333332",
    legalRepresentative: "Gov. Attorney",
    defendantName: "Private Entity",
    dateOfHearingCreation: "12/10/2025",
    hearingDate: "12/25/2025",
    sessionTiming: "AM 11:30",
    hearingStatus: "Under review",
  },
];
export const governmentDefendantHearings: Hearing[] = [
  {
    requestNumber: "GV-300",
    hearingNumber: "333332",
    defendantName: "Private Entity",
    dateOfHearingCreation: "12/10/2025",
    hearingDate: "12/25/2025",
    sessionTiming: "AM 11:30",
    hearingStatus: "Completed",
  },
];

/* =====================
   COLUMN DEFINITIONS
   ===================== */

const columnHelper = createColumnHelper<Hearing>();

export const claimantColumns: ColumnDef<Hearing, any>[] = [
  columnHelper.accessor("requestNumber", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Request Number
      </span>
    ),
    cell: (info) => (
      <span className="text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),

  columnHelper.accessor("hearingNumber", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Hearing Number
      </span>
    ),
    cell: (info) => (
      <span className="text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),

  columnHelper.accessor("legalRepresentative", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Legal Representative’s Name
      </span>
    ),
    cell: (info) => (
      <span className="text-md normal text-gray-700">
        {truncateText(info.getValue() || "", 12)}
      </span>
    ),
  }),

  columnHelper.accessor("defendantName", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Defendant’s Name
      </span>
    ),
    cell: (info) => (
      <span className="text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),

  columnHelper.accessor("dateOfHearingCreation", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Date of Hearing Creation
      </span>
    ),
    cell: (info) => (
      <span className="text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),

  columnHelper.accessor("hearingDate", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Hearing Date
      </span>
    ),
    cell: (info) => (
      <span className="text-md normal text-gray-700">
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.accessor("sessionTiming", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Session Timing
      </span>
    ),
    cell: (info) => (
      <div className="text-center text-md normal text-gray-700">
        {info.getValue()}
      </div>
    ),
  }),

  columnHelper.accessor("hearingStatus", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Hearing Status
      </span>
    ),
    cell: (info) => {
      const status = info.getValue();
      let textColor = "";
      let bgColor = "";

      switch (status) {
        case "Under negotiation":
          textColor = "text-warning-800"; 
          bgColor = "bg-[#FFFAEB]";       
          break;
        case "Under review":
          textColor = "text-info-800";    
          bgColor = "bg-[#EFF8FF]";       
          break;
        case "Rejected":
          textColor = "text-error-800";   
          bgColor = "bg-[#FEF3F2]";      
          break;
        case "Completed":
          textColor = "text-success-800";
          bgColor = "bg-[#ECFDF3]";      
          break;
        default:
          textColor = "text-default-color";
          bgColor = "bg-white";
      }

      return (
        <span
          className={`
            inline-flex items-center 
            rounded-full 
            text-[14px] medium
            leading-[20px] 
            whitespace-nowrap 
            px-md py-[7px]
            ${textColor} 
            ${bgColor}
          `}
        >
          <span className="inline-block w-[10px] h-[10px] rounded-full bg-current mr-md" />
          {status}
        </span>
      );
    },
  }),

  {
    id: "actions",
    header: () => (
      <span className="text-xs medium text-gray-700">
        Actions
      </span>
    ),
    cell: ({ row }) => (
      //@ts-ignore
      <ActionsCell
        hearingStatus={row.original.hearingStatus}
        activeTab="claimant"
      />
    ),
  },
];

export const defendantColumns: ColumnDef<Hearing, any>[] = [
  columnHelper.accessor("requestNumber", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Request Number
      </span>
    ),
    cell: (info) => (
      <span className="text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),

  columnHelper.accessor("hearingNumber", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Hearing Number
      </span>
    ),
    cell: (info) => (
      <span className="text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),

  columnHelper.accessor("defendantName", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Defendant’s Name
      </span>
    ),
    cell: (info) => (
      <span className="text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),

  columnHelper.accessor("dateOfHearingCreation", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Date of Hearing Creation
      </span>
    ),
    cell: (info) => (
      <span className="text-md normal text-gray-700">
        {truncateText(info.getValue(), 12)}
      </span>
    ),
  }),

  columnHelper.accessor("hearingDate", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Hearing Date
      </span>
    ),
    cell: (info) => (
      <span className="text-md normal text-gray-700">
        {info.getValue()}
      </span>
    ),
  }),

  columnHelper.accessor("sessionTiming", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Session Timing
      </span>
    ),
    cell: (info) => (
      <div className="text-center text-md normal text-gray-700">
        {info.getValue()}
      </div>
    ),
  }),

  columnHelper.accessor("hearingStatus", {
    header: () => (
      <span className="text-xs medium text-gray-700">
        Hearing Status
      </span>
    ),
    cell: (info) => {
      const status = info.getValue();
      let textColor = "";
      let bgColor = "";

      switch (status) {
        case "Under negotiation":
          textColor = "text-warning-800";
          bgColor = "bg-[#FFFAEB]";
          break;
        case "Under review":
          textColor = "text-info-800";
          bgColor = "bg-[#EFF8FF]";
          break;
        case "Rejected":
          textColor = "text-error-800";
          bgColor = "bg-[#FEF3F2]";
          break;
        case "Completed":
          textColor = "text-success-800";
          bgColor = "bg-[#ECFDF3]";
          break;
        default:
          textColor = "text-default-color";
          bgColor = "bg-white";
      }

      return (
        <span
          className={`
            inline-flex items-center 
            rounded-full 
            text-sm20 medium 
            whitespace-nowrap 
            px-md py-[7px]
            ${textColor} 
            ${bgColor}
          `}
        >
          <span className="inline-block w-[10px] h-[10px] rounded-full bg-current mr-md" />
          {status}
        </span>
      );
    },
  }),

  {
    id: "actions",
    header: () => (
      <span className="text-xs medium text-gray-700">
        Actions
      </span>
    ),
    cell: ({ row }) => (
      //@ts-ignore
      <ActionsCell
        hearingStatus={row.original.hearingStatus}
        activeTab="defendant"
      />
    ),
  },
];

/* =====================
   HELPER FUNCTION
   ===================== */
export function getHearingDataAndColumns(caseType: string, role: string) {
  let data: Hearing[] = [];
  let columns = claimantColumns;

  if (caseType === "individual" && role === "claimant") {
    data = individualClaimantHearings;
    columns = claimantColumns;
  } else if (caseType === "individual" && role === "defendant") {
    data = individualDefendantHearings;
    columns = defendantColumns;
  } else if (caseType === "establishment" && role === "claimant") {
    data = establishmentClaimantHearings;
    columns = claimantColumns;
  } else if (caseType === "establishment" && role === "defendant") {
    data = establishmentDefendantHearings;
    columns = defendantColumns;
  } else if (caseType === "government" && role === "claimant") {
    data = governmentClaimantHearings;
    columns = claimantColumns;
  } else if (caseType === "government" && role === "defendant") {
    data = governmentDefendantHearings;
    columns = defendantColumns;
  }

  return { data, columns };
}
