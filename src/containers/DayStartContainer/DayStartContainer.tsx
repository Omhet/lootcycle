import { DayStart } from "../../components/DayStart/DayStart";
import { ScreenContainer } from "../../components/ScreenContainer/ScreenContainer";
import { useGameFlowStore } from "../../store/useGameFlowStore";

export const DayStartContainer = () => {
  const { currentDay, startDay } = useGameFlowStore();

  const handleStartDay = () => {
    startDay();
  };

  return (
    <ScreenContainer>
      <DayStart dayNumber={currentDay} onStartDay={handleStartDay} />
    </ScreenContainer>
  );
};
