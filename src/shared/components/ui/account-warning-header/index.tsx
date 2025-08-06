import React from "react";
import { useTranslation } from "react-i18next";
import info from "@/assets/info-alert.svg";

interface InfoBannerProps {
  onClose?: () => void;
}

const InfoBanner: React.FC<InfoBannerProps> = ({  onClose }) => {
  const { t } = useTranslation();


  return (
    <section>
      <div className="flex items-center py-4 bg-info-980 border-b-2 border-info-500  text-blue-700 rounded-2xs relative mt-4 pl-12">
        <div className="flex justify-between w-full">
          <div className="flex">
            <img src={info} alt={t("error")} className="w-[22px] h-[22px] mr-2 ml-3" />
            <p className="bold text-md text-info-700">{t("info_title")}</p>
            <p className="ml-2 text-md text-info-700 normal">{t("info_desc")}</p>
          </div>
          <div className="flex">
            <button className="pr-6 top-3 text-default-color hover:text-blue-900" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoBanner;
