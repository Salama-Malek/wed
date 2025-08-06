import React, { Suspense } from "react";
import arrowDownIcon from "@/assets/arrow-down.svg";
import { QueryActionCreatorResult } from "@reduxjs/toolkit/query";

export type SectionId = "data" | "topics" | "review";

interface HearingAccordionProps {
  sections: { id: SectionId; title: string }[];
  expanded: SectionId | null;
  toggleAccordion: (id: SectionId) => void;
  loadedComponents: Record<
    SectionId,
    React.LazyExoticComponent<React.ComponentType<any>>
  >;
  hearing: any;
  isEditing?: boolean;
  refetch: () => Promise<any> | void | QueryActionCreatorResult<any>;
}

const HearingAccordion: React.FC<HearingAccordionProps> = ({
  sections,
  expanded,
  toggleAccordion,
  loadedComponents,
  hearing,
  isEditing = false,
  refetch
}) => {
  return (
    <div className="rounded-lg px-4 text-md ">
      {sections.map(({ id, title }) => {
        const isOpen = expanded === id;
        const Component = loadedComponents[id];

        return (
          <div key={id} className="border-t border-gray-200">
            {/* Accordion Header */}
            <button
              type="button"
              className="w-full text-left p-4 flex justify-between items-center"
              onClick={() => toggleAccordion(id)}
            >
              <span className="flex items-center justify-center gap-4 ibm-600 text-md semibold">
                <img
                  src={arrowDownIcon}
                  alt="Expand"
                  className={`transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
                {title}
              </span>
            </button>

            {/* Accordion Content (scrollable if open) */}
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                isOpen ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {isOpen && (
                <div className="border-t border-gray-200 text-sm">
                  <div className="max-h-[600px] overflow-y-auto p-4 pr-2 custom-scroll">
                    <Suspense
                      fallback={
                        <div className="text-primary-600 medium">
                          Loading section...
                        </div>
                      }
                    >
                      {Component ? (
                        <Component
                          hearing={hearing}
                          isEditing={isEditing}
                          refetch={refetch} // Pass refetch to all sections
                        />
                      ) : null}
                    </Suspense>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default HearingAccordion;
