import { Scene } from "phaser";
import { EventBus } from "../../EventBus";

/**
 * Manages all input handling for the Game scene
 * Encapsulates keyboard, mouse, and other input events
 */
export class InputManager {
  private scene: Scene;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyListeners: { key: string; callback: () => void }[] = [];
  private keyA: Phaser.Input.Keyboard.Key | undefined;
  private keyD: Phaser.Input.Keyboard.Key | undefined;

  // Track crafting state
  private isCraftingInProgress: boolean = false;

  constructor(scene: Scene) {
    this.scene = scene;
    this.cursors = this.scene.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;

    // Create A and D key objects for movement
    this.keyA = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.setupInputListeners();

    // Listen for cooking events to track state
    EventBus.on("cooking-started", this.handleCookingStarted, this);
    EventBus.on("cooking-stopped", this.handleCookingStopped, this);
  }

  /**
   * Handles cooking started event
   */
  private handleCookingStarted(): void {
    this.isCraftingInProgress = true;
  }

  /**
   * Handles cooking stopped event
   */
  private handleCookingStopped(): void {
    this.isCraftingInProgress = false;
  }

  /**
   * Sets up keyboard listeners for game controls
   */
  private setupInputListeners(): void {
    // Setup all key listeners
    this.addKeyListener("ENTER", () => {
      // Get the cauldronManager from the scene registry
      const cauldronManager = this.scene.registry.get("cauldronManager");
      // Get the junkPileManager from the scene registry
      const junkPileManager = this.scene.registry.get("junkPileManager");

      if (!cauldronManager) {
        console.error("CauldronManager not found in registry");
        return;
      }

      // Check if there's enough junk for crafting
      if (!cauldronManager.hasEnoughJunkForCrafting()) {
        // Not enough junk - notify player
        EventBus.emit("crafting-failure", {
          reason: "NotEnoughJunk",
          message: "Not enough materials in cauldron",
        });
        return;
      }

      if (this.isCraftingInProgress) {
        // ENTER pressed while crafting - finish crafting
        this.finishCrafting(cauldronManager);
      } else {
        // ENTER pressed when not crafting - start crafting
        this.startCrafting(cauldronManager, junkPileManager);
      }
    });

    this.addKeyListener("SPACE", () => {
      // Emit event to toggle claw
      EventBus.emit("toggle-claw");
    });

    this.addKeyListener("I", () => {
      // Emit event to toggle the Stall screen
      EventBus.emit("toggle-screen", "stall");
    });

    this.addKeyListener("ESC", () => {
      // Emit event to close any open screen
      EventBus.emit("close-screen");
    });
  }

  /**
   * Starts the crafting process
   */
  private startCrafting(cauldronManager: any, junkPileManager: any): void {
    if (!cauldronManager || this.isCraftingInProgress) return;

    // Get junk pieces currently in the cauldron
    const junkItemsInCauldron = cauldronManager.getJunkPiecesInside();
    const junkPieces = junkItemsInCauldron.map((item: any) => item.junkPiece);

    // Emit event to calculate temperature range for junk pieces
    EventBus.emit("calculate-temperature-range", junkPieces);

    // Start cooking with temperature range (this will be set by Game.ts)
    cauldronManager.startCooking();

    // Generate next portion for when crafting is done
    if (junkPileManager) {
      junkPileManager.generateNextPortion();
    }
  }

  /**
   * Finishes the crafting process
   */
  private finishCrafting(cauldronManager: any): void {
    if (!cauldronManager) return;

    // Stop cooking and get final temperature
    const finalTemperature = cauldronManager.stopCooking();

    // Check if the temperature is high enough for crafting
    const temperatureRange = cauldronManager.getTemperatureRange();
    const isTemperatureValid = temperatureRange && finalTemperature >= temperatureRange.min;

    // Emit event to notify scene to craft item with final temperature
    EventBus.emit("craft-item", finalTemperature);

    // Only destroy junk pieces if temperature was high enough
    if (isTemperatureValid) {
      // Destroy junk pieces in cauldron
      cauldronManager.destroyJunkPieces();
    }
  }

  /**
   * Adds a key listener with the specified callback
   */
  private addKeyListener(key: string, callback: () => void): void {
    this.scene.input.keyboard?.on(`keydown-${key}`, callback);

    // Store reference to listener for cleanup
    this.keyListeners.push({ key, callback });
  }

  /**
   * Updates input state - should be called from scene's update method
   */
  public update(): void {
    // Handle cursor key input for claw movement
    let horizontalMovement = 0;

    // Check both cursor keys and A/D keys
    if (this.cursors?.left.isDown || this.keyA?.isDown) {
      horizontalMovement = -1;
    } else if (this.cursors?.right.isDown || this.keyD?.isDown) {
      horizontalMovement = 1;
    }

    // Emit horizontal movement event
    EventBus.emit("claw-move-horizontal", horizontalMovement);
  }

  /**
   * Get the cursor keys object
   */
  public getCursors(): Phaser.Types.Input.Keyboard.CursorKeys {
    return this.cursors;
  }

  /**
   * Cleans up all listeners when the scene is destroyed
   */
  public destroy(): void {
    // Remove all key listeners
    this.keyListeners.forEach(({ key, callback }) => {
      this.scene.input.keyboard?.off(`keydown-${key}`, callback);
    });

    // Remove event bus listeners
    EventBus.off("cooking-started", this.handleCookingStarted, this);
    EventBus.off("cooking-stopped", this.handleCookingStopped, this);

    // Remove A and D key objects
    this.keyA?.destroy();
    this.keyD?.destroy();

    this.keyListeners = [];
    console.log("InputManager destroyed");
  }
}
