import { ReactNode } from "react";
import styles from "./ScreenContainer.module.css";

interface ScreenContainerProps {
  children: ReactNode;
}

export const ScreenContainer = ({ children }: ScreenContainerProps) => {
  return <div className={styles.container}>{children}</div>;
};
