import { map } from './map.js'
import { Player } from './player.js';
import { InputHandler } from './input.js';
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

export  class Game {
  constructor(width, height, mapSprite, playerSprites) {
    this.width = width;
    this.height = height;
    this.mapSprite = mapSprite;
    this.playerSprites = playerSprites;
    this.player = new Player(this);
    this.input = new InputHandler();
    this.map = map;
    this.others = {};
    this.socket = io();
  }
  update(deltaTime){
    this.player.update(this.input.keys, deltaTime);
  }
  draw(context){
    this.player.draw(context);
  }
}


