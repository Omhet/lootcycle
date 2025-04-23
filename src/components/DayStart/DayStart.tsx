import s from "./DayStart.module.css";

type DayStartProps = {
  dayNumber: number;
  onStartDay: () => void;
};

export const DayStart = ({ dayNumber, onStartDay }: DayStartProps) => {
  return (
    <div className={s.dayStartContainer}>
      <div className={s.header}>
        <span className={s.headerTitle}>Day {dayNumber}</span>
      </div>
      <button className={s.button} onClick={onStartDay}>
        Start Day
      </button>
    </div>
  );
};
