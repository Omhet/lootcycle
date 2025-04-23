import { Stall } from "../../components/Stall/Stall";
import { useScreenStore } from "../../store/useScreenStore";

// Mock data for the Stall component
const mockStallData = {
  groups: [
    {
      name: "Weapons",
      items: [
        {
          id: "sw1",
          name: "Short Sword",
          category: "One-handed Blade",
          imageUrl: "/assets/game/details/loot-details-sprites.png",
          price: 50,
          lootDetails: [
            {
              lootDetailName: "Sharp Blade",
              junkImageUrl: "/assets/game/details/junk-details-sprites.png",
            },
            {
              lootDetailName: "Steel Hilt",
              junkImageUrl: "/assets/game/details/junk-details-sprites.png",
            },
          ],
        },
        {
          id: "dg1",
          name: "Dagger",
          category: "Knife",
          imageUrl: "/assets/game/details/loot-details-sprites.png",
          price: 30,
          lootDetails: [
            {
              lootDetailName: "Sharp Point",
              junkImageUrl: "/assets/game/details/junk-details-sprites.png",
            },
          ],
        },
      ],
    },
    {
      name: "Armor",
      items: [
        {
          id: "sh1",
          name: "Wooden Shield",
          category: "Shield",
          imageUrl: "/assets/game/details/loot-details-sprites.png",
          price: 25,
          lootDetails: [
            {
              lootDetailName: "Sturdy Wood",
              junkImageUrl: "/assets/game/details/junk-details-sprites.png",
            },
          ],
        },
      ],
    },
  ],
};

export const StallScreenContainer = () => {
  const closeScreen = useScreenStore((state) => state.closeScreen);

  const handleSellAndClose = () => {
    // Here you would handle the selling logic
    console.log(
      "Selling all items for",
      mockStallData.groups.reduce((total, group) => total + group.items.reduce((groupTotal, item) => groupTotal + item.price, 0), 0)
    );

    // Close the screen after selling
    closeScreen();
  };

  return <Stall groups={mockStallData.groups} onSellAndClose={handleSellAndClose} />;
};
