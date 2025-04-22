import { Scene } from "phaser";
import { CollisionCategories, CollisionMasks } from "../../physics/CollisionCategories";
import { DepthLayers } from "../Game";
import { JunkPileItem, JunkPileManager } from "./JunkPileManager";

export class CauldronManager {
  private scene: Scene;
  private cauldronSprite: Phaser.Physics.Matter.Sprite;
  private cauldronSensor: MatterJS.BodyType;
  private junkPiecesInside: JunkPileItem[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
    this.createCauldron();
  }

  /**
   * Creates the cauldron sprite with physics using the PhysicsEditor JSON data
   */
  private createCauldron(): void {
    const cauldronPhysics = this.scene.cache.json.get("cauldronPhysics");
    const cauldronTexture = this.scene.textures.get("cauldron");
    const frame = cauldronTexture.get();

    const xPos = this.scene.cameras.main.width / 2 - 180;
    const yPos = this.scene.cameras.main.height - frame.height / 2 - 250;

    this.cauldronSprite = this.scene.matter.add.sprite(xPos, yPos, "cauldron", undefined, {
      shape: cauldronPhysics.cauldron,
      collisionFilter: {
        category: CollisionCategories.ENVIRONMENT,
        mask: CollisionMasks.ENVIRONMENT,
      },
    });

    this.cauldronSprite.setStatic(true);
    this.cauldronSprite.setName("cauldron");
    this.cauldronSprite.setDepth(DepthLayers.Ground);

    // Create a sensor area inside the cauldron to detect junk pieces
    // Size is slightly smaller than the cauldron sprite
    const sensorWidth = frame.width * 0.8;
    const sensorHeight = frame.height * 1.25;

    // Position the sensor in the top part of the cauldron
    const sensorX = xPos;
    const sensorY = yPos + frame.height * 0.1;

    this.cauldronSensor = this.scene.matter.add.rectangle(sensorX, sensorY, sensorWidth, sensorHeight, {
      isSensor: true, // This makes it a trigger that detects collisions but doesn't resolve them physically
      isStatic: true,
      label: "cauldronSensor",
      collisionFilter: {
        category: CollisionCategories.ENVIRONMENT,
        mask: CollisionMasks.JUNK, // Only detect junk pieces
      },
    });

    // Setup collision detection for the sensor
    this.scene.matter.world.on("collisionstart", this.handleCollisionStart, this);
    this.scene.matter.world.on("collisionend", this.handleCollisionEnd, this);
  }

  /**
   * Handles collision start events for the cauldron sensor
   */
  private handleCollisionStart(event: Phaser.Physics.Matter.Events.CollisionStartEvent): void {
    const pairs = event.pairs;

    for (let i = 0; i < pairs.length; i++) {
      const bodyA = pairs[i].bodyA;
      const bodyB = pairs[i].bodyB;

      // Check if one of the bodies is our cauldron sensor
      if (bodyA.label === "cauldronSensor" || bodyB.label === "cauldronSensor") {
        // The other body is what entered our sensor
        const junkBody = bodyA.label === "cauldronSensor" ? bodyB : bodyA;

        // Find the junk item in the scene
        const junkItems = this.scene.children.list.filter(
          (obj) => obj instanceof Phaser.Physics.Matter.Sprite || obj instanceof Phaser.Physics.Matter.Image
        ) as Array<Phaser.Physics.Matter.Sprite | Phaser.Physics.Matter.Image>;

        const matchingJunkItem = junkItems.find((item) => item.body === junkBody.parent);

        if (matchingJunkItem) {
          // Get the unique ID from the body
          const uniqueJunkId = junkBody.label || junkBody.parent?.label;

          // Find the corresponding JunkPileItem
          const junkPile = (this.scene.registry.get("junkPileManager") as JunkPileManager)?.getJunkPile() || [];
          const junkPileItem = junkPile.find((item) => item.uniqueId === uniqueJunkId);

          if (junkPileItem && !this.isJunkAlreadyInside(junkPileItem)) {
            this.junkPiecesInside.push(junkPileItem);
            console.log(`Junk piece ${junkPileItem.uniqueId} entered cauldron. Total pieces inside: ${this.junkPiecesInside.length}`);
          } else if (junkPileItem) {
            console.log(`Junk piece ${junkPileItem.uniqueId} is already inside the cauldron.`);
          } else {
            console.log(`Junk piece with ID ${uniqueJunkId} not found in the pile.`);
          }
        }
      }
    }
  }

  /**
   * Handles collision end events for the cauldron sensor
   */
  private handleCollisionEnd(event: Phaser.Physics.Matter.Events.CollisionEndEvent): void {
    const pairs = event.pairs;

    for (let i = 0; i < pairs.length; i++) {
      const bodyA = pairs[i].bodyA;
      const bodyB = pairs[i].bodyB;

      // Check if one of the bodies is our cauldron sensor
      if (bodyA.label === "cauldronSensor" || bodyB.label === "cauldronSensor") {
        // The other body is what left our sensor
        const junkBody = bodyA.label === "cauldronSensor" ? bodyB : bodyA;

        // Find the junk item in the scene
        const junkItems = this.scene.children.list.filter(
          (obj) => obj instanceof Phaser.Physics.Matter.Sprite || obj instanceof Phaser.Physics.Matter.Image
        ) as Array<Phaser.Physics.Matter.Sprite | Phaser.Physics.Matter.Image>;

        const matchingJunkItem = junkItems.find((item) => item.body === junkBody.parent);

        if (matchingJunkItem) {
          // Get the unique ID from the body's label (which we set in JunkPileManager)
          const uniqueJunkId = junkBody.label || junkBody.parent?.label;

          if (uniqueJunkId) {
            // Find the corresponding JunkPileItem by unique ID
            const junkIndex = this.junkPiecesInside.findIndex((item) => item.uniqueId === uniqueJunkId);

            if (junkIndex !== -1) {
              const removedJunk = this.junkPiecesInside.splice(junkIndex, 1);
              console.log(`Junk piece ${removedJunk[0].uniqueId} left cauldron. Remaining pieces: ${this.junkPiecesInside.length}`);
            }
          }
        }
      }
    }
  }

  /**
   * Checks if a junk piece is already registered inside the cauldron
   */
  private isJunkAlreadyInside(junkItem: JunkPileItem): boolean {
    return this.junkPiecesInside.some((item) => item.uniqueId === junkItem.uniqueId);
  }

  /**
   * Returns all junk pieces currently inside the cauldron
   */
  public getJunkPiecesInside(): JunkPileItem[] {
    return [...this.junkPiecesInside];
  }

  /**
   * Clears all junk pieces from the cauldron tracking (doesn't physically remove them)
   */
  public clearJunkPieces(): void {
    this.junkPiecesInside = [];
  }

  public getSprite(): Phaser.Physics.Matter.Sprite {
    return this.cauldronSprite;
  }

  public destroy(): void {
    // Remove collision listeners
    this.scene.matter.world.off("collisionstart", this.handleCollisionStart, this);
    this.scene.matter.world.off("collisionend", this.handleCollisionEnd, this);

    // Destroy the sensor
    if (this.cauldronSensor) {
      this.scene.matter.world.remove(this.cauldronSensor);
    }

    // Destroy the sprite
    if (this.cauldronSprite) {
      this.cauldronSprite.destroy();
    }

    // Clear references
    this.junkPiecesInside = [];
    console.log("CauldronManager destroyed");
  }
}
