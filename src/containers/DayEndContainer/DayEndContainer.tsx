import { DayResults } from "../../components/DayResults/DayResults";
import { ScreenContainer } from "../../components/ScreenContainer/ScreenContainer";
import { useGameFlowStore } from "../../store/useGameFlowStore";
import { useMoneyStore } from "../../store/useMoneyStore";
import { useStatisticsStore } from "../../store/useStatisticsStore";

export const DayEndContainer = () => {
  const { currentDay, goToShop } = useGameFlowStore();
  const { balance } = useMoneyStore();
  const { getDayStatistics } = useStatisticsStore();

  // Get the current day's statistics
  const dayStats = getDayStatistics(currentDay);

  const handleClose = () => {
    goToShop();
  };

  return (
    <ScreenContainer>
      <DayResults
        dayNumber={currentDay}
        balance={balance}
        junkRecycled={dayStats.junkRecycled}
        junkBurnt={dayStats.junkBurnt}
        lootCrafted={dayStats.lootCrafted}
        lootScrewedUp={dayStats.lootScrewedUp}
        profit={dayStats.profit}
        onClose={handleClose}
      />
    </ScreenContainer>
  );
};
