import { GameObjects, Scene } from "phaser";

/**
 * Base class for rendering various game elements onto a RenderTexture.
 * Provides common functionality for different renderers.
 */
export abstract class ImageRenderer {
  protected scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Renders an item onto the provided RenderTexture.
   * This is an abstract method that derived classes must implement.
   *
   * @param item The item to render
   * @param targetRT The RenderTexture to draw onto
   * @param clearTexture Whether to clear the texture before rendering
   */
  public abstract renderToTexture(item: any, targetRT: GameObjects.RenderTexture, clearTexture?: boolean): void;

  /**
   * Cleans up any internal state.
   * Override this in derived classes if additional cleanup is needed.
   */
  public cleanup(): void {
    // Base implementation does nothing
  }

  /**
   * Helper method to prepare the RenderTexture before drawing.
   *
   * @param targetRT The RenderTexture to prepare
   * @param clearTexture Whether to clear the texture
   */
  protected prepareRenderTexture(targetRT: GameObjects.RenderTexture, clearTexture: boolean = true): void {
    if (clearTexture) {
      targetRT.clear();
      targetRT.fill(0x000000, 0); // Use transparent fill
    }
  }

  /**
   * Helper method to draw a sprite to the center of a render texture
   *
   * @param sprite The sprite to draw
   * @param targetRT The RenderTexture to draw onto
   */
  protected drawSpriteToCenter(sprite: GameObjects.Sprite, targetRT: GameObjects.RenderTexture): void {
    // Calculate center of the render texture
    const centerX = targetRT.width / 2;
    const centerY = targetRT.height / 2;

    targetRT.draw(sprite, centerX, centerY);
  }
}
