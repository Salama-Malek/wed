import Button from "@/shared/components/button";
import { News01Icon, Pdf01Icon } from "hugeicons-react";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import MyDropdown from "@/providers";
import { HelpCenterHeader } from "./HelpCenterHeader";

interface HelpCenterProps {
  hasActivityAlerts: boolean;
  languageOptions: { value: string; label: string }[];
  selectedOption: { value: string; label: string } | null;
  setSelectedOption: (option: { value: string; label: string }) => void;
  fileData: {
    [category: string]: {
      // e.g., "userGuide", "duties"
      [langCode: string]: {
        // e.g., "en", "ar", "in"
        name: string;
        size: string;
        date: string;
        url: string;
        lang: string; // Added since your objects include this
      };
    };
  };
}

const HelpCenter = ({
  hasActivityAlerts,
  languageOptions,
  fileData,
}: HelpCenterProps) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const [selectedOptions, setSelectedOptions] = React.useState<{
    [category: string]: { value: string; label: string };
  }>({});

  const updateLang = (
    category: string,
    option: { label: string; value: string }
  ) => {
    setSelectedOptions((prev) => ({ ...prev, [category]: option }));
  };

  useEffect(() => {
    // Initialize selected options with user's language preference
    const initialOptions = Object.keys(fileData).reduce((acc, category) => {
      const langs = fileData[category];
      // Try to use current language, fallback to 'en' if not available
      const defaultLang = langs[currentLanguage] ? currentLanguage : 'en';
      acc[category] = {
        value: defaultLang,
        label: langs[defaultLang]?.lang || 'English'
      };
      return acc;
    }, {} as { [category: string]: { value: string; label: string } });
    
    setSelectedOptions(initialOptions);
  }, [fileData, currentLanguage]);

  return (
    <section className=" py-[16px] p-4xl bg-light-alpha-white flex flex-col shadow-md rounded-md">
      {hasActivityAlerts ? (
        <div className=" b-radius  p-11xl bg-light-alpha-white flex flex-col">
          <h6 className="text-lg semibold text-gray-900">{t("alert_title")}</h6>
          <hr className="border-t border-gray-200 my-[6px]" />

          <div className="flex flex-col items-center justify-center flex-grow text-gray-500">
            <div className="w-[80px] h-[80px] flex items-center justify-center rounded-full mb-4">
              <News01Icon
                size={120}
                strokeWidth={0.5}
                className="text-gray-400 mb-[35px]"
              />
            </div>
            <p className="text-sm text-gray-500">{t("alert_text")}</p>
          </div>
        </div>
      ) : (
        <div className="">
          <div className="bg-white">
            <div className="flex justify-between items-center border-b pb-3">
              <HelpCenterHeader />
            </div>
            <div className="mt-6 space-y-6">
              {Object.entries(fileData).map(([category, langs]) => {
                const selected = selectedOptions[category] || {
                  value: currentLanguage, // Use current language as default
                  label: langs[currentLanguage]?.lang || langs["en"]?.lang || "English",
                };
                const selectedFile = langs[selected.value];

                return (
                  <div
                    key={category}
                    className="flex flex-col md:flex-row items-start md:items-center p-4 border rounded-md gap-4"
                  >
                    <div className="bg-primary-50 text-primary-600 p-2 rounded-md">
                      <Pdf01Icon size={18} />
                    </div>
                    <div className="flex flex-col md:flex-row justify-between w-full md:items-center gap-4 md:gap-8">
                      <div className="flex flex-col  md:flex-row md:items-center justify-between md:w-6/12">
                        <p className="semibold default-color">
                          {selectedFile?.name || t("no_file")}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-500 md:ml-4">
                          <span>{t("File_size")}:</span>
                          <span className="text-black">{selectedFile?.size || "--"}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <MyDropdown
                          className="!w-auto !h-10 border-0 text-light-alpha-white text-md medium"
                          applyStyle={{
                            variant: "secondary",
                            typeVariant: "outline",
                            size: "xs",
                          }}
                          buttonLabel={selected.label}
                          items={Object.entries(langs).map(([code, f]) => ({
                            value: code,
                            label: f.lang,
                          }))}
                          selected={selected}
                          onChange={(value) => updateLang(category, value)}
                        />
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2 md:w-3/12 justify-start md:justify-end">
                        <Button
                          variant="secondary"
                          typeVariant="gray"
                          size="xs"
                          onClick={() => window.open(selectedFile?.url, "_blank")}
                        >
                          {t("view")}
                        </Button>
                        <Button
                          variant="secondary"
                          typeVariant="outline"
                          size="xs"
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = selectedFile?.url;
                            link.download = selectedFile?.name;
                            link.click();
                          }}
                        >
                          {t("download")}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HelpCenter;
