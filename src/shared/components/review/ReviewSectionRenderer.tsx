import React from "react";
import { Section } from "@/shared/layouts/Section";
import { ReadOnlyField } from "@/shared/components/ui/read-only-view";

export interface ReviewField {
  label: string;
  value: any;
}

export interface ReviewSection {
  title?: string;
  hideTitle?: boolean;
  fields: ReviewField[];
}

interface Props {
  sections: ReviewSection[];
}

export default function ReviewSectionRenderer({ sections }: Props) {
  return (
    <div className="space-y-6">
      {sections.map((sec, i) => (
        <Section
          key={i}
          title={sec.hideTitle ? "" : sec.title}
          className="grid grid-cols-3 gap-6"
        >
          {sec.fields.map((f, j) => (
            <ReadOnlyField
              key={j}
              label={f.label}
              value={f.value != null && f.value !== "" ? f.value : "-------"}
              notRequired
            />
          ))}
        </Section>
      ))}
    </div>
  );
}
