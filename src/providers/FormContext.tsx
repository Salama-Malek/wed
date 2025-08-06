// src/providers/FormContext.tsx
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useMemo,
} from "react";
import {
  useForm,
  UseFormReturn,
  UseFormProps,
  FormState,
} from "react-hook-form";
import { FormData } from "@/shared/components/form/form.types";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Topic } from "@/features/initiate-hearing/components/hearing-topics/hearing.topics.types";
import { FormResetProvider } from "./FormResetProvider";

interface FormContextType extends UseFormReturn<FormData> {
  formState: FormState<FormData>;
  formData: FormData | null;
  setFormData: (data: FormData) => void;
  clearFormData: (validate?: boolean) => void;
  editTopic: Topic | null;
  setEditTopic: (topic: Topic | null) => void;
  forceValidateForm: () => Promise<boolean>;
  handleRemoveValidation: () => void;
}

const FormContext = createContext<FormContextType | null>(null);

export const useAPIFormsData = () => {
  const ctx = useContext(FormContext);
  if (!ctx)
    throw new Error("useAPIFormsData must be used within a FormProvider");
  return ctx;
};

interface FormProviderProps {
  children: ReactNode;
  formOptions?: UseFormProps<FormData>;
}

export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  formOptions,
}) => {
  const storeDefaults =
    useSelector((s: RootState) => s.DefaultValues?.values) || {};

  const mergedDefaults = useMemo<Partial<FormData>>(
    () => ({
      applicantType: "principal",
      claimantStatus: "principal",
      defendantStatus: "Government",
      contractDateHijri: "",
      contractDateGregorian: "",
      contractExpiryDateHijri: "",
      contractExpiryDateGregorian: "",
      dateofFirstworkingdayHijri: "",
      dateOfFirstWorkingDayGregorian: "",
      dateoflastworkingdayHijri: "",
      dateofLastworkingdayGregorian: "",
      // Case topics date fields
      from_date_hijri: "",
      from_date_gregorian: "",
      to_date_hijri: "",
      to_date_gregorian: "",
      date_hijri: "",
      date_gregorian: "",
      injury_date_hijri: "",
      injury_date_gregorian: "",
      managerial_decision_date_hijri: "",
      managerial_decision_date_gregorian: "",
      request_date_hijri: "",
      request_date_gregorian: "",
      ...storeDefaults,
    }),
    [storeDefaults]
  );

  const formMethods = useForm<FormData>({
    mode: "onChange",
    shouldUnregister: true,
    defaultValues: mergedDefaults,
    ...formOptions,
  });

  // local form-data state (for saving / resetting)
  const [formData, setFormDataState] = useState<FormData | null>(null);
  const [editTopic, setEditTopic] = useState<Topic | null>(null);

  // helpers
  const setFormData = (data: FormData) => {
    setFormDataState(data);
    formMethods.reset(data);
  };

  const clearFormData = (validate = true) => {
    setFormDataState(null);
    formMethods.reset(mergedDefaults as any, { keepErrors: !validate });
  };

  const forceValidateForm = async () => {
    const valid = await formMethods.trigger();
    if (!valid) formMethods.clearErrors();
    return valid;
  };

  const handleRemoveValidation = () => {
    formMethods.clearErrors();
  };

  return (
    <FormContext.Provider
      value={{
        ...formMethods,
        formState: formMethods.formState,
        formData,
        setFormData,
        clearFormData,
        editTopic,
        setEditTopic,
        forceValidateForm,
        handleRemoveValidation,
      }}
    >
      <FormResetProvider setValue={formMethods.setValue} clearErrors={formMethods.clearErrors}>
        {children}
      </FormResetProvider>
    </FormContext.Provider>
  );
};
