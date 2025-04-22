import { RecipeDetailType } from "../../../craftModel";
import { registerLootDetail } from "../../registry";

registerLootDetail("curved_silver_short_sword_blade", {
  type: RecipeDetailType.ShortSwordBlade,
  canBeCraftedFrom: ["curved_silver_short_sword_blade", "silver_ore"],
  name: "Curved Silver Short Sword Blade",
});

registerLootDetail("tree_short_sword_grip", {
  type: RecipeDetailType.Grip,
  canBeCraftedFrom: ["tree"],
  name: "Tree Short Sword Grip",
});

registerLootDetail("golden_short_sword_guard", {
  type: RecipeDetailType.Guard,
  canBeCraftedFrom: ["gold_ore"],
  name: "Golden Short Sword Guard",
});

registerLootDetail("golden_with_emerald_short_sword_pommel", {
  type: RecipeDetailType.Pommel,
  canBeCraftedFrom: ["golden_with_emerald_pommel"],
  name: "Golden With Emerald Short Sword Pommel",
});

registerLootDetail("basic_short_sword_blade", {
  type: RecipeDetailType.ShortSwordBlade,
  canBeCraftedFrom: ["all"],
  name: "Basic Short Sword Blade",
});

registerLootDetail("basic_short_sword_grip", {
  type: RecipeDetailType.Grip,
  canBeCraftedFrom: ["all"],
  name: "Basic Short Sword Grip",
});

registerLootDetail("basic_short_sword_pommel", {
  type: RecipeDetailType.Pommel,
  canBeCraftedFrom: ["all"],
  name: "Basic Short Sword Pommel",
});

registerLootDetail("basic_short_sword_guard", {
  type: RecipeDetailType.Guard,
  canBeCraftedFrom: ["all"],
  name: "Basic Short Sword Guard",
});
