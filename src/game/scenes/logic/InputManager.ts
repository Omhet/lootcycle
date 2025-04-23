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

  constructor(scene: Scene) {
    this.scene = scene;
    this.cursors = this.scene.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.setupInputListeners();
  }

  /**
   * Sets up keyboard listeners for game controls
   */
  private setupInputListeners(): void {
    // Setup all key listeners
    this.addKeyListener("ENTER", () => {
      // Get the junkPileManager from the scene registry
      const junkPileManager = this.scene.registry.get("junkPileManager");
      if (junkPileManager) {
        junkPileManager.generateNextPortion();
      }
      // Emit event to notify scene to craft item
      EventBus.emit("craft-item");
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
    
    if (this.cursors?.left.isDown) {
      horizontalMovement = -1;
    } else if (this.cursors?.right.isDown) {
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
    
    this.keyListeners = [];
    console.log("InputManager destroyed");
  }
}