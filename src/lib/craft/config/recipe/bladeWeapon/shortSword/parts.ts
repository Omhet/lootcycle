// === Common Recipe Parts for all Short Swords ===

import { PecipePartType, RecipeDetailType } from "../../../../craftModel";
import { registerRecipePart } from "../../../registry";

registerRecipePart(PecipePartType.ShortSwordBlade, {
    id: "short_sword_blade",
    type: PecipePartType.ShortSwordBlade,
    name: "Short Sword Blade",
    sockets: [
        {
            acceptType: RecipeDetailType.ShortSwordBlade,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
});
