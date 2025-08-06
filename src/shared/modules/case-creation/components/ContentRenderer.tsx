import GenericSkeleton from "@/shared/components/loader/GenericSkeleton";
import TableLoader from "@/shared/components/loader/TableLoader";
import React, { lazy, Suspense, useEffect, useState } from "react";

const ClaimantDetails = lazy(
  () =>
    import(
      "@/features/initiate-hearing/components/hearing-details/tabs/claimant/ClaimantDetails"
    )
);
const DefendantDetails = lazy(
  () =>
    import(
      "@/features/initiate-hearing/components/hearing-details/tabs/defendant/DefendantDetails"
    )
);
const WorkDetails = lazy(
  () =>
    import(
      "@/features/initiate-hearing/components/hearing-details/tabs/work/WorkDetails"
    )
);
const AddHearing = lazy(
  () =>
    import("@/features/initiate-hearing/components/hearing-topics/AddHearing")
);
const ReviewDetails = lazy(
  () => import("@/features/initiate-hearing/components/review")
);

interface ContentRendererProps {
  currentStep: number;
  currentTab: number;
}

const ContentRenderer: React.FC<ContentRendererProps> = ({
  currentStep = 0,
  currentTab = 0,
}) => {
  const [step, setStep] = useState(currentStep);
  const [tab, setTab] = useState(currentTab);

  useEffect(() => {
    const savedStep = localStorage.getItem("step");
    const savedTab = localStorage.getItem("tab");

    if (savedStep) {
      const newStep = parseInt(savedStep);
      setStep(newStep);
    }
    if (savedTab) {
      const newTab = parseInt(savedTab);
      setTab(newTab);
    }
  }, [currentStep, currentTab]);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedStep = localStorage.getItem("step");
      const savedTab = localStorage.getItem("tab");

      if (savedStep) {
        const newStep = parseInt(savedStep);
        setStep(newStep);
      }
      if (savedTab) {
        const newTab = parseInt(savedTab);
        setTab(newTab);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const renderContent = () => {
    if (step === 0) {
      switch (tab) {
        case 0:
          return (
            <Suspense fallback={<TableLoader />}>
              <ClaimantDetails />
            </Suspense>
          );
        case 1:
          return (
            <Suspense fallback={<TableLoader />}>
              <DefendantDetails />
            </Suspense>
          );
        case 2:
          return (
            <Suspense fallback={<TableLoader />}>
              <WorkDetails />
            </Suspense>
          );
        default:
          return null;
      }
    } else if (step === 1) {
      return (
        <Suspense fallback={<GenericSkeleton />}>
          <AddHearing displayFooter={true} />
        </Suspense>
      );
    } else if (step === 2) {
      return (
        <Suspense fallback={<TableLoader />}>
          <ReviewDetails />
        </Suspense>
      );
    }
    return null;
  };

  return renderContent();
};

export default ContentRenderer;
