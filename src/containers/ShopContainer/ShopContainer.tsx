import { ScreenContainer } from "../../components/ScreenContainer/ScreenContainer";
import { Shop } from "../../components/Shop/Shop";
import { useGameFlowStore } from "../../store/useGameFlowStore";
import { useMoneyStore } from "../../store/useMoneyStore";

export const ShopContainer = () => {
  const { nextDay } = useGameFlowStore();
  const { balance } = useMoneyStore();

  const handleBuy = (purchaseItemId: string) => {
    // In the future, handle actual purchase logic here
    console.log(`Purchased item: ${purchaseItemId}`);
  };

  const handleClose = () => {
    // Move to the next day
    nextDay();
  };

  return (
    <ScreenContainer>
      <Shop balance={balance} onBuy={handleBuy} onClose={handleClose} />
    </ScreenContainer>
  );
};
