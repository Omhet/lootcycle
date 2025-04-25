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
   * Uses the CraftedItemRenderer to draw the current item onto the managed RenderTexture,
   * with parts appearing one by one with random delays and sound effects.
   */
  private renderCraftedItem(): void {
    if (!this.craftedItem) return;

    // Clear any existing render texture content
    this.craftedItemRT.clear();

    // Get the details to draw from the renderer, but don't draw them yet
    const detailsToDraw = this.renderer.prepareItemForRendering(this.craftedItem);

    if (detailsToDraw.length === 0) {
      console.warn("No details to render for the crafted item");
      return;
    }

    // Sort by zIndex for proper layering
    detailsToDraw.sort((a, b) => a.zIndex - b.zIndex);

    // Calculate center of the render texture for positioning
    const centerX = this.craftedItemRT.width / 2;
    const centerY = this.craftedItemRT.height / 2;

    // Set up timers to add each part with a random delay
    let currentIndex = 0;
    const partAppearSound = this.scene.sound.add("part_appear");
    const completionSound = this.scene.sound.add("crafted_loot_item");

    // Function to add the next part
    const addNextPart = () => {
      if (currentIndex >= detailsToDraw.length) return;

      const detailInfo = detailsToDraw[currentIndex];

      // Draw the part onto the render texture
      this.craftedItemRT.draw(detailInfo.sprite, centerX, centerY);

      // Play appropriate sound effect when part appears with randomized properties
      const isLastPart = currentIndex === detailsToDraw.length - 1;
      if (isLastPart) {
        // Play completion sound for the final part with slight randomization
        const randomVolume = Phaser.Math.FloatBetween(0.55, 0.65);
        const randomRate = Phaser.Math.FloatBetween(0.95, 1.05);
        completionSound.play({
          volume: randomVolume,
          rate: randomRate,
        });
      } else {
        // Play normal part appear sound for all other parts with slight randomization
        const randomVolume = Phaser.Math.FloatBetween(0.55, 0.65);
        const randomRate = Phaser.Math.FloatBetween(0.98, 1.02);
        partAppearSound.play({
          volume: randomVolume,
          rate: randomRate,
        });
      }

      // Clean up the temporary sprite
      detailInfo.sprite.destroy();

      currentIndex++;

      // Schedule the next part if there are more
      if (currentIndex < detailsToDraw.length) {
        const randomDelay = Phaser.Math.Between(300, 500);
        this.scene.time.delayedCall(randomDelay, addNextPart);
      }
    };

    // Start the sequence with an initial random delay for the first part too
    const initialRandomDelay = Phaser.Math.Between(500, 800);
    this.scene.time.delayedCall(initialRandomDelay, addNextPart);
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
