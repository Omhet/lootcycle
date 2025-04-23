import { ScreenContainer } from "../../components/ScreenContainer/ScreenContainer";
import { Shop } from "../../components/Shop/Shop";
import { EquipmentFix, RecipeCategory, Upgrade } from "../../components/Shop/types";
import { useGameFlowStore } from "../../store/useGameFlowStore";
import { useMoneyStore } from "../../store/useMoneyStore";

export const ShopContainer = () => {
  const { nextDay } = useGameFlowStore();
  const { balance } = useMoneyStore();

  // Mock data for the shop based on correct types
  const mockRecipes: RecipeCategory[] = [
    {
      name: "Weapons",
      items: [
        {
          id: "sword",
          name: "Sword",
          price: 100,
          description: "A basic sword",
          imageUrl: "/assets/craftedLootItems/short_sword-1217d134.png",
          category: "Weapon",
          priceForCraftedBaseItem: 50,
          alreadyBought: false,
        },
        {
          id: "axe",
          name: "Axe",
          price: 150,
          description: "A sturdy axe",
          imageUrl: "/assets/craftedLootItems/short_sword-127f35ee.png",
          category: "Weapon",
          priceForCraftedBaseItem: 75,
          alreadyBought: false,
        },
      ],
    },
    {
      name: "Armor",
      items: [
        {
          id: "helmet",
          name: "Helmet",
          price: 80,
          description: "Basic protection",
          imageUrl: "/assets/craftedLootItems/short_sword-14f269f8.png",
          category: "Armor",
          priceForCraftedBaseItem: 40,
          alreadyBought: false,
        },
        {
          id: "shield",
          name: "Shield",
          price: 120,
          description: "Wooden shield",
          imageUrl: "/assets/craftedLootItems/short_sword-1b77cb7f.png",
          category: "Armor",
          priceForCraftedBaseItem: 60,
          alreadyBought: false,
        },
      ],
    },
  ];

  const mockUpgrades: Upgrade[] = [
    {
      id: "claw1",
      name: "Better Claw",
      price: 200,
      description: "Improves claw efficiency",
      imageUrl: "/assets/game/elements/claw.png",
    },
    {
      id: "cauldron1",
      name: "Better Cauldron",
      price: 250,
      description: "Improves melting speed",
      imageUrl: "/assets/game/elements/cauldron.png",
    },
  ];

  const mockEquipmentFixes: EquipmentFix[] = [
    {
      id: "fixClaw",
      name: "Fix Claw",
      price: 50,
      description: "Repair your claw",
      imageUrl: "/assets/game/elements/claw.png",
    },
    {
      id: "fixCauldron",
      name: "Fix Cauldron",
      price: 60,
      description: "Repair your cauldron",
      imageUrl: "/assets/game/elements/cauldron.png",
    },
    {
      id: "fixStove",
      name: "Fix Stove",
      price: 40,
      description: "Repair your stove",
      imageUrl: "/assets/game/elements/stove.png",
    },
  ];

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
      <Shop recipes={mockRecipes} upgrades={mockUpgrades} equipmentFixes={mockEquipmentFixes} balance={balance} onBuy={handleBuy} onClose={handleClose} />
    </ScreenContainer>
  );
};
