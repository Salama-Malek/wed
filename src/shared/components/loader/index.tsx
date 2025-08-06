import React from "react";
import styles from "./Loader.module.css";
import { useTranslation } from "react-i18next";

const Loader = () => {
  const { t } = useTranslation("translation");
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-25 backdrop-blur-sm z-50">
      <div className={styles.loader}></div>
      <p className="mt-4 text-white text-sm font-medium">
        {t("loading_spinner")}
      </p>
    </div>
  );
};

export default React.memo(Loader);
