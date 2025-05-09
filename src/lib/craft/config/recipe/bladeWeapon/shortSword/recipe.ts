import { ItemSubCategoryId, RecipeItemType, RecipePartType } from "../../../../craftModel";
import { registerRecipeItem } from "../../../registry";

// === Recipe Item for Sword ===

registerRecipeItem(RecipeItemType.BladeWeapon, {
  id: "short_sword",
  subCategory: ItemSubCategoryId.MeleeWeapon,
  type: RecipeItemType.BladeWeapon,
  name: "Short Sword",
  sockets: [
    {
      acceptType: RecipePartType.ShortSwordBlade,
      relativeWeight: 6,
      pinpoint: {
        zIndex: 0,
      },
    },
    {
      acceptType: RecipePartType.BladeWeaponHilt,
      relativeWeight: 4,
      pinpoint: {
        zIndex: 1,
      },
    },
  ],
  baseSellPrice: 50,
  perfectTemperature: 500,
  baseTemperatureOffset: 200,
});
