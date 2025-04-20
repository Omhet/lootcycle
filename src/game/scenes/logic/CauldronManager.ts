import { Scene } from "phaser";
import { DepthLayers } from "../Game";

export class CauldronManager {
    private scene: Scene;
    private cauldronSprite: Phaser.Physics.Matter.Sprite;

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

        this.cauldronSprite = this.scene.matter.add.sprite(
            xPos,
            yPos,
            "cauldron",
            undefined,
            { shape: cauldronPhysics.cauldron }
        );

        this.cauldronSprite.setStatic(true);
        this.cauldronSprite.setName("cauldron");
        this.cauldronSprite.setDepth(DepthLayers.Ground);
    }

    public getSprite(): Phaser.Physics.Matter.Sprite {
        return this.cauldronSprite;
    }

    public destroy(): void {
        if (this.cauldronSprite) {
            this.cauldronSprite.destroy();
        }
        console.log("CauldronManager destroyed");
    }
}

