import { RecipeDetailType } from "../../../craftModel";
import { registerLootDetail } from "../../registry";

// Blade details
registerLootDetail("tree_blade", {
  type: RecipeDetailType.ShortSwordBlade,
  canBeCraftedFrom: ["log"],
  name: "Tree Short Sword Blade",
});

registerLootDetail("silver_blade", {
  type: RecipeDetailType.ShortSwordBlade,
  canBeCraftedFrom: ["silver_coin", "silver_cup", "silver_ring", "silver_necklace"],
  name: "Silver Short Sword Blade",
});

registerLootDetail("basic_blade", {
  type: RecipeDetailType.ShortSwordBlade,
  canBeCraftedFrom: [],
  name: "Basic Short Sword Blade",
});

registerLootDetail("golden_blade", {
  type: RecipeDetailType.ShortSwordBlade,
  canBeCraftedFrom: ["golden_coin", "golden_cup", "golden_ring", "golden_necklace"],
  name: "Golden Short Sword Blade",
});

registerLootDetail("saw_blade", {
  type: RecipeDetailType.ShortSwordBlade,
  canBeCraftedFrom: ["saw"],
  name: "Saw Short Sword Blade",
});

// Guard details
registerLootDetail("horseshoe_guard", {
  type: RecipeDetailType.Guard,
  canBeCraftedFrom: ["horse_shoe"],
  name: "Horseshoe Short Sword Guard",
});

registerLootDetail("tree_guard", {
  type: RecipeDetailType.Guard,
  canBeCraftedFrom: ["log"],
  name: "Tree Short Sword Guard",
});

registerLootDetail("golden_guard", {
  type: RecipeDetailType.Guard,
  canBeCraftedFrom: ["golden_coin", "golden_cup", "golden_ring", "golden_necklace"],
  name: "Golden Short Sword Guard",
});

registerLootDetail("silver_guard", {
  type: RecipeDetailType.Guard,
  canBeCraftedFrom: ["silver_coin", "silver_cup", "silver_ring", "silver_necklace"],
  name: "Silver Short Sword Guard",
});

registerLootDetail("basic_guard", {
  type: RecipeDetailType.Guard,
  canBeCraftedFrom: [],
  name: "Basic Short Sword Guard",
});

// Grip details
registerLootDetail("tree_grip", {
  type: RecipeDetailType.Grip,
  canBeCraftedFrom: ["log"],
  name: "Tree Short Sword Grip",
});

registerLootDetail("rope_grip", {
  type: RecipeDetailType.Grip,
  canBeCraftedFrom: ["rope"],
  name: "Rope Short Sword Grip",
});

registerLootDetail("golden_grip", {
  type: RecipeDetailType.Grip,
  canBeCraftedFrom: ["golden_necklace"],
  name: "Golden Short Sword Grip",
});

registerLootDetail("silver_grip", {
  type: RecipeDetailType.Grip,
  canBeCraftedFrom: ["silver_necklace"],
  name: "Silver Short Sword Grip",
});

registerLootDetail("basic_grip", {
  type: RecipeDetailType.Grip,
  canBeCraftedFrom: [],
  name: "Basic Short Sword Grip",
});

// Pommel details
registerLootDetail("shell_pommel", {
  type: RecipeDetailType.Pommel,
  canBeCraftedFrom: ["shell"],
  name: "Shell Short Sword Pommel",
});

registerLootDetail("golden_pommel", {
  type: RecipeDetailType.Pommel,
  canBeCraftedFrom: ["golden_ring", "golden_cup", "golden_coin"],
  name: "Golden Short Sword Pommel",
});

registerLootDetail("silver_pommel", {
  type: RecipeDetailType.Pommel,
  canBeCraftedFrom: ["silver_cup", "silver_coin", "silver_ring"],
  name: "Silver Short Sword Pommel",
});

registerLootDetail("button_pommel", {
  type: RecipeDetailType.Pommel,
  canBeCraftedFrom: ["button"],
  name: "Button Short Sword Pommel",
});

registerLootDetail("lollipop_pommel", {
  type: RecipeDetailType.Pommel,
  canBeCraftedFrom: ["lollipop"],
  name: "Lollipop Short Sword Pommel",
});

registerLootDetail("nut_pommel", {
  type: RecipeDetailType.Pommel,
  canBeCraftedFrom: ["nut"],
  name: "Nut Short Sword Pommel",
});

registerLootDetail("tree_pommel", {
  type: RecipeDetailType.Pommel,
  canBeCraftedFrom: ["log"],
  name: "Tree Short Sword Pommel",
});

registerLootDetail("basic_pommel", {
  type: RecipeDetailType.Pommel,
  canBeCraftedFrom: [],
  name: "Basic Short Sword Pommel",
});
