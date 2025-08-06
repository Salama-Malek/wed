import { lazy, Suspense, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Button from "@/shared/components/button";
import { useTranslation } from "react-i18next";
import Heading from "@/shared/components/ui/title-header";
import HearingLayout from "@/shared/layouts/HearingLayout";
import TableLoader from "@/shared/components/loader/TableLoader";
import { BreadcrumbsWrapper } from "@/shared/components/breadcrumbs/BreadcrumbWrapper";
import useHearingDetail from "../hooks/useHearingDetail";
import StatusBadge from "../components/common/StatusBadge";
import { SectionId } from "../components/HearingAccordion";
import Modal from "@/shared/components/modal/Modal";
import { toast } from "react-toastify";
import ReopenCaseModal from "./modals/ReopenCaseModal";
import {
  useResendAppointmentMutation,
  useReopenCaseMutation,
  useResolveCaseMutation,
  useUpdateCaseTopicsMutation,
  useLazyNewGeneratePDFV2Query,
} from "../services/hearingActionsService";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
import infoIcon from "@/assets/info-alert.svg";
import { TokenClaims } from "@/features/login/components/AuthProvider";
import { useApiErrorHandler } from "@/shared/hooks/useApiErrorHandler";

const HearingAccordion = lazy(() => import("../components/HearingAccordion"));

const HearingDetails = () => {
  const [showIncompleteAlert, setShowIncompleteAlert] = useState(true);

  const { caseId } = useParams<{ caseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("manageHearingDetails");

  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [resendAppointment] = useResendAppointmentMutation();
  const [reopenCase] = useReopenCaseMutation();
  const [resolveCase] = useResolveCaseMutation();
  const [updateCaseTopics] = useUpdateCaseTopicsMutation();
  const [triggerDownloadPDF] = useLazyNewGeneratePDFV2Query();

  const {
    hearing,
    isLoading,
    isError,
    expanded,
    toggleAccordion,
    loadedComponents,
    refetch,
  } = useHearingDetail();

  const canReopen = hearing?.Reopen === "true";
  const canDownloadMinutes = hearing?.DownloadPDF === "true";
  const canDownloadClaimForm = hearing?.DownloadClaimForm === "true";
  const canResend = hearing?.ResendAppointment === "true";
  const canCancel = hearing?.CancelCase === "true";
  const canUpdate = hearing?.UpdateCase === "true";
  const canComplete = hearing?.IncompleteCase === "true";

  const [modalType, setModalType] = useState<
    "confirm-reopen-initiate" | "confirm-reopen-generic" | "cancel" | null
  >(null);
  const [showCancelSuccess, setShowCancelSuccess] = useState(false);
  const [getCookie, setCookie] = useCookieState();
  const lang = i18n.language;
  const SourceSystem = "E-Services";
  const statusCode = hearing?.StatusWork_Code;

  const { handleResponse, hasErrors } = useApiErrorHandler();

  const handleCancelCase = async () => {
    try {
      setLoadingAction("cancel");
      const isInFlight = ["Under-Investigation", "Under-Negotiations", "Under-NegotiationsCI"].includes(hearing?.StatusWork_Code || "");
      const resolveStatus = isInFlight ? "Resolved-Waived" : "Resolved-Request Cancelled";

      const cancelCaseResponse: any = await resolveCase({
        CaseID: caseId!,
        AcceptedLanguage: lang === "ar" ? "AR" : "EN",
        SourceSystem,
        ResolveStatus: resolveStatus,
      }).unwrap();
      
      const isSuccessful = handleResponse(cancelCaseResponse);
      
      if (isSuccessful) {
        toast.success(t("cancel_success"));
        await refetch();
        setModalType(null);
      }
    } catch {
      toast.error(t("cancel_error"));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleReopenSubmit = async (reason: string) => {
    try {
      setLoadingAction("reopen");
      const reOpenCaseResponse: any = await reopenCase({
        CaseID: caseId!,
        AcceptedLanguage: lang === "ar" ? "AR" : "EN",
        SourceSystem,
        ReopenComments: reason || "",
      }).unwrap();
      
      const isSuccessful = !hasErrors(reOpenCaseResponse) && (reOpenCaseResponse?.SuccessCode === "200" || reOpenCaseResponse?.ServiceStatus === "Success");

      if (isSuccessful) {
        await refetch();
        toast.success(t("reopen_success"));
        setShowReopenModal(false);
        
        if (statusCode === "Resolved-Rejected") {
          setCookie("caseId", caseId);
          localStorage.setItem("step", "0");
          localStorage.setItem("tab", "0");
          navigate("/initiate-hearing/case-creation");
        } else {
          navigate("");
        }
      }
    } catch {
      toast.error(t("reopen_error"));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleUpdateCase = async () => {
    try {
      setLoadingAction("update");
      const updateCaseTopicsResponse: any = await updateCaseTopics({
        CaseID: caseId!,
        AcceptedLanguage: lang === "ar" ? "AR" : "EN",
        SourceSystem,
        CaseTopics: hearing?.CaseTopics || [],
      }).unwrap();
      
      const isSuccessful = !hasErrors(updateCaseTopicsResponse) && (updateCaseTopicsResponse?.SuccessCode === "200" || updateCaseTopicsResponse?.ServiceStatus === "Success");

      if (isSuccessful) {
        toast.success(t("update_success"));
        await refetch();
        navigate("");
      }
    } catch {
      toast.error(t("update_error"));
    } finally {
      setEditMode(false);
      setLoadingAction(null);
    }
  };

  const handleResend = async () => {
    try {
      setLoadingAction("resend");
      const PartyType =
        location.state?.activeTab === "claimant" ? "Plaintiff" : "Defendant";
      const resendAppointmentResponse: any = await resendAppointment({
        CaseID: caseId!,
        AcceptedLanguage: lang === "ar" ? "AR" : "EN",
        SourceSystem,
        PartyType,
      }).unwrap();
      if (
        resendAppointmentResponse.ServiceStatus === "Success" &&
        resendAppointmentResponse.ErrorDetails.length === 0
      ) {
        setShowResendSuccess(true);
      }
    } catch {
      toast.error(t("resend_error"));
    } finally {
      setLoadingAction(null);
    }
  };
  const userClaims: TokenClaims = getCookie("userClaims");
  const userType = getCookie("userType");
  const handleDownload = async (
    actionType: "GenerateLawSuit" | "Download",
    fileName: string
  ) => {

    try {
      const response: any = await triggerDownloadPDF({
        CaseID: caseId!,
        AcceptedLanguage: lang === "ar" ? "AR" : "EN",
        SourceSystem,
        PDFAction: actionType,
        UserType: userType || "",
        IDNumber: userClaims.UserID || "",
      });

      const base64Data = response?.data?.Base64FileData;
      if (!base64Data) throw new Error("File data is missing");
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length)
        .fill(0)
        .map((_, i) => byteCharacters.charCodeAt(i));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error(t("download_error"));
    }
  };

  const handleCompleteCase = () => {
    setCookie("caseId", caseId);
    setCookie("manage-incomplete", true);
    navigate("/initiate-hearing/case-creation");
  };

  const handleReopenClick = () => {
    if (statusCode === "Resolved-Rejected") {
      setModalType("confirm-reopen-generic");
      return;
    }

    const acknowledgmentStatuses = [
      "Resolved-Applicant didnot attend",
      "Resolved-Save the case"
    ];
    
    const needsAcknowledgment = acknowledgmentStatuses.includes(statusCode || "");
    
    if (needsAcknowledgment) {
      setShowReopenModal(true);
    } else {
      setModalType("confirm-reopen-generic");
    }
  };

  const handleEditCase = () => {
    setCookie("caseId", caseId);
    navigate(`/manage-hearings/update-case?caseId=${caseId}`);
    //  setEditMode(true);
    //  toggleAccordion("topics");
  };

  const sections: { id: SectionId; title: string }[] = [
    { id: "data", title: t("step1.title") },
    { id: "topics", title: t("step2.title") },
    { id: "review", title: t("step3.title") },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <TableLoader />
      </div>
    );
  }
  if (isError) {
    return (
          <HearingLayout
      breadcrumbs={
        <BreadcrumbsWrapper
          items={[
            { label: t("breadcrumbs.home"), href: "/" },
            {
              label: t("breadcrumbs.manage_hearings"),
              href: "/manage-hearings",
            },
            {
              label: `${t("hearing_number")} (${caseId})`,
              href: "#",
            },
          ]}
        />
      }
      contentClass="p-7xl"
    >
      {/* Header */}
      <div className="bg-primary-25 p-2 px-4 rounded-md flex items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-950 flex items-center gap-2">
          {t("hearing_number")}{" "}
          <span className="text-primary-600 text-lg">{caseId}</span>
        </h2>
      </div>
      <div className="bg-primary-600 h-[4px] rounded mt-2 mx-4" />

      {/* Incomplete alert */}
      <div className="space-y-3xl">
        <Suspense fallback={<TableLoader />}>
          <div className="text-red-500 p-10 flex justify-center items-center">{t("error_loading_hearing")}</div>
        </Suspense>
      </div>

      {/* Footer buttons */}
      <div className="border-t border-gray-200 pt-6 flex justify-between mt-6">
        <Button
          variant="secondary"
          size="xs"
          onClick={() => navigate("/manage-hearings")}
        >
          {t("back")}
        </Button>
      </div>
    </HearingLayout>
    );
  }

  return (
    <HearingLayout
      breadcrumbs={
        <BreadcrumbsWrapper
          items={[
            { label: t("breadcrumbs.home"), href: "/" },
            {
              label: t("breadcrumbs.manage_hearings"),
              href: "/manage-hearings",
            },
            {
              label: `${t("hearing_number")} (${caseId})`,
              href: "#",
            },
          ]}
        />
      }
      contentClass="p-7xl"
    >
      {/* Header */}
      <div className="bg-primary-25 p-2 px-4 rounded-md flex flex-col lg:flex-row md:flex-row items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-950 flex items-center gap-2">
          {t("hearing_number")}{" "}
          <span className="text-primary-600 text-lg">{caseId}</span>
        </h2>
        <StatusBadge
          status={hearing?.StatusWork || ""}
          status_code={(hearing?.StatusWork_Code || "")
            .toLowerCase()
            .replace(/[\s-]+/g, "_")}
        />
      </div>
      <div className="bg-primary-600 h-[4px] rounded mt-2 mx-4" />

      {/* Actions */}
      <div className="flex flex-wrap justify-between items-center px-4 py-4">
        <Heading>{t("hearing_details")}</Heading>
        <div className="flex flex-wrap gap-2">
          {canDownloadClaimForm && (
            <Button
              variant="secondary"
              typeVariant="gray"
              size="md"
              onClick={() =>
                handleDownload("GenerateLawSuit", `ClaimForm_${caseId}.pdf`)
              }
            >
              {t("download_claim_form")}
            </Button>
          )}
          {canDownloadMinutes && (
            <Button
              variant="secondary"
              typeVariant="black"
              size="md"
              onClick={() =>
                handleDownload("Download", `Minutes_${caseId}.pdf`)
              }
            >
              {t("download_the_minutes")}
            </Button>
          )}
        </div>
      </div>

      {/* Incomplete alert */}
      <div className="space-y-3xl">
        {statusCode === "Resolved-Save the case" && showIncompleteAlert && (
          <div className="flex items-center justify-between gap-md bg-info-980 rounded-2xs px-6 py-2 w-full">
            <div className="flex items-center gap-md">
              <img src={infoIcon} alt={t("alert")} className="w-5 h-5" />
              <p className="text-md font-normal text-info-700 font-primary leading-6">
                <span className="font-semibold">{t("alert")}:</span>{" "}
                {t("incomplete_case_alert")}
              </p>
            </div>
            <button
              onClick={() => setShowIncompleteAlert(false)}
              className="text-info-700 hover:text-info-800 text-lg font-bold"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}

        {statusCode === "Resolved-Rejected" && (
          <div className="bg-error-50 border-b-2 border-error-300 rounded-2xs px-6 py-2">
            <div className="flex items-center gap-2">
              <span className="text-error-700 bg-error-700 rounded-full w-6 h-6 flex items-center justify-center text-white font-bold text-xs">
                !
              </span>
              <span className="text-error-700 text-sm font-bold">
                {t("rejected_status") || "Rejected:"}
              </span>
              {hearing.RejectReasonDetails === "true" &&
              hearing.RejectedReason ? (
                <span className="flex-grow text-error-700 text-sm">
                  {hearing.RejectedReason}
                </span>
              ) : (
                <span className="flex-grow border-t border-dashed border-error-300"></span>
              )}
            </div>
          </div>
        )}

        <Suspense fallback={<TableLoader />}>
          <HearingAccordion
            sections={sections}
            expanded={expanded}
            toggleAccordion={toggleAccordion}
            loadedComponents={loadedComponents}
            hearing={hearing}
            isEditing={editMode}
            refetch={refetch}
          />
        </Suspense>
      </div>

      {/* Footer buttons */}
      <div className="border-t border-gray-200 pt-6 flex justify-between mt-6">
        <Button
          variant="secondary"
          size="xs"
          onClick={() => navigate("/manage-hearings")}
        >
          {t("back")}
        </Button>
        <div className="flex gap-2">
          {canComplete && (
            <Button variant="primary" size="md" onClick={handleCompleteCase}>
              {t("complete_the_case")}
            </Button>
          )}

          {!editMode && canUpdate && (
            <Button
              variant="primary"
              size="md"
              onClick={() => handleEditCase()}
            >
              {t("edit_case")}
            </Button>
          )}
          {editMode && (
            <Button
              variant="primary"
              size="md"
              onClick={handleUpdateCase}
              disabled={loadingAction === "update"}
            >
              {t("save")}
            </Button>
          )}
          {!editMode && canResend && (
            <Button
              variant="primary"
              size="xs"
              onClick={handleResend}
              disabled={loadingAction === "resend"}
            >
              {t("resend_appointment")}
            </Button>
          )}
          {!editMode && canReopen && (
            <Button
              variant="primary"
              size="md"
              onClick={handleReopenClick}
              disabled={loadingAction === "reopen"}
            >
              {t("reopen_case")}
            </Button>
          )}
          {!editMode && canCancel && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setModalType("cancel")}
              disabled={loadingAction === "cancel"}
            >
              {t("cancel_the_case")}
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      {showReopenModal && (
        <ReopenCaseModal
          statusCode={statusCode!}
          onClose={() => setShowReopenModal(false)}
          onSubmit={handleReopenSubmit}
        />
      )}

      {showResendSuccess && (
        <Modal
          close={() => setShowResendSuccess(false)}
          header={t("resend_success_title")}
          modalWidth={500}
        >
          <p className="text-sm text-gray-700">{t("resend_success_desc")}</p>
          <div className="flex justify-end mt-6">
            <Button
              variant="primary"
              onClick={() => setShowResendSuccess(false)}
            >
              {t("ok")}
            </Button>
          </div>
        </Modal>
      )}

      {modalType === "confirm-reopen-initiate" && (
        <Modal
          close={() => setModalType(null)}
          header={t("reopen_case")}
          modalWidth={500}
        >
          <p className="text-sm text-gray-700">
            {t("confirm_reopen_initiate_desc")}
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setModalType(null)}>
              {t("not")}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setModalType(null);
                setCookie("caseId", caseId);
                navigate("/initiate-hearing/case-creation");
              }}
            >
              {t("yes")}
            </Button>
          </div>
        </Modal>
      )}

      {modalType === "confirm-reopen-generic" && (
        <Modal
          close={() => setModalType(null)}
          header={t("reopen_case")}
          modalWidth={500}
        >
          <p className="text-sm text-gray-700">
            {t("confirm_reopen_generic_desc")}
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setModalType(null)}>
              {t("not")}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setModalType(null);
                handleReopenSubmit("");
              }}
            >
              {t("yes")}
            </Button>
          </div>
        </Modal>
      )}

      {modalType === "cancel" && (
        <Modal
          close={() => setModalType(null)}
          header={t("cancel_the_case")}
          modalWidth={500}
        >
          <p className="text-sm text-gray-700">{t("confirm_cancel_desc")}</p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" onClick={() => setModalType(null)}>
              {t("not")}
            </Button>
            <Button
              variant="primary"
              onClick={handleCancelCase}
              disabled={loadingAction === "cancel"}
            >
              {t("yes")}
            </Button>
          </div>
        </Modal>
      )}

      {showCancelSuccess && (
        <Modal
          close={() => {
            setShowCancelSuccess(false);
            navigate("");
          }}
          header={t("cancel_success")}
          modalWidth={500}
        >
          <p className="text-sm text-gray-700">{t("cancel_success_desc")}</p>
          <div className="flex justify-end mt-6">
            <Button
              variant="primary"
              onClick={() => {
                setShowCancelSuccess(false);
                navigate("");
              }}
            >
              {t("ok")}
            </Button>
          </div>
        </Modal>
      )}
    </HearingLayout>
  );
};

export default HearingDetails;
