import { Scene } from "phaser";
import {
    craftLootItem,
    LootItem,
    LootItemId,
    lootItemTemplateConfig,
    LootItemTemplateType,
    LootJunkItem,
    LootPart,
    LootPartId,
} from "../../../craft/craftModel";
import {
    formatMaterialComposition,
    getAtomReadableName,
    getMoleculeIdFromPartId,
    getMoleculeReadableName,
    getRandomJunkItems,
    getTemplateIdFromItemId,
    getTemplateReadableName,
} from "../../../craft/craftUtils";
import { EventBus } from "../EventBus";

export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    container: Phaser.GameObjects.Container;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;
    lootConfig: {
        lootItems: Record<LootItemId, LootItem>;
        lootParts: Record<LootPartId, LootPart>;
        lootDetails: Record<string, any>;
        lootJunkItems: Record<string, LootJunkItem>;
    };

    constructor() {
        super("Game");
    }

    create() {
        this.camera = this.cameras.main;

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.container = this.add.container(centerX, centerY);

        this.background = this.add.image(0, 0, "background");
        this.container.add(this.background);

        this.lootConfig = this.cache.json.get("lootConfig");

        this.gameText = this.add
            .text(centerX, 50, "Press SPACE to test crafting", {
                fontFamily: "Arial Black",
                fontSize: 38,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5);

        this.input.keyboard?.on("keydown-SPACE", this.testCrafting, this);

        EventBus.emit("current-scene-ready", this);
    }

    testCrafting() {
        console.log("=== CRAFTING TEST (SPACE KEY) ===");

        if (!this.lootConfig) {
            console.error("Loot configuration not loaded!");
            return;
        }

        const { lootItems, lootParts, lootJunkItems } = this.lootConfig;

        const swordTemplate =
            lootItemTemplateConfig[LootItemTemplateType.Sword]?.[0];

        if (!swordTemplate) {
            console.error("Could not find the sword template definition.");
            return;
        }

        const availableJunkItems = Object.values(lootJunkItems);
        availableJunkItems.forEach((junk) => {
            if (!junk.atomId) {
                console.warn(
                    `Junk item ${junk.id} missing atomId. Crafting might be affected.`
                );
            }
        });

        const junkToUse = getRandomJunkItems(availableJunkItems, 5, 10);
        const temperature = 50 + Math.random() * 30;

        console.log("Crafting Inputs:");
        console.log(`- Template: ${swordTemplate.name} (${swordTemplate.id})`);
        console.log(`- Junk Items: ${junkToUse.length} items`);
        junkToUse.forEach((item) => {
            const readableName = item.atomId
                ? getAtomReadableName(item.atomId)
                : `Unknown Atom (${item.id})`;
            console.log(
                `   - ${readableName} [${item.rarity}] (Degradation: ${
                    item.degradation
                }%) (Materials: ${formatMaterialComposition(
                    item.materialComposition
                )})`
            );
        });
        console.log(`- Temperature: ${temperature.toFixed(1)}°C`);

        const result = craftLootItem({
            lootItemTemplate: swordTemplate,
            availableJunkItems: junkToUse,
            temperature,
            config: { lootItems, lootParts },
        });

        console.log("Crafting Result:");
        console.log(`- Success: ${result.success}`);

        if (result.success && result.item) {
            const templateId = getTemplateIdFromItemId(result.item.id);
            const templateName = getTemplateReadableName(templateId);

            console.log(
                `- Created Item: ${templateName} [${result.item.rarity}] (ID: ${result.item.id})`
            );

            if (result.item.subparts.length > 0) {
                console.log("  Parts:");
                result.item.subparts.forEach((partId) => {
                    const part = lootParts[partId];
                    if (!part) {
                        console.log(`   - Part ${partId} not found in config!`);
                        return;
                    }
                    const moleculeId = getMoleculeIdFromPartId(partId);
                    const moleculeName = getMoleculeReadableName(moleculeId);

                    console.log(
                        `   - ${moleculeName} [${
                            part.rarity
                        }] - Materials: ${formatMaterialComposition(
                            part.materialComposition
                        )} (ID: ${partId})`
                    );

                    if (part.subparts && part.subparts.length > 0) {
                        console.log("     Details (Atoms):");
                        part.subparts.forEach((detailId) => {
                            const detail =
                                this.lootConfig.lootDetails[detailId] ||
                                this.lootConfig.lootJunkItems[detailId];
                            const atomName = detail?.atomId
                                ? getAtomReadableName(detail.atomId)
                                : `Unknown Atom (${detailId})`;
                            const detailRarity = detail?.rarity || "N/A";
                            console.log(
                                `       • ${atomName} [${detailRarity}] (ID: ${detailId})`
                            );
                        });
                    }
                });
            }

            console.log(
                `- Overall Material Composition: ${formatMaterialComposition(
                    result.item.materialComposition
                )}`
            );
            console.log(`- Quality: ${result.quality!.toFixed(2)}%`);
            console.log(`- Sell Price: ${result.sellPrice} coins`);
            console.log(
                `- Temperature Range: ${result.item.temperatureRange.min}°C - ${result.item.temperatureRange.max}°C`
            );
            console.log(
                `- Master Range: ${result.item.masterQualityTemperatureRange.min}°C - ${result.item.masterQualityTemperatureRange.max}°C`
            );
        } else if (!result.success && result.failure) {
            console.log(`- Failure Reason: ${result.failure.reason}`);
        }
    }
}
