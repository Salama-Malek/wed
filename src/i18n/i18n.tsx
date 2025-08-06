import i18next from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";
import { getOptions } from "./settings";
import { match } from "ts-pattern";

if (!i18next.isInitialized) {
  i18next
    .use(initReactI18next)
    .use(
      resourcesToBackend(async (language: string, namespace: string) => {
        try {
          const module = await import(`@/locales/${language}.json`);
          return module.default[namespace] ?? {};
        } catch {
          return {};
        }
      })
    )
    .init(getOptions());
}

export function useTranslation(
  lng: string,
  ns: string | string[],
  options: Record<string, string> = {}
) {
  i18next.changeLanguage(lng);

  const isArray = Array.isArray(ns);
  return {
    t: i18next.getFixedT(
      lng,
      match(isArray)
        .with(true, () => ns[0])
        .otherwise(() => ns),
      options.keyPrefix
    ),
    i18n: i18next,
  };
}
