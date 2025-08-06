import { RadioOption } from "@/shared/components/form/RadioGroup";

type ReadOnlyDetail = { label: string; value: string };
type FileDetail = { fileName: string };
type SectionData = 
  | { type: "radio"; name: string; label: string; options: RadioOption[]; value: string; onChange: (value: string) => void }
  | { type: "readonly"; fields: ReadOnlyDetail[] }
  | { type: "file"; files: FileDetail[] };

export const reviewSections: { title: string; data: SectionData }[] = [
  {
    title: "Claimant’s Details",
    data: {
      type: "radio",
      name: "claimantStatus",
      label: "Applicant:",
      options: [
        { label: "Worker", value: "worker" },
        { label: "Employer", value: "employer" },
      ],
      value: "",
      onChange: () => {},
    },
  },
  {
    title: "Defendant’s Details",
    data: {
      type: "readonly",
      fields: [
        { label: "ID Number", value: "0000111122" },
        { label: "Name", value: "Abdulaziz Mohammed" },
        { label: "Phone Number", value: "0564650564" },
      ],
    },
  },
  {
    title: "Work Details",
    data: {
      type: "readonly",
      fields: [
        { label: "Current Salary", value: "1432 SAR" },
        { label: "Contract Type", value: "Full-Time" },
        { label: "Contract Expiry Date (Gregorian)", value: "02/02/2026" },
      ],
    },
  },
  {
    title: "Attached Files",
    data: {
      type: "file",
      files: [
        { fileName: "Employment Contract.PNG" },
        { fileName: "Visa Document.PNG" },
      ],
    },
  },
];