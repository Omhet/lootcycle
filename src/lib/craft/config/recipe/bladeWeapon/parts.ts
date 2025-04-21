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
                zIndex: 1,
            },
        },
        {
            acceptType: RecipeDetailType.Grip,
            pinpoint: {
                zIndex: 0,
            },
        },
        {
            acceptType: RecipeDetailType.Pommel,
            pinpoint: {
                zIndex: 1,
            },
        },
    ],
});
