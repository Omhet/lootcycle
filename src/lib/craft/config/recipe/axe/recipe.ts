// === Recipe Item for Sword ===

import { ItemSubCategoryId, RecipeDetailType, RecipeItemType, RecipePartType } from "../../../craftModel";
import { registerRecipeItem, registerRecipePart } from "../../registry";

registerRecipeItem(RecipeItemType.Axe, {
  id: "axe",
  subCategory: ItemSubCategoryId.MeleeWeapon,
  type: RecipeItemType.Axe,
  name: "Axe",
  sockets: [
    {
      acceptType: RecipePartType.AxeHandle,
      relativeWeight: 6,
      pinpoint: {
        zIndex: 0,
      },
    },
    {
      acceptType: RecipePartType.AxeHead,
      relativeWeight: 4,
      pinpoint: {
        zIndex: 1,
      },
    },
  ],
  baseSellPrice: 30,
  perfectTemperature: 500,
  baseTemperatureOffset: 200,
});

registerRecipePart(RecipePartType.AxeHandle, {
  id: "axe_handle",
  type: RecipePartType.AxeHandle,
  name: "Axe Handle",
  sockets: [
    {
      acceptType: RecipeDetailType.AxeHandle,
      pinpoint: {
        zIndex: 0,
      },
    },
  ],
});

registerRecipePart(RecipePartType.AxeHead, {
  id: "axe_head",
  type: RecipePartType.AxeHead,
  name: "Axe Head",
  sockets: [
    {
      acceptType: RecipeDetailType.AxeHead,
      pinpoint: {
        zIndex: 0,
      },
    },
  ],
});
