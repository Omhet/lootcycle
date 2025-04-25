import { describe, expect, it } from "vitest";
import { lootConfig } from "../config";
import { craftLootItem } from "../craftLootItem";
import { Durability, JunkPiece, Rarity, RecipeDetailType } from "../craftModel";

describe("craftLootItem", () => {
  it("distributes identical junk pieces to different details when possible", () => {
    // Create two golden cups for testing
    const junkPieces: JunkPiece[] = [
      {
        id: "golden_cup",
        name: "Golden Cup",
        rarity: Rarity.Rare,
        durability: Durability.Medium,
        sellPriceCoefficient: 3.5,
        temperatureCoefficient: 2.5,
        suitableForRecipeDetails: [RecipeDetailType.AxeHandle, RecipeDetailType.AxeHead],
      },
      {
        id: "golden_cup",
        name: "Golden Cup",
        rarity: Rarity.Rare,
        durability: Durability.Medium,
        sellPriceCoefficient: 3.5,
        temperatureCoefficient: 2.5,
        suitableForRecipeDetails: [RecipeDetailType.AxeHandle, RecipeDetailType.AxeHead],
      },
    ];

    const result = craftLootItem({
      recipeItemId: "axe",
      junkPieces,
      config: lootConfig,
    });

    // Verify that the crafted item has both a golden handle and a golden head
    // by examining the detailToJunkMap (maps detail IDs to junk IDs)
    const junkIdsUsed = Object.values(result.detailToJunkMap);

    // Both golden cups should be used
    expect(junkIdsUsed.filter((id) => id === "golden_cup")).toHaveLength(2);

    // We should have both golden handle and golden head
    const detailIds = result.details;
    expect(detailIds).toContain("golden_handle");
    expect(detailIds).toContain("golden_head");
  });

  it("handles mixed junk types correctly", () => {
    // One golden cup and one silver cup
    const junkPieces: JunkPiece[] = [
      {
        id: "golden_cup",
        name: "Golden Cup",
        rarity: Rarity.Rare,
        durability: Durability.Medium,
        sellPriceCoefficient: 3.5,
        temperatureCoefficient: 2.5,
        suitableForRecipeDetails: [RecipeDetailType.AxeHandle, RecipeDetailType.AxeHead],
      },
      {
        id: "silver_cup",
        name: "Silver Cup",
        rarity: Rarity.Uncommon,
        durability: Durability.Medium,
        sellPriceCoefficient: 2.8,
        temperatureCoefficient: 2.3,
        suitableForRecipeDetails: [RecipeDetailType.AxeHandle, RecipeDetailType.AxeHead],
      },
    ];

    const result = craftLootItem({
      recipeItemId: "axe",
      junkPieces,
      config: lootConfig,
    });

    // Verify both cups were used
    const junkIdsUsed = Object.values(result.detailToJunkMap);
    expect(junkIdsUsed).toContain("golden_cup");
    expect(junkIdsUsed).toContain("silver_cup");

    // Should have one gold and one silver detail
    const detailIds = result.details;
    expect(detailIds.filter((id) => id.includes("golden_"))).toHaveLength(1);
    expect(detailIds.filter((id) => id.includes("silver_"))).toHaveLength(1);
  });

  it("handles insufficient junk gracefully", () => {
    // Only one junk piece for two required details
    const junkPieces: JunkPiece[] = [
      {
        id: "golden_cup",
        name: "Golden Cup",
        rarity: Rarity.Rare,
        durability: Durability.Medium,
        sellPriceCoefficient: 3.5,
        temperatureCoefficient: 2.5,
        suitableForRecipeDetails: [RecipeDetailType.AxeHandle, RecipeDetailType.AxeHead],
      },
    ];

    const result = craftLootItem({
      recipeItemId: "axe",
      junkPieces,
      config: lootConfig,
    });

    // Should have used the golden cup for one detail
    const junkIdsUsed = Object.values(result.detailToJunkMap);
    expect(junkIdsUsed.filter((id) => id === "golden_cup")).toHaveLength(1);

    // Should have one golden detail and one basic detail
    const detailIds = result.details;
    expect(detailIds.filter((id) => id.includes("golden_"))).toHaveLength(1);
    expect(detailIds.filter((id) => id.includes("basic_"))).toHaveLength(1);
  });

  it("prioritizes distributing identical junk across different detail types", () => {
    // Create multiple mixed junk pieces
    const junkPieces: JunkPiece[] = [
      // Two golden cups
      {
        id: "golden_cup",
        name: "Golden Cup",
        rarity: Rarity.Rare,
        durability: Durability.Medium,
        sellPriceCoefficient: 3.5,
        temperatureCoefficient: 2.5,
        suitableForRecipeDetails: [RecipeDetailType.AxeHandle, RecipeDetailType.AxeHead],
      },
      {
        id: "golden_cup",
        name: "Golden Cup",
        rarity: Rarity.Rare,
        durability: Durability.Medium,
        sellPriceCoefficient: 3.5,
        temperatureCoefficient: 2.5,
        suitableForRecipeDetails: [RecipeDetailType.AxeHandle, RecipeDetailType.AxeHead],
      },
      // One silver cup
      {
        id: "silver_cup",
        name: "Silver Cup",
        rarity: Rarity.Uncommon,
        durability: Durability.Medium,
        sellPriceCoefficient: 2.8,
        temperatureCoefficient: 2.3,
        suitableForRecipeDetails: [RecipeDetailType.AxeHandle, RecipeDetailType.AxeHead],
      },
    ];

    const result = craftLootItem({
      recipeItemId: "axe",
      junkPieces,
      config: lootConfig,
    });

    // Should have used one golden cup for each detail instead of using one golden + one silver
    const detailIds = result.details;
    expect(detailIds).toContain("golden_handle");
    expect(detailIds).toContain("golden_head");

    // Silver cup should not be used as we have enough golden cups for both details
    const junkIdsUsed = Object.values(result.detailToJunkMap);
    expect(junkIdsUsed.filter((id) => id === "golden_cup")).toHaveLength(2);
    expect(junkIdsUsed.filter((id) => id === "silver_cup")).toHaveLength(0);
  });
});
