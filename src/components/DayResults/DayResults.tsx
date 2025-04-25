import s from "./DayResults.module.css";

type DayResultsProps = {
  dayNumber: number;
  balance: number;
  junkRecycled: number;
  junkBurnt: number;
  lootCrafted: number;
  lootScrewedUp: number;
  profit: number;
  onClose: () => void;
};

export const DayResults = ({ dayNumber, balance, junkRecycled, junkBurnt, lootCrafted, lootScrewedUp, profit, onClose }: DayResultsProps) => {
  return (
    <div className={s.dayResultsContainer}>
      <div className={s.header}>
        <div className={s.headerContent}>
          <span className={s.headerTitle}>Another excellent day!</span>
          <span className={s.headerTitle}>day {dayNumber}</span>
        </div>
        <div>
          <span>Balance: {balance}</span>
        </div>
      </div>
      <div className={s.stats}>
        <span>Junk recycled: {junkRecycled} items</span>
        <span>Profit: {profit} gold</span>
        <span>Junk burnt: {junkBurnt} items</span>
        <span>Loot crafted: {lootCrafted} items</span>
        <span>Loot screwed up: {lootScrewedUp} items</span>
      </div>
      <button className={s.button} onClick={onClose}>
        Great!
      </button>
    </div>
  );
};
