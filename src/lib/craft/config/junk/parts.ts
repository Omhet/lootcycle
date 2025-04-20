import { JunkDetailType, JunkPartType } from "../../craftModel";
import { registerJunkPart } from "../registry";

registerJunkPart(JunkPartType.LongBone, {
    id: "long_bone",
    type: JunkPartType.LongBone,
    name: "Long Bone",
    sockets: [
        {
            acceptType: JunkDetailType.Gristle,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: JunkDetailType.Bone,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: 0 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
        {
            acceptType: JunkDetailType.Gristle,
            pinpoint: {
                coords: { x: 0, y: 0 },
                localOffset: { x: 0, y: -0.5 },
                localRotationAngle: 0,
                zIndex: 0,
            },
        },
    ],
});
