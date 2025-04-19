import {
    PecipePart,
    PecipePartType,
    RecipeDetailType,
} from "../../../craftModel";

// === Common Recipe Parts for all Short Swords ===

export const shortSwordBlade: PecipePart = {
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
};
