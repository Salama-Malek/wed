import React, { lazy, Suspense, useEffect } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  RouteObject,
} from "react-router-dom";
import "./i18n/i18n";
import Loader from "./shared/components/loader";
import { MainErrorFallback } from "./shared/components/errors/ErrorFallback";
import { OfflineLayout } from "./shared/layouts/OfflineLayout";

import MainLayout from "./shared/layouts/MainLayout";
import StepperSkeleton from "./shared/components/loader/StepperSkeleton";
import { TokenExpirationProvider } from "./providers/TokenExpirationProvider";
import { ToastContainer } from "react-toastify";
import Logout from "./features/login/LogOut";
import { useTranslation } from "react-i18next";

const LoginLazy = lazy(() => import("./features/login/Index"));
const CaseCreation = lazy(() => import("./shared/modules/case-creation"));
const InitiateHearing = lazy(() => import("./views/initiate-hearing/page"));
const Main = lazy(() => import("@/features/dashboard"));
const ManageHearings = lazy(() => import("./features/manage-hearings/components/ManageHearings"));
const HearingDetails = lazy(() => import("./features/manage-hearings/components/HearingDetails"));
const UpdateTopic = lazy(() => import("./features/manage-hearings/components/UpdateTopic"));

const LazyLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loader />}>{children}</Suspense>
);

const routesConfig: RouteObject[] = [
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <MainErrorFallback />,
    children: [
      {
        index: true,
        element: (
          <LazyLoader>
            <Main />
          </LazyLoader>
        ),
      },
      {
        path: "initiate-hearing",
        element: (
          <LazyLoader>
            <InitiateHearing />
          </LazyLoader>
        ),
        children: [
          {
            index: true,
            path: "case-creation",
            element: (
              <Suspense fallback={<StepperSkeleton />}>
                <CaseCreation />
              </Suspense>
            ),
          },
        ],
      },

      {
        path: "manage-hearings",
        element: (
          <LazyLoader>
            <ManageHearings />
          </LazyLoader>
        ),
      },
      {
        path: "manage-hearings/:caseId",
        element: (
          <LazyLoader>
            <HearingDetails />
          </LazyLoader>
        ),
      },
      {
        path: "manage-hearings/update-case",
        element: (
          <LazyLoader>
            <UpdateTopic />
          </LazyLoader>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: (
      <LazyLoader>
        <LoginLazy />
      </LazyLoader>
    ),
    errorElement: <MainErrorFallback />
  },
  {
    path: "/logout",
    element: (
      <Logout />
    ),
    errorElement: <MainErrorFallback />,
  },
];

const router = createBrowserRouter(routesConfig, {
  basename: '/portal/'
});

const App = () => {
  const { t, i18n } = useTranslation('meta');

  useEffect(() => {
    document.title = t('title');
  }, [i18n.language, t]);

  return (
    <TokenExpirationProvider>
      <OfflineLayout>
        <RouterProvider router={router} />
        <ToastContainer />
      </OfflineLayout>
    </TokenExpirationProvider>
  )
};

export default App;
