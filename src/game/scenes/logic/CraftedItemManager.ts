import { Scene } from "phaser"; // Removed GameObjects import
import { LootItem } from "../../../lib/craft/craftModel";
import { CraftedItemRenderer } from "../../rendering/CraftedItemRenderer";
import { DepthLayers } from "../Game";

export class CraftedItemManager {
  private scene: Scene;
  private craftedItemRT: Phaser.GameObjects.RenderTexture; // The texture managed by this instance for display
  private craftedItem: LootItem | null = null;
  private renderer: CraftedItemRenderer; // Instance of the rendering service

  constructor(scene: Scene) {
    this.scene = scene;
    this.renderer = new CraftedItemRenderer(scene); // Instantiate the renderer
    this.initializeDisplay();
  }

  /**
   * Initializes the render texture for displaying crafted items in the scene
   */
  private initializeDisplay(): void {
    const rtWidth = 720;
    const rtHeight = 720;
    // Position the display RT (e.g., next to the cauldron or wherever needed in the Game scene)
    // Adjust these coordinates as needed for the Game scene layout
    const rtX = this.scene.cameras.main.width / 2; // Example position
    const rtY = this.scene.cameras.main.height / 2;

    this.craftedItemRT = this.scene.add.renderTexture(rtX, rtY, rtWidth, rtHeight);
    this.craftedItemRT.setOrigin(0.5, 0.5);
    this.craftedItemRT.setDepth(DepthLayers.UI); // Ensure it's visible above other game elements
    this.craftedItemRT.setVisible(false); // Initially hidden
    // No fill needed here if the renderer handles it, or set a debug background
    // this.craftedItemRT.fill(0xcccccc, 0.5); // Optional debug background
  }

  /**
   * Sets the item to be displayed and triggers rendering onto the managed RenderTexture.
   * @param item The LootItem to display.
   */
  public displayItem(item: LootItem): void {
    this.clearDisplay(); // Clear previous item first
    this.craftedItem = item;
    this.renderCraftedItem();
    this.craftedItemRT.setVisible(true); // Make the RT visible
  }

  /**
   * Uses the CraftedItemRenderer to draw the current item onto the managed RenderTexture.
   */
  private renderCraftedItem(): void {
    if (!this.craftedItem) return;

    // Delegate rendering to the service
    this.renderer.renderToTexture(this.craftedItem, this.craftedItemRT, true); // Pass the item and the target RT

    // Any additional logic specific to the *display* in the Game scene can go here
    // (e.g., triggering animations on the RT, scaling, etc.)
  }

  /**
   * Clears the current crafted item display by hiding the RenderTexture.
   */
  public clearDisplay(): void {
    this.craftedItemRT.setVisible(false);
    // Optionally clear the texture content if needed, though hiding is usually sufficient
    // this.craftedItemRT.clear();
    // this.craftedItemRT.fill(0x000000, 0);
    this.craftedItem = null;
  }

  /**
   * Cleans up resources used by the manager, specifically the display RenderTexture.
   */
  public destroy(): void {
    if (this.craftedItemRT) {
      this.craftedItemRT.destroy(); // Destroy the display RT
    }
    this.craftedItem = null;
  }
}
