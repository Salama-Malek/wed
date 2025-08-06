// src/shared/components/form/FormRenderer.tsx
import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { SectionLayout } from "./form.types";
import Button from "../button";
import { AutoCompleteField } from "./AutoComplete";
import { DateOfBirthField } from "../calanders";

type Props = { sections: SectionLayout[] };

export default function FormRenderer({ sections }: Props) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <>
      {sections.map((sec, i) => {
        // Skip entire section if its condition is explicitly false
        if (sec.condition === false) return null;

        return (
          <section key={i} className={sec.className}>
            {sec.title && <h3>{sec.title}</h3>}

            {sec.children?.map((field, j) => {
              switch (field.type) {
                case "readonly":
                  return (
                    <div key={j}>
                      <strong>{field.label}: </strong>
                      <span>{field.value}</span>
                    </div>
                  );

                case "input":
                  return (
                    <div key={j}>
                      <label htmlFor={field.name}>{field.label}</label>
                      <input
                        id={field.name}
                        {...register(field.name!, field.validation)}
                        type={field.inputType}
                        placeholder={field.placeholder}
                        min={field.min}
                      />
                      {errors[field.name!] && (
                        <p className="error">
                          {errors[field.name!]?.message as string}
                        </p>
                      )}
                    </div>
                  );

                case "autocomplete":
                  return (
                    <Controller
                      key={j}
                      control={control}
                      name={field.name!}
                      rules={field.validation}
                      render={({ field: fc }) => (
                        <AutoCompleteField
                          label={field.label}
                          options={field.options || []}
                          value={fc.value}
                          onChange={fc.onChange}
                        />
                      )}
                    />
                  );

                case "radio":
                  return (
                    <Controller
                      key={j}
                      control={control}
                      name={field.name!}
                      rules={field.validation}
                      render={({ field: fc }) => (
                        <div>
                          <label>{field.label}</label>
                          {field.options?.map((opt: any) => (
                            <label key={opt.value}>
                              <input
                                type="radio"
                                value={opt.value}
                                checked={fc.value === opt.value}
                                onChange={() => fc.onChange(opt.value)}
                              />
                              {opt.label}
                            </label>
                          ))}
                          {errors[field.name!] && (
                            <p className="error">
                              {errors[field.name!]?.message as string}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  );

                case "checkbox":
                  return (
                    <label key={j}>
                      <input
                        type="checkbox"
                        {...register(field.name!, {
                          ...field.validation,
                          value: field.checked,
                        })}
                      />
                      {field.label}
                    </label>
                  );

                case "dateOfBirth":
                  return (
                    <DateOfBirthField
                      key={j}
                      hijriLabel={field.hijriLabel}
                      gregorianLabel={field.gregorianLabel}
                      hijriFieldName={field.hijriFieldName!}
                      gregorianFieldName={field.gregorianFieldName!}
                    //   validation={field.validation}
                    />
                  );

                case "custom":
                  return <React.Fragment key={j}>{field.component}</React.Fragment>;

                default:
                  return null;
              }
            })}
          </section>
        );
      })}
    </>
  );
}
