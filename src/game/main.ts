import { AUTO, Game } from "phaser";
import { Boot } from "./scenes/Boot";
import { Game as MainGame } from "./scenes/Game";
import { Idle } from "./scenes/Idle";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 1920,
  height: 1080,
  parent: "game-container",
  backgroundColor: "#fff",
  dom: {
    createContainer: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "matter",
    matter: {
      debug: true,
    },
  },
  scene: [Boot, Preloader, MainMenu, MainGame, Idle],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};

export default StartGame;
