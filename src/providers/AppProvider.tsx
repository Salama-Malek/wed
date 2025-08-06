import { MainErrorFallback } from "@/shared/components/errors/ErrorFallback";
import { store } from "@/redux/store";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Provider } from "react-redux";
import { TabsProvider } from "@/shared/components/tabs/TabsContext";
import { DateProvider } from "@/shared/components/calanders/DateContext";
import { LanguageDirectionProvider } from "@/i18n/LanguageDirectionProvider";
import { CookiesProvider } from "react-cookie";
import { FormProvider } from "./FormContext";
import { UserTypeProvider } from "./UserTypeContext";

type ProviderProps = {
  children: React.ReactNode;
};

export const AppProvider: React.FC<ProviderProps> = ({ children }) => {
  return (
          <Provider store={store}>
    <Suspense fallback={<></>}>
      <UserTypeProvider>
        <DateProvider>
          <ErrorBoundary
            //@ts-ignore
            FallbackComponent={MainErrorFallback}
            onReset={() => window.location.reload()}
          >
            <LanguageDirectionProvider>
              <FormProvider>
                <CookiesProvider>
                    <TabsProvider>{children}</TabsProvider>
                </CookiesProvider>
              </FormProvider>
            </LanguageDirectionProvider>
          </ErrorBoundary>
        </DateProvider>
      </UserTypeProvider>
    </Suspense>
                  </Provider>
  );
};
