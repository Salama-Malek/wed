import AddHearing from "@/features/initiate-hearing/components/hearing-topics/AddHearing";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import { useEffect } from "react";

const UpdateTopicComponent = () => {
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get("caseId");
  const { t, i18n } = useTranslation("manageHearingDetails");
  const [getCookie, setCookie] = useCookieState();

  console.log("[🔍 UPDATE TOPIC DEBUG] caseId from search params:", caseId);
  console.log("[🔍 UPDATE TOPIC DEBUG] Setting displayFooter to false");

  // Set the caseId cookie when the component mounts
  useEffect(() => {
    if (caseId) {
      console.log("[🔍 UPDATE TOPIC DEBUG] Setting caseId cookie:", caseId);
      setCookie("caseId", caseId);
    }
  }, [caseId, setCookie]);

  return (
    <div className="space-y-8 p-5">
      <AddHearing displayFooter={false} />
    </div>
  );
};

export default UpdateTopicComponent;
