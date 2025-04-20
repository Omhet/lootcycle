import { PecipePartType, RecipeDetailType } from "../../craftModel.js";
import { registerRecipePart } from "../registry.js";

// === Common Recipe Parts for all Blade weapons ===

registerRecipePart(PecipePartType.BladeWeaponHilt, {
    id: "blade_weapon_hilt",
    type: PecipePartType.BladeWeaponHilt,
    name: "Blade Hilt",
    sockets: [
        {
            acceptType: RecipeDetailType.Guard,
            pinpoint: {
                coords: { x: 0, y: 0.5 },
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
                coords: { x: 0, y: -0.5 },
                localOffset: { x: 0, y: 0.5 },
                localRotationAngle: 0,
                zIndex: 1,
            },
        },
    ],
});
