import { GameObjects, Scene } from "phaser";

import { lootConfig } from "../../lib/craft/config";
import { EventBus } from "../EventBus";
import { RecipeImageDownloader } from "../rendering/RecipeImageDownloader";

export class MainMenu extends Scene {
  container: GameObjects.Container;
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;
  private recipeImageDownloader: RecipeImageDownloader;

  constructor() {
    super("MainMenu");
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.container = this.add.container(centerX, centerY);
    this.recipeImageDownloader = new RecipeImageDownloader(this);

    EventBus.emit("current-scene-ready", this);

    // Temporary start game right away to debug - REMOVE THIS LATER
    this.startGame();

    console.log({ lootConfig });
  }

  startGame() {
    this.scene.start("Game");
  }

  /**
   * Public method to trigger recipe image downloads
   * Delegates to the dedicated RecipeImageDownloader service
   */
  public async downloadRecipeImages(): Promise<void> {
    await this.recipeImageDownloader.downloadRecipeImages();
  }

  // --- Scene Shutdown ---
  shutdown() {
    // Clean up any resources if needed
  }
}
