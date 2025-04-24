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

  constructor(scene: Scene) {
    this.scene = scene;
    this.cursors = this.scene.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;

    // Create A and D key objects for movement
    this.keyA = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    this.setupInputListeners();
  }

  /**
   * Sets up keyboard listeners for game controls
   */
  private setupInputListeners(): void {
    // Setup all key listeners
    this.addKeyListener("ENTER", () => {
      this.toggleCrafting();
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
   * Toggles the crafting process
   */
  private toggleCrafting(): void {
    EventBus.emit("toggle-crafting");
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

    // Remove A and D key objects
    this.keyA?.destroy();
    this.keyD?.destroy();

    this.keyListeners = [];
    console.log("InputManager destroyed");
  }
}
