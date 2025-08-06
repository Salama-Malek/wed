import { FormElement } from "@/shared/components/form/form.types";

interface Option {
  value: string;
  label: string;
}

interface BR1FormProps {
  t: (key: string) => string;
  setValue: (field: string, value: unknown) => void;
  MainCategoryOptions: Option[];
  mainCategory: any;
  SubCategoryOptions: Option[];
  subCategory: any;
  handleAdd: () => void;
  isMainCategoryLoading?: boolean
  isSubCategoryLoading?: boolean;
  onClearMainCategory: () => void;
  onClearSubCategory: () => void;
}

export const getStep1FormFields = ({
  t,
  setValue,
  MainCategoryOptions,
  mainCategory,
  SubCategoryOptions,
  subCategory,
  handleAdd,
  isMainCategoryLoading,
  isSubCategoryLoading,
  onClearMainCategory,
  onClearSubCategory
}: BR1FormProps): FormElement[] => {
  return [
    {
      isLoading: isMainCategoryLoading,
      type: "autocomplete",
      name: "mainCategory",
      label: t("main_category"),
      options: MainCategoryOptions,
      value: mainCategory,
      onChange: (option: Option | null) => {
        setValue("mainCategory", option);
        setValue("subCategory", null);
        if (option) {
          onClearSubCategory();
        }
      },
      onClear: onClearMainCategory,
      // validation: { required: t('main_category_required') }
    },
    {
      isLoading: isSubCategoryLoading,
      type: "autocomplete",
      name: "subCategory",
      label: t("sub_category"),
      options: SubCategoryOptions,
      value: subCategory,
      onChange: (option: Option | null) => {
        setValue("subCategory", option);
        setValue("acknowledged", false);
        if (option) {
          handleAdd();
        }
      },
      onClear: onClearSubCategory,
      // validation: { required: t('sub_category_required') }
    },
    // {
    //   disabled: !(mainCategory && subCategory),
    //   type: "button",
    //   label: t("add"),
    //   onClick: handleAdd,
    //   size: "sm",
    //   colSpan: 2,
    // },
  ]
};