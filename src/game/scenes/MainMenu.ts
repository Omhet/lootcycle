import { GameObjects, Scene } from "phaser";

import { lootConfig } from "../../lib/craft/config";
import { EventBus } from "../EventBus";
import { JunkImageDownloader } from "../rendering/JunkImageDownloader";
import { RecipeImageDownloader } from "../rendering/RecipeImageDownloader";

export class MainMenu extends Scene {
  container: GameObjects.Container;
  background: GameObjects.Image;
  logo: GameObjects.Image;
  title: GameObjects.Text;
  private recipeImageDownloader: RecipeImageDownloader;
  private junkImageDownloader: JunkImageDownloader;

  constructor() {
    super("MainMenu");
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.container = this.add.container(centerX, centerY);
    this.recipeImageDownloader = new RecipeImageDownloader(this);
    this.junkImageDownloader = new JunkImageDownloader(this);

    EventBus.emit("current-scene-ready", this);

    // Temporary start game right away to debug - REMOVE THIS LATER
    // this.startGame();

    console.log({ lootConfig });
  }

  changeScene(sceneName: string = "Idle") {
    console.log(`MainMenu: Changing scene to ${sceneName}`);
    this.scene.start(sceneName);
  }

  /**
   * Public method to trigger recipe image downloads
   * Delegates to the dedicated RecipeImageDownloader service
   */
  public async downloadRecipeImages(): Promise<void> {
    await this.recipeImageDownloader.downloadImages();
  }

  /**
   * Public method to trigger junk image downloads
   * Delegates to the dedicated JunkImageDownloader service
   */
  public async downloadJunkImages(): Promise<void> {
    await this.junkImageDownloader.downloadImages();
  }
}
