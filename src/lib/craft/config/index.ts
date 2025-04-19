import {
    LootConfig,
    PecipePartType,
    RecipeDetailType,
    RecipeItemType,
} from "../craftModel.js";
import { bladeWeaponHilt } from "./bladeWeapon/parts.js";
import {
    basicShortSwordBladeDetail,
    basicShortSwordGrip,
    basicShortSwordGuard,
    basicShortSwordPommel,
} from "./bladeWeapon/shortSword/basicShortSwordDetails.js";
import { shortSwordBlade } from "./bladeWeapon/shortSword/parts.js";
import { shortSwordRecipe } from "./bladeWeapon/shortSword/recipe.js";

// Assemble the final LootConfig object
export const lootConfig: LootConfig = {
    recipeItems: {
        [RecipeItemType.BladeWeapon]: [shortSwordRecipe],
    },
    recipeParts: {
        [PecipePartType.BladeWeaponHilt]: [bladeWeaponHilt],
        [PecipePartType.ShortSwordBlade]: [shortSwordBlade],
    },
    recipeDetailVariants: {
        [RecipeDetailType.Pommel]: [basicShortSwordPommel],
        [RecipeDetailType.Grip]: [basicShortSwordGrip],
        [RecipeDetailType.Guard]: [basicShortSwordGuard],
        [RecipeDetailType.ShortSwordBlade]: [basicShortSwordBladeDetail],
    },
};
