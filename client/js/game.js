import { map } from './map.mjs'
import { Player } from './player.js';
import { InputHandler } from './input.js';
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

export  class Game {
  constructor(width, height, mapSprite, playerSprites) {
    this.width = width;
    this.height = height;
    this.mapSprite = mapSprite;
    this.playerSprites = playerSprites;
    this.map = map;
    this.frame = 0;
    this.frameInterval = 100;
    this.frameTimer = 0;
    this.player = new Player(this);
    this.input = new InputHandler();
    this.others = {};
    this.socket = io();
    this.socket.emit("move", this.player.info())
  }
  update(deltaTime){
    this.player.update(this.input.keys, deltaTime);
    if(this.frameTimer > this.frameInterval){
      this.frameTimer = 0;
      this.frame++;
    }
    else
      this.frameTimer += deltaTime;
  }
  drawTag(ctx, x, y){
    const sz = this.player.width
    ctx.beginPath();
    ctx.arc(x + sz*0.5, y + sz*0.5, sz + 3,
      (this.frame % 10 - 1)*0.1*2*Math.PI, (this.frame % 10 + 1)*0.1*2*Math.PI);
    ctx.stroke();
  }
  draw(context){
    const o = this.player.draw(context);
    const p = this.player
    if(this.player.tagged)
      this.drawTag(context, p.x - o.x, p.y - o.y)
    for(let i in this.others){
      const p2 = this.others[i]
      if(p2.tagged && p2.x >= o.x && p2.x < o.x + this.width
        && p2.y >= o.y && p2.y < o.y + this.height)
        this.drawTag(context, p2.x - o.x, p2.y - o.y)
    }
  }
}


