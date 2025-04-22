import s from "./TestModalContainer.module.css";

type TestModalContainerProps = {
    isOpen: boolean;
    children?: React.ReactNode;
};

export const TestModalContainer = ({ children }: TestModalContainerProps) => {
    return <div className={s.testModalContainer}>{children}</div>;
};
