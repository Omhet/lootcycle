import { GameObjects, Scene } from "phaser"; // Removed Textures import
import { lootConfig } from "../../lib/craft/config";
import { LootItem, RecipeItem } from "../../lib/craft/craftModel";

/**
 * Service responsible for rendering a crafted item onto a RenderTexture.
 * It handles layers positioning, and drawing logic,
 * independent of how or where the final texture is displayed.
 */
export class CraftedItemRenderer {
    private scene: Scene;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    // --- Public Rendering Method ---

    /**
     * Renders a given LootItem onto the provided RenderTexture.
     * @param item The LootItem to render.
     * @param targetRT The RenderTexture to draw onto.
     * @param clearTexture Should the texture be cleared before drawing? Defaults to true.
     */
    public renderItemToTexture(
        item: LootItem,
        targetRT: GameObjects.RenderTexture,
        clearTexture: boolean = true
    ): void {
        const recipeItem = this.findRecipeItem(item.recipeId);
        if (!recipeItem) {
            console.error(`RecipeItem not found for id: ${item.recipeId}`);
            return;
        }

        // TODO: Implement rendering according to new simple system of layers
    }

    // --- Internal Logic ---

    private findRecipeItem(recipeId: string): RecipeItem | undefined {
        return Object.values(lootConfig.recipeItems)
            .flat()
            .find((item) => item.id === recipeId);
    }
}
