import Loader from "@/shared/components/loader";
import { lazy, Suspense } from "react";

const Main = lazy(() => import("@/features/dashboard"));


const HomePage = () => {
  return (
    <Suspense fallback={<Loader/>}>
      <Main/>
      </Suspense>
  )
}

export default HomePage
