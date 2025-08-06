import { useTranslation } from "react-i18next";
import { useEffect, useMemo } from "react";
import { useGetStatusWorkLookupQuery } from "./statusLookupApis";

export const useStatusWorkLookup = () => {
 const { i18n } = useTranslation();
  const currentLanguage = i18n.language.toUpperCase();
  const { data, isLoading, refetch } = useGetStatusWorkLookupQuery({
    LookupType: "DataElements",
    ModuleKey: "MSTA1",
    ModuleName: "StatusWork",
    AcceptedLanguage: currentLanguage,
    SourceSystem: "E-Services",
  });

  useEffect(() => {
    refetch();
  }, [i18n.language, refetch]);

  const options = useMemo(() => {
    if (!data?.DataElements) return [];
    return data.DataElements.map((item) => ({
      label: item.ElementValue,
      value: item.ElementKey,
    }));
  }, [data]);


  return {
    options,
    isLoading,
  };
};
