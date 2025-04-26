import { Scene } from "phaser";

export class Preloader extends Scene {
  container: Phaser.GameObjects.Container;

  constructor() {
    super("Preloader");
  }

  init() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Create a container centered on the screen
    this.container = this.add.container(centerX, centerY);

    // Progress bar elements relative to the container's center (0, 0)
    const barWidth = this.cameras.main.width * 0.8;
    const barHeight = 32;

    // Outline rectangle centered at (0, 0) within the container
    const progressBarOutline = this.add.rectangle(0, 0, barWidth + 4, barHeight + 4).setStrokeStyle(1, 0xffffff);
    this.container.add(progressBarOutline);

    // Filling bar starting from the left edge relative to the container's center
    const bar = this.add.rectangle(
      -barWidth / 2, // Start from left edge relative to center
      0, // Center vertically
      4,
      barHeight,
      0xffffff
    );
    this.container.add(bar); // Add the bar itself to the container

    // Update bar width based on progress
    this.load.on("progress", (progress: number) => {
      bar.width = 4 + barWidth * progress;
    });
  }

  preload() {
    //  Load the assets for the game
    this.load.setPath("assets");

    // Load background assets
    this.load.image("bg", "game/bg/bg.png");
    this.load.image("bg_walls", "game/bg/bg_walls.png");
    this.load.image("bg_frame", "game/bg/bg_frame.png");
    this.load.image("bg_decor", "game/bg/bg_decor.png");
    this.load.image("fg_decor", "game/bg/fg_decor.png");

    // Load container assets
    this.load.image("container", "game/elements/container.png");
    this.load.json("containerPhysics", "game/elements/container.json");

    // Load cauldron resources
    this.load.image("cauldron", "game/elements/cauldron.png");
    this.load.image("cauldron_filled", "game/elements/cauldron_filled.png");
    this.load.json("cauldronPhysics", "game/elements/cauldron.json");

    // Load intake resources
    this.load.image("intake", "game/elements/intake.png");
    this.load.image("intake_filled", "game/elements/intake_filled.png");
    this.load.json("intakePhysics", "game/elements/intake.json");

    // Load furnace resource
    this.load.image("furnace", "game/elements/furnace.png");
    this.load.atlas("furnace_fire", "game/elements/furnace_fire.png", "game/elements/furnace_fire.json");

    // Smoke
    this.load.atlas("smoke", "game/elements/smoke.png", "game/elements/smoke.json");

    // Bubbles
    this.load.atlas("bubbles", "game/elements/bubbles.png", "game/elements/bubbles.json");

    // Load pipe assets
    this.load.image("pipe_back", "game/elements/pipe_back.png");
    this.load.image("pipe_front", "game/elements/pipe_front.png");

    // Load loot details assets
    this.load.atlas("loot-details-sprites", "game/details/loot-details-sprites.png", "game/details/loot-details-sprites.json");

    // Load junk details assets
    this.load.atlas("junk-details-sprites", "game/details/junk-details-sprites.png", "game/details/junk-details-sprites.json");
    this.load.json("junk-details-shapes", "game/details/junk-details-shapes.json");

    // Claw
    this.load.image("claw_anchor", "game/elements/claw_anchor.png");

    this.load.atlas(
      "clawParts", // Load claw parts atlas
      "game/elements/claw-parts-sprites.png",
      "game/elements/claw-parts-sprites.json"
    );
    this.load.json("clawPhysics", "game/elements/claw-parts-shapes.json"); // Load claw physics

    // Sound effects
    this.load.audio("part_appear", "sounds/part_appear.mp3");
    this.load.audio("crafted_loot_item", "sounds/crafted_loot_item.mp3");
    this.load.audio("claw_move_horiz", "sounds/claw_move_horiz.wav");
    this.load.audio("claw_ascend", "sounds/claw_ascend.wav");
    this.load.audio("boiling", "sounds/boiling.wav");

    this.load.audio("main_ost", "sounds/main_ost.mp3");
    this.load.audio("menu", "sounds/menu.mp3");

    this.load.image("axe_recipe", "recipes/axe.png");
    this.load.image("short_sword_recipe", "recipes/short_sword.png");

    this.load.image("spotlight_circle", "game/elements/spotlight_circle.png");
  }

  create() {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.

    //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
    this.scene.start("MainMenu");
  }
}
