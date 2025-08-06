import React from "react";
import { Section } from "@/shared/layouts/Section";
import { RadioGroup } from "./RadioGroup";
import { InputField } from "./InputField";
import { NumberOnlyInput } from "./NumberOnlyInput";
import { FileNumberInput } from "./FileNumberInput";
import { AutoCompleteField } from "./AutoComplete";
import { CheckboxField } from "./Checkbox";
import { ReadOnlyField } from "../ui/read-only-view";
import { SectionLayout } from "./form.types";
import { UseFormRegister, FieldErrors, Control } from "react-hook-form";
import Button from "../button";
import { DateOfBirthField } from "../calanders";

interface DynamicFormProps {
  formLayout: SectionLayout[];
  register: UseFormRegister<any>;
  watch: any;
  errors: FieldErrors;
  setValue?: any;
  control?: Control<any>;
  isLoading?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  formLayout,
  register,
  watch,
  errors,
  setValue,
  control,
  isLoading,
}) => {
  // Helper function to check if a field is a file number field
  const isFileNumberField = (name: string): boolean => {
    const fileNumberPatterns = [
      /File.*Number/i,
      /fileNumber/i,
      /FileNumber/i,
      /DefendantFileNumber/i,
      /PlaintiffFileNumber/i,
      /EstablishmentFileNumber/i
    ];
    return fileNumberPatterns.some(pattern => pattern.test(name));
  };

  return (
    <>
      {formLayout?.map((section, index) => {
        if (section.condition !== undefined && !section.condition) return null;
        const sectionKey = `${section.title || "section"}-${index}`;

        return (
          <Section
            key={sectionKey}
            isHidden={section.isHidden}
            title={section.title}
            isRadio={section.isRadio}
            removeMargin={section.removeMargin}
            requiredText={section.requiredText}
            gridCols={section.gridCols}
          >
            {section.children?.map((child, childIndex) => {
              const colSpan = child?.colSpan || 1;
              if (!child) return null;
              if (child.condition !== undefined && !child.condition) return null;

              const childKey = `${sectionKey}-${"name" in child ? child.name : childIndex
                }-${child.type}`;

              switch (child.type) {
                case "radio":
                  return (
                    <div key={childKey} className={`col-span-${colSpan}`}>
                      <RadioGroup
                        hasIcon={child.hasIcon}
                        name={child.name}
                        label={child.label}
                        options={child.options}
                        value={child.value}
                        onChange={child.onChange}
                        notRequired={child.notRequired}
                        validation={child.validation}
                        control={control}
                        invalidFeedback={errors[child.name]?.message}
                      />
                    </div>
                  );

                case "input":
                  // Use FileNumberInput for file number fields
                  if (child.name && isFileNumberField(child.name)) {
                    return (
                      <div key={childKey} className={`col-span-${colSpan}`}>
                        <FileNumberInput
                          isLoading={child.isLoading}
                          {...register(child.name, child.validation)}
                          name={child.name}
                          invalidFeedback={errors[child.name]?.message}
                          type={child.inputType}
                          maxLength={child.maxLength}
                          min={child.min}
                          label={child.label}
                          control={control}
                          notRequired={child.notRequired}
                          placeholder={child.placeholder}
                          onBlur={child.onBlur}
                          disabled={child.disabled}
                          onFileNumberSubmit={(value) => {
                            // Optional: Trigger the onBlur function when Enter is pressed
                            if (child.onBlur) {
                              child.onBlur();
                            }
                          }}
                        />
                      </div>
                    );
                  }

                  // Use NumberOnlyInput for text fields that should only accept numbers
                  if (child.inputType === "text" && (child as any).numberOnly) {
                    return (
                      <div key={childKey} className={`col-span-${colSpan}`}>
                        <NumberOnlyInput
                          isLoading={child.isLoading}
                          {...register(child.name, child.validation)}
                          name={child.name}
                          invalidFeedback={errors[child.name]?.message}
                          maxLength={child.maxLength}
                          label={child.label}
                          control={control}
                          notRequired={child.notRequired}
                          placeholder={child.placeholder}
                          onBlur={child.onBlur}
                          disabled={child.disabled}
                          onChange={child.onChange}
                        />
                      </div>
                    );
                  }

                  // Use regular InputField for other input fields
                  return (
                    <div key={childKey} className={`col-span-${colSpan}`}>
                      <InputField
                        isLoading={child.isLoading}
                        {...register(child.name, child.validation)}
                        name={child.name}
                        invalidFeedback={errors[child.name]?.message}
                        type={child.inputType}
                        maxLength={child.maxLength}
                        min={child.min}
                        label={child.label}
                        control={control}
                        notRequired={child.notRequired}
                        placeholder={child.placeholder}
                        onBlur={child.onBlur}
                        disabled={child.disabled}
                      />
                    </div>
                  );

                case "autocomplete":
                  return (
                    <div key={childKey} className={`col-span-${colSpan}`}>
                      <AutoCompleteField
                        isLoading={child.isLoading}
                        name={child.name}
                        options={child.options}
                        label={child.label}
                        notRequired={child.notRequired}
                        invalidFeedback={errors[child.name]?.message as string}
                        validation={child.validation}
                        control={control}
                        disabled={child.disabled}
                        onClear={child.onClear}
                        value={child.value}
                        onChange={child.onChange}
                        autoSelectValue={child.autoSelectValue}

                      />
                    </div>
                  );

                case "checkbox":
                  return (
                    <div
                      key={childKey}
                      className={`col-span-${colSpan} flex items-center`}
                    >
                      <CheckboxField
                        name={child.name}
                        rules={child.rules}
                        className={child.className}
                        label={child.label}
                        checked={child.checked}
                        disabled={child.disabled}
                        invalidFeedback={errors[child.name]}
                        control={control}
                        onChange={child.onChange}
                      />
                    </div>
                  );

                case "dateOfBirth": {
                  // pull current hijri string so picker reflects form state
                  const currentHijri = watch(child.hijriFieldName);
                  return (
                    <div key={childKey} className={`col-span-${colSpan}`}>
                      <DateOfBirthField
                        control={control}
                        setValue={setValue}
                        hijriLabel={child.hijriLabel}
                        gregorianLabel={child.gregorianLabel}
                        hijriFieldName={child.hijriFieldName}
                        gregorianFieldName={child.gregorianFieldName}
                        notRequired={child.notRequired}
                        value={currentHijri}
                        //@ts-ignore
                        invalidFeedback={errors[child.hijriFieldName]?.message}
                      />
                    </div>
                  );
                }

                case "readonly":
                  return (
                    <div key={childKey} className={`col-span-${colSpan}`}>
                      <ReadOnlyField
                        isLoading={child.isLoading}
                        label={child.label}
                        value={child.value}
                        notRequired
                      />
                    </div>
                  );

                case "button":
                  return (
                    <div key={childKey} className={`col-span-${colSpan}`}>
                      <Button
                        disabled={child.disabled}
                        type="button"
                        size={child.size || "sm"}
                        variant="primary"
                        typeVariant="brand"
                        onClick={child.onClick}
                      >
                        {child.label}
                      </Button>
                    </div>
                  );

                case "custom":
                  return (
                    <div key={childKey} className={`col-span-${colSpan}`}>
                      {child.component}
                    </div>
                  );

                default:
                  return null;
              }
            })}

            {section.data?.type === "readonly" && section.data.fields && (
              <>
                {section.data.fields.map(({ label, value }, idx) => (
                  <ReadOnlyField
                    key={`${sectionKey}-${label}-${idx}`}
                    isLoading={isLoading}
                    label={label}
                    value={value}
                    notRequired
                  />
                ))}
              </>
            )}
          </Section>
        );
      })}
    </>
  );
};
