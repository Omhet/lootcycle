import { ReactNode } from "react";
import styles from "./ScreenContainer.module.css";

interface ScreenContainerProps {
  className?: string;
  children: ReactNode;
}

export const ScreenContainer = ({ children, className }: ScreenContainerProps) => {
  return <div className={`${styles.container} ${className || ""}`}>{children}</div>;
};
