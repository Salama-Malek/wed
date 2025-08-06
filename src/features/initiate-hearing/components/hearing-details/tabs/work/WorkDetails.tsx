import { DynamicForm } from "@/shared/components/form/DynamicForm";
import withStepNavigation from "@/shared/HOC/withStepNavigation";
import { useFormLayout } from "./worker.forms.formLayout";
import {
  useLazyGetContractTypeLookupQuery,
  useGetSalaryTypeLookupQuery,
} from "@/features/initiate-hearing/api/create-case/workDetailApis";
import {
  useGetLaborOfficeLookupDataQuery,
  useGetWorkerCityLookupDataQuery,
  useGetWorkerRegionLookupDataQuery,
} from "@/features/initiate-hearing/api/create-case/plaintiffDetailsApis";
import { useEffect, useMemo, useState } from "react";
import { useCookieState } from "@/features/initiate-hearing/hooks/useCookieState";
// import useCaseDetailsPrefill from "@/features/initiate-hearing/hooks/useCaseDetailsPrefill"; 
import { useAPIFormsData } from "@/providers/FormContext";
import { legRepVsWorkerUseFormLayout } from "../../establishment-tabs/legal-representative/work/legworker.forms.formLayout";
import { useTranslation } from "react-i18next";
import { FormResetProvider } from '@/providers/FormResetProvider';
import useWorkDetailsPrefill from "@/features/initiate-hearing/hooks/useWorkDetailsPrefill";
import { SectionLayout } from "@/shared/components/form/form.types";

export interface WorkDetailsProps {
  register?: any;
  errors?: any;
  setValue?: any;
  watch?: any;
  control?: any;
  isVerifiedInput?: boolean;
}

const WorkDetails = ({
  register,
  errors,
  setValue,
  watch,
  control,
  isVerifiedInput = true,
}: WorkDetailsProps) => {

  const { forceValidateForm, handleRemoveValidation } = useAPIFormsData();

  // this is prefill, 
  // it's roll to get data from case details and pull it in the feilds 
  // the loading is for trigger the api related to the extractEstData 
  // the workedata have the work data for the palinteff or the defendnet 
  const {
    isFeatched: caseDetailsLoading,
    workData
  } = useWorkDetailsPrefill(setValue as any);
  useEffect(() => {
      
    [
      "typeOfWage",
      "salary",
      "contractType",
      "contractNumber",
      "contractDateHijri",
      "contractDateGregorian",
      "contractExpiryDateHijri",
      "contractExpiryDateGregorian",
      "isStillEmployed",
      "dateofFirstworkingdayHijri",
      "dateOfFirstWorkingDayGregorian",
      "dateoflastworkingdayHijri",
      "dateOfLastWorkingDayGregorian",
      "jobLocation",
      "jobLocationCity",
      "laborOffice",

    ].forEach((e: any) => setValue(e, null));
  }, [])


  // useEffect(() => {
  //   forceValidateForm();

  //   setValue("region", null);
  //   setValue("city", null);
  // }, []);

  const getFormLayout = () => {
    return legRepVsWorkerUseFormLayout(
      setValue,
      control,
      watch,
      caseDetailsLoading,
      workData
    );
  }




  return (
    <FormResetProvider setValue={setValue} clearErrors={handleRemoveValidation}>
      <div className="flex flex-col gap-4">
        <DynamicForm
          formLayout={getFormLayout()}
          register={register}
          errors={errors}
          setValue={setValue}
          control={control}
          watch={watch}
        />
      </div>
    </FormResetProvider>
  );
};

export default withStepNavigation(WorkDetails);