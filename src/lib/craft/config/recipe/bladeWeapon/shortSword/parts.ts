// === Common Recipe Parts for all Short Swords ===

import { RecipeDetailType, RecipePartType } from "../../../../craftModel";
import { registerRecipePart } from "../../../registry";

registerRecipePart(RecipePartType.ShortSwordBlade, {
  id: "short_sword_blade",
  type: RecipePartType.ShortSwordBlade,
  name: "Short Sword Blade",
  sockets: [
    {
      acceptType: RecipeDetailType.ShortSwordBlade,
      pinpoint: {
        coords: { x: 0, y: 0 },
        zIndex: 0,
      },
    },
  ],
});
