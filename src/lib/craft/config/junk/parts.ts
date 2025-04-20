import { PecipePartType, RecipeDetailType } from "../../craftModel";
import { registerRecipePart } from "../registry";

registerRecipePart(PecipePartType.LongBone, {
    id: "long_bone",
    type: PecipePartType.LongBone,
    name: "Long Bone",
    sockets: [
        {
            acceptType: RecipeDetailType.Gristle,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: RecipeDetailType.Bone,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: RecipeDetailType.Gristle,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: -0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
});
