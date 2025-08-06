// import React, { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import Modal from "@/shared/components/modal/Modal";
// import Button from "@/shared/components/button";
// import { useForm } from "react-hook-form";
// import { useFormLayout } from "@/features/initiate-hearing/components/hearing-topics/config/forms.layout.establishment";
// import { Option } from "@/shared/components/form/form.types";
// import {
//   useMainCategoryLookupQuery,
//   useSubCategoryLookupQuery,
// } from "../../services/hearingTopicsService";
// import { DynamicForm } from "@/shared/components/form/DynamicForm";

// interface AddTopicModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (topicPayload: any) => void;
//   applicantType: "Establishment" | "Worker" | "Legal representative";
// }

// const AddTopicModalEnhanced: React.FC<AddTopicModalProps> = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   applicantType,
// }) => {
//   const { t, i18n } = useTranslation("manageHearingDetails");
//   const { register, handleSubmit, setValue, watch, getValues, control } =
//     useForm();

//   const AcceptedLanguage = i18n.language;
//   const SourceSystem = "E-Services";

//   const [mainCategory, setMainCategory] = useState<Option | null>(null);
//   const [subCategory, setSubCategory] = useState<Option | null>(null);
//   const [acknowledged, setAcknowledged] = useState(false);
//   const [showTopicData, setShowTopicData] = useState(false);

//   const { data: mainCategoryData, isLoading: isMainCategoryLoading } =
//     useMainCategoryLookupQuery({
//       LookupType: "CaseElements",
//       ModuleKey: "CaseTopics",
//       ModuleName: "CaseTopics",
//       AcceptedLanguage,
//       SourceSystem,
//       ApplicantType: applicantType,
//     });

//   const { data: subCategoryData, isLoading: isSubCategoryLoading } =
//     useSubCategoryLookupQuery(
//       {
//         LookupType: "CaseElements",
//         ModuleKey: mainCategory?.value || "",
//         ModuleName: "SubTopics",
//         AcceptedLanguage,
//         SourceSystem,
//       },
//       { skip: !mainCategory }
//     );

//   const layout = useFormLayout({
//     t,
//     mainCategory,
//     subCategory,
//     acknowledged,
//     showLegalSection: true,
//     showTopicData,
//     setValue,
//     handleAdd: () => {},
//     handleAcknowledgeChange: (val: boolean) => setAcknowledged(val),
//     handleAddTopic: () => {},
//     handleSend: () => {},
//     isEditing: true,
//     mainCategoryData,
//     subCategoryData,
//     watch,
//     fromPlace: { label: "", value: "" },
//     toPlace: { label: "", value: "" },

//     regulatoryText: "",
//     decisionNumber: "",
//     typeOfRequestLookupData: {},
//     forAllowanceData: {},
//     commissionTypeLookupData: {},
//     accordingToAgreementLookupData: {},
//     matchedSubCategory: undefined,
//     subTopicsLoading: isSubCategoryLoading,
//     amountPaidData: {},
//     leaveTypeData: {},
//     travelingWayData: {},
//     isValid: true,
//     isMainCategoryLoading,
//     isSubCategoryLoading,
//   });

//   const handleAdd = () => {
//     const values = getValues();
//     const payload = {
//       MainTopicID: mainCategory?.value,
//       SubTopicID: subCategory?.value,
//       AcknowledgementTerms: acknowledged,
//       ...values,
//     };
//     onSubmit(payload);
//     onClose();
//   };

//   useEffect(() => {
//     if (mainCategory && subCategory) {
//       setShowTopicData(true);
//     }
//   }, [mainCategory, subCategory]);

//   if (!isOpen) return null;

//   return (
//     <Modal header={t("add_topic")} close={onClose} modalWidth={700}>
//       <div className="space-y-6">
//         <DynamicForm
//           formLayout={layout}
//           register={register}
//           setValue={setValue}
//           control={control}
//           errors={{}}
//         />

//         <div className="flex justify-end gap-3">
//           <Button variant="secondary" onClick={onClose}>
//             {t("cancel")}
//           </Button>
//           <Button variant="primary" onClick={handleSubmit(handleAdd)}>
//             {t("add")}
//           </Button>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// export default AddTopicModalEnhanced;
