import { Hearing } from "./columns";

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
    {
        requestNumber: "CS-101",
        hearingNumber: "111113",
        legalRepresentative: "Alice Johnson",
        defendantName: "Bob Brown",
        dateOfHearingCreation: "10/02/2025",
        hearingDate: "10/16/2025",
        sessionTiming: "PM 01:00",
        hearingStatus: "Under review",
    },
    {
        requestNumber: "CS-102",
        hearingNumber: "111114",
        legalRepresentative: "Michael White",
        defendantName: "Charlie Black",
        dateOfHearingCreation: "10/03/2025",
        hearingDate: "10/17/2025",
        sessionTiming: "AM 11:00",
        hearingStatus: "Completed",
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
  {
    requestNumber: "CS-100",
    hearingNumber: "111112",
    defendantName: "Jane Doe",
    dateOfHearingCreation: "10/01/2025",
    hearingDate: "10/15/2025",
    sessionTiming: "AM 10:00",
    hearingStatus: "Completed",
  },
  {
    requestNumber: "CS-100",
    hearingNumber: "111112",
    defendantName: "Jane Doe",
    dateOfHearingCreation: "10/01/2025",
    hearingDate: "10/15/2025",
    sessionTiming: "AM 10:00",
    hearingStatus: "Under negotiation",
  },
  {
    requestNumber: "CS-100",
    hearingNumber: "111112",
    defendantName: "Jane Doe",
    dateOfHearingCreation: "10/01/2025",
    hearingDate: "10/15/2025",
    sessionTiming: "AM 10:00",
    hearingStatus: "Under review",
  },
];
