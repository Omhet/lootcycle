import { GameObjects, Scene } from "phaser";
import { JunkPiece } from "../../lib/craft/craftModel";
import { ImageRenderer } from "./base/ImageRenderer";

/**
 * Service responsible for rendering junk pieces onto a RenderTexture.
 * This creates clean, centered renders of individual junk pieces.
 */
export class JunkPieceRenderer extends ImageRenderer {
  private readonly TEXTURE_KEY = "junk-details-sprites";

  constructor(scene: Scene) {
    super(scene);
  }

  /**
   * Renders a given JunkPiece onto the provided RenderTexture.
   * @param junkPiece The JunkPiece to render.
   * @param targetRT The RenderTexture to draw onto.
   * @param clearTexture Should the texture be cleared before drawing? Defaults to true.
   */
  public renderToTexture(junkPiece: JunkPiece, targetRT: GameObjects.RenderTexture, clearTexture: boolean = true): void {
    // Prepare the render texture
    this.prepareRenderTexture(targetRT, clearTexture);

    // Create frame name from junk piece id
    const frameName = `${junkPiece.id}.png`;

    // Create a temporary container to hold our sprite
    const container = this.scene.add.container(0, 0);

    // Create a temporary sprite for the junk piece
    const tempSprite = this.scene.make.sprite(
      {
        key: this.TEXTURE_KEY,
        frame: frameName,
      },
      false
    );

    // Check if the sprite frame exists
    if (!tempSprite.texture || tempSprite.frame.name === "__MISSING") {
      console.warn(`Sprite frame missing for junk piece: ${junkPiece.id}`);
      tempSprite.destroy();
      container.destroy();
      return;
    }

    // Add the sprite to the container
    container.add(tempSprite);

    // Reset the sprite's origin to top-left corner
    tempSprite.setOrigin(0, 0);

    // Get frame data to handle the sprite sheet trimming
    const frameData = tempSprite.frame;

    // Calculate the actual source size from the frame data
    let sourceWidth = frameData.customData?.sourceSize?.w || frameData.width;
    let sourceHeight = frameData.customData?.sourceSize?.h || frameData.height;

    // Get the spriteSourceSize data (offset within the sourceSize)
    const spriteOffsetX = frameData.customData?.spriteSourceSize?.x || 0;
    const spriteOffsetY = frameData.customData?.spriteSourceSize?.y || 0;

    // Position the sprite to account for offset (this centers the actual content)
    tempSprite.setPosition(-spriteOffsetX, -spriteOffsetY);

    // Calculate scale to fit the image within the render texture
    const maxSize = Math.min(targetRT.width, targetRT.height) * 0.8; // Use 80% of the available space
    const scale = Math.min(maxSize / sourceWidth, maxSize / sourceHeight);

    // Apply scaling to the container
    container.setScale(scale);

    // Center the container in the render texture
    const centerX = targetRT.width / 2;
    const centerY = targetRT.height / 2;

    // Adjust container position to center the sprite's source rectangle
    container.setPosition(centerX - (sourceWidth * scale) / 2, centerY - (sourceHeight * scale) / 2);

    // Draw the container to the render texture
    targetRT.draw(container, container.x, container.y);

    // Clean up
    container.destroy();
  }
}
