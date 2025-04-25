import s from "./DayResults.module.css";

type DayResultsProps = {
  dayNumber: number;
  balance: number;
  junkRecycled: number;
  junkBurnt: number;
  junkReceived: number;
  lootCrafted: number;
  lootScrewedUp: number;
  profit: number;
  junkLeft: number;
  onClose: () => void;
};

export const DayResults = ({
  dayNumber,
  balance,
  junkRecycled,
  junkBurnt,
  junkReceived,
  lootCrafted,
  lootScrewedUp,
  profit,
  junkLeft,
  onClose,
}: DayResultsProps) => {
  return (
    <div className={s.background}>
      <div className={s.dayResultsContainer}>
        <div className={s.header}>
          <div className={s.headerContent}>
            <span className={s.headerTitle}>Day {dayNumber} went amazing!</span>
          </div>
          <div className={s.moneyBalance}>
            <span className={s.moneyBalanceValue}>{balance}</span>
            <img className={s.coinImage} src="/assets/junk/golden_coin.png" />
          </div>
        </div>
        <div className={s.stats}>
          <span>Junk received: {junkReceived} items</span>
          <span>Profit: {profit} gold</span>
          <span>Junk recycled: {junkRecycled} items</span>
          <span>Loot crafted: {lootCrafted} items</span>
          <span>Junk burnt: {junkBurnt} items</span>
          <span>Loot screwed up: {lootScrewedUp} items</span>
          <span>Junk left: {junkLeft} items</span>
        </div>
        <button className={s.button} onClick={onClose}>
          Great!
        </button>
      </div>
    </div>
  );
};
