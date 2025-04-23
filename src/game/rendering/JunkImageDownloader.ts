import { Scene } from "phaser";
import { lootConfig } from "../../lib/craft/config";
import { JunkPiece } from "../../lib/craft/craftModel";
import { ImageDownloader } from "./base/ImageDownloader";
import { JunkPieceRenderer } from "./JunkPieceRenderer";

/**
 * Service responsible for downloading images of all junk pieces.
 */
export class JunkImageDownloader extends ImageDownloader<JunkPieceRenderer> {
  private readonly TEXTURE_SIZE = 128; // Size for the render texture (square)

  constructor(scene: Scene) {
    super(scene, new JunkPieceRenderer(scene));
  }

  /**
   * Downloads images of all junk pieces.
   * @returns A promise that resolves when all downloads are complete.
   */
  public async downloadImages(): Promise<void> {
    console.log("Starting junk image generation...");

    // Get all junk pieces from the lootConfig
    const allJunkPieces: JunkPiece[] = [];
    Object.entries(lootConfig.junkPieces).forEach(([id, junkArray]) => {
      allJunkPieces.push(...junkArray);
    });

    console.log(`Found ${allJunkPieces.length} junk pieces to process.`);

    // Create a render texture for the junk pieces
    const tempRT = this.scene.make.renderTexture({
      width: this.TEXTURE_SIZE,
      height: this.TEXTURE_SIZE,
    });

    // Process each junk piece
    for (const junkPiece of allJunkPieces) {
      try {
        console.log(`Processing junk piece: ${junkPiece.id}`);

        // Render the junk piece to the texture
        this.renderer.renderToTexture(junkPiece, tempRT);

        // Create a snapshot of the render texture
        const imageDataUrl = await this.snapshotToDataUrl(tempRT);

        // Skip if no image data was generated
        if (!imageDataUrl || imageDataUrl.length === 0) {
          console.warn(`Failed to generate image for junk piece: ${junkPiece.id}`);
          continue;
        }

        // Download the image
        const filename = `${junkPiece.id}.png`;
        await this.downloadImage(imageDataUrl, filename);

        // Small delay to prevent browser from throttling downloads
        await this.delay(100);
      } catch (error) {
        console.error(`Error processing junk piece ${junkPiece.id}:`, error);
      }
    }

    // Clean up the render texture when done
    tempRT.destroy();

    console.log("All junk images downloaded.");
  }
}
