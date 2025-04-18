import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
    generateAllLootObjectsInGame,
    lootAtomConfig,
    lootItemTemplateConfig,
    lootMoleculeConfig,
} from "../craft/craftModel.js";

// Get the directory name in an ES module context
const __filename = fileURLToPath(import.meta.url);
// __dirname here will be <project_root>/dist/scripts/scripts
const scriptDir = path.dirname(__filename);
// Navigate up three levels to get to the project root from dist/scripts/scripts
const projectRoot = path.resolve(scriptDir, "../../..");

const outputDir = path.join(projectRoot, "public/config"); // Correctly target public/config from project root
const outputFile = path.join(outputDir, "lootConfig.json");

console.log("Generating loot configuration...");
console.log(`Project Root: ${projectRoot}`);
console.log(`Output Directory: ${outputDir}`);

// Generate the loot data
const lootData = generateAllLootObjectsInGame(
    lootItemTemplateConfig,
    lootMoleculeConfig,
    lootAtomConfig
);

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created directory: ${outputDir}`);
}

// Write the data to the JSON file (compact format)
fs.writeFileSync(outputFile, JSON.stringify(lootData));

console.log(`Loot configuration successfully generated at: ${outputFile}`);

// Also include static configs needed at runtime if they aren't generated
// For simplicity now, let's assume they are accessed via imports,
// but ideally, they could be part of the generated config too.
// Example: Add templates, molecules, atoms if needed directly in the JSON
/*
const fullConfig = {
    ...lootData,
    static: {
        itemTemplates: lootItemTemplateConfig,
        molecules: lootMoleculeConfig,
        atoms: lootAtomConfig
    }
};
fs.writeFileSync(outputFile, JSON.stringify(fullConfig, null, 2));
*/
