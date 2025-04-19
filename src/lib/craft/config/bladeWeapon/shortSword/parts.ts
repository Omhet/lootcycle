import { PecipePartType, RecipeDetailType } from "../../../craftModel.js";
import { registerRecipePart } from "../../registry.js";

// === Common Recipe Parts for all Short Swords ===

// Register short sword blade part
registerRecipePart(PecipePartType.ShortSwordBlade, {
    id: "short_sword_blade",
    type: PecipePartType.ShortSwordBlade,
    name: "Short Sword Blade",
    sockets: [
        {
            acceptType: RecipeDetailType.ShortSwordBlade,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
});
