import React from "react";
import clsx from "clsx";
import styles from "./TableLoader.module.css";

interface TableLoaderProps {
  className?: string;
}

const TableLoader: React.FC<TableLoaderProps> = ({ className }) => {
  return (
    <div className={clsx("flex items-center justify-start gap-2 py-6", className)}>
      <div className={styles.loader}></div>
    </div>
  );
};

export default React.memo(TableLoader);
