import { DayResults } from "../../components/DayResults/DayResults";
import { ScreenContainer } from "../../components/ScreenContainer/ScreenContainer";
import { useGameFlowStore } from "../../store/useGameFlowStore";

export const DayEndContainer = () => {
  const { currentDay, goToShop } = useGameFlowStore();

  // Mock data for now
  const mockDayResults = {
    balance: 500,
    junkRecycled: 25,
    junkBurnt: 3,
    lootCrafted: 8,
    lootScrewedUp: 2,
    profit: 350,
    clawWearout: 15,
    cauldronWearout: 20,
    stoveWearout: 10,
  };

  const handleClose = () => {
    goToShop();
  };

  return (
    <ScreenContainer>
      <DayResults
        dayNumber={currentDay}
        balance={mockDayResults.balance}
        junkRecycled={mockDayResults.junkRecycled}
        junkBurnt={mockDayResults.junkBurnt}
        lootCrafted={mockDayResults.lootCrafted}
        lootScrewedUp={mockDayResults.lootScrewedUp}
        profit={mockDayResults.profit}
        clawWearout={mockDayResults.clawWearout}
        cauldronWearout={mockDayResults.cauldronWearout}
        stoveWearout={mockDayResults.stoveWearout}
        onClose={handleClose}
      />
    </ScreenContainer>
  );
};
