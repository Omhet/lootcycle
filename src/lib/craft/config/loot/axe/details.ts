import { RecipeDetailType } from "../../../craftModel";
import { registerLootDetail } from "../../registry";

// Handle details
registerLootDetail("tree_handle", {
  type: RecipeDetailType.AxeHandle,
  canBeCraftedFrom: ["log"],
  name: "Tree Axe Handle",
});

registerLootDetail("robo_hand_handle", {
  type: RecipeDetailType.AxeHandle,
  canBeCraftedFrom: ["robo_hand"],
  name: "Robo Hand Axe Handle",
});

registerLootDetail("deer_leg_handle", {
  type: RecipeDetailType.AxeHandle,
  canBeCraftedFrom: ["deer_hoof"],
  name: "Deer Leg Axe Handle",
});

registerLootDetail("bone_handle", {
  type: RecipeDetailType.AxeHandle,
  canBeCraftedFrom: ["bone"],
  name: "Bone Axe Handle",
});

registerLootDetail("rope_handle", {
  type: RecipeDetailType.AxeHandle,
  canBeCraftedFrom: ["rope"],
  name: "Rope Axe Handle",
});

registerLootDetail("basic_handle", {
  type: RecipeDetailType.AxeHandle,
  canBeCraftedFrom: [],
  name: "Basic Axe Handle",
});

registerLootDetail("silver_handle", {
  type: RecipeDetailType.AxeHandle,
  canBeCraftedFrom: ["silver_coin", "silver_cup", "silver_necklace"],
  name: "Silver Axe Handle",
});

registerLootDetail("golden_handle", {
  type: RecipeDetailType.AxeHandle,
  canBeCraftedFrom: ["golden_coin", "golden_cup", "golden_necklace"],
  name: "Golden Axe Handle",
});

// Head details
registerLootDetail("tree_head", {
  type: RecipeDetailType.AxeHead,
  canBeCraftedFrom: ["log"],
  name: "Tree Axe Head",
});

registerLootDetail("silver_head", {
  type: RecipeDetailType.AxeHead,
  canBeCraftedFrom: ["silver_coin", "silver_cup", "silver_necklace"],
  name: "Silver Axe Head",
});

registerLootDetail("basic_head", {
  type: RecipeDetailType.AxeHead,
  canBeCraftedFrom: [],
  name: "Basic Axe Head",
});

registerLootDetail("golden_head", {
  type: RecipeDetailType.AxeHead,
  canBeCraftedFrom: ["golden_coin", "golden_cup", "golden_necklace"],
  name: "Golden Axe Head",
});

registerLootDetail("shell_head", {
  type: RecipeDetailType.AxeHead,
  canBeCraftedFrom: ["shell"],
  name: "Shell Axe Head",
});
