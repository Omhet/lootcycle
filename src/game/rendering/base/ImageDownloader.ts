import { Scene } from "phaser";
import { ImageRenderer } from "./ImageRenderer";

/**
 * Base class for downloading images of game elements.
 * Provides common download and snapshot functionality.
 */
export abstract class ImageDownloader<T extends ImageRenderer> {
  protected scene: Scene;
  protected renderer: T;

  constructor(scene: Scene, renderer: T) {
    this.scene = scene;
    this.renderer = renderer;
  }

  /**
   * Downloads images for all items.
   * This is an abstract method that derived classes must implement.
   */
  public abstract downloadImages(): Promise<void>;

  /**
   * Creates a snapshot of the provided render texture and returns it as a data URL.
   *
   * @param renderTexture The render texture to snapshot
   * @returns A Promise resolving to the image data URL or an empty string if failed
   */
  protected async snapshotToDataUrl(renderTexture: Phaser.GameObjects.RenderTexture): Promise<string> {
    return new Promise((resolve) => {
      renderTexture.snapshot((image: HTMLImageElement | Phaser.Display.Color) => {
        if (!(image instanceof HTMLImageElement)) {
          console.error("Received Color instead of Image");
          resolve("");
          return;
        }

        if (image.width === 0 || image.height === 0) {
          console.warn(`Snapshot image has zero dimensions.`);
          resolve("");
          return;
        }

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = image.width;
        tempCanvas.height = image.height;
        const ctx = tempCanvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(image, 0, 0);
          resolve(tempCanvas.toDataURL("image/png"));
        } else {
          console.error("Could not get 2D context for temp canvas");
          resolve("");
        }
      });
    });
  }

  /**
   * Downloads an image using a data URL.
   *
   * @param dataUrl The data URL of the image
   * @param filename The filename to use for the download
   * @returns A Promise that resolves when the download is triggered
   */
  protected async downloadImage(dataUrl: string, filename: string): Promise<void> {
    if (!dataUrl || dataUrl.length === 0) {
      console.warn(`No image data URL for ${filename}`);
      return;
    }

    // Create download link
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Add a small delay
    await this.delay(300);

    // Clean up the link element
    document.body.removeChild(link);
  }

  /**
   * Utility method to introduce a delay.
   *
   * @param ms Delay in milliseconds
   * @returns A Promise that resolves after the specified delay
   */
  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
