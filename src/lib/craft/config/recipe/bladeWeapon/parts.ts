import { RecipeDetailType, RecipePartType } from "../../../craftModel";
import { registerRecipePart } from "../../registry";

// === Common Recipe Parts for all Blade weapons ===

registerRecipePart(RecipePartType.BladeWeaponHilt, {
  id: "blade_weapon_hilt",
  type: RecipePartType.BladeWeaponHilt,
  name: "Blade Hilt",
  sockets: [
    {
      acceptType: RecipeDetailType.Guard,
      pinpoint: {
        coords: { x: 0, y: -0.5 },
        localOffset: { x: 0, y: -0.5 },
        localRotationAngle: 0,
        zIndex: 1,
      },
    },
    {
      acceptType: RecipeDetailType.Grip,
      pinpoint: {
        coords: { x: 0, y: 0 },
        localOffset: { x: 0, y: 0 },
        localRotationAngle: 0,
        zIndex: 0,
      },
    },
    {
      acceptType: RecipeDetailType.Pommel,
      pinpoint: {
        coords: { x: 0, y: 0.5 },
        localOffset: { x: 0, y: 0.3 },
        localRotationAngle: 0,
        zIndex: 1,
      },
    },
  ],
});
