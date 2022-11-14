export class Player {
  constructor(game) {
    this.game = game;
    this.width = 16;
    this.height = 16;
    this.x = Math.random() * (this.game.width-this.width);
    this.y = Math.random() * (this.game.height - this.height);
    this.dir = 'down';
    this.frame = 0;
    this.frameInterval = 100;
    this.frameTimer = 0;
    this.name = "player " + Math.floor(Math.random() * 1000);
    this.speed = 1 + Math.random();
    this.charno = Math.floor(Math.random() * game.playerSprites.length)
  }
  info() {
    return({name: this.name, x: this.x, y: this.y, dir: this.dir, frame: this.frame, charno: this.charno})
  }
  update(input, deltaTime){
    if('ArrowRight' in input) {
      this.x += this.speed;
      this.dir = 'right';
    }
    else if ('ArrowLeft' in input) {
      this.x -= this.speed;
      this.dir = 'left';
    }
    if('ArrowUp' in input) {
      this.y -= this.speed;
      this.dir = 'up';
    }
    else if ('ArrowDown' in input) {
      this.y += this.speed;
      this.dir = 'down';
    }
    if('touch' in input){
      let t = input['touch']
      const o = this.viewPortOrigin()
      const rt = {x: t.x + o.x, y: t.y + o.y}
      let dr = {x: rt.x - this.x, y: rt.y - this.y}
      const l = Math.sqrt(dr.x*dr.x + dr.y*dr.y)
      dr.x = dr.x/l*this.speed
      dr.y = dr.y/l*this.speed
      this.x += dr.x
      this.y += dr.y
      // set direction
      if(Math.abs(dr.x) > Math.abs(dr.y)) {
        dr.x < 0 ? this.dir = 'left' : this.dir = 'right';
      }
        else {
        dr.y < 0 ? this.dir = 'up' : this.dir = 'down';
      }
    }
    if(this.x < 0) this.x = 0;
    if(this.x > this.game.map.width() - this.width) this.x = this.game.map.width() - this.width;
    if(this.y < 0) this.y = 0;
    if(this.y > this.game.map.height() - this.height) this.y = this.game.map.height() - this.height;
    if(Object.keys(input).length > 0 && this.frameTimer > this.frameInterval){
      this.frameTimer = 0;
      this.frame++;
      this.game.socket.emit("move", this.info())
    }
    else
      this.frameTimer += deltaTime;
  }
  viewPortOrigin(){
    let vw = this.game.width
    let vh = this.game.height
    let mw = this.game.map.width()
    let mh = this.game.map.height()
    let c = {
      x: this.x - vw*0.5,
      y: this.y - vh*0.5
    }
    if(c.x < 0)
      c.x = 0
    if(c.x + vw >= mw)
      c.x = mw-vw 
    if(c.y < 0)
      c.y = 0
    if(c.y + vh >= mh)
      c.y = mh-vh 
    return(c)
  }
  drawMap(context){
    const o = this.viewPortOrigin()
    const vw = this.game.width
    const vh = this.game.height
    const map = this.game.map
    const startCol = Math.floor(o.x / map.tsize);
    let endCol = startCol + Math.round(vw / map.tsize);
    if(endCol >= map.cols) endCol = map.cols - 1;
    const startRow = Math.floor(o.y / map.tsize);
    let endRow = startRow + Math.round(vh / map.tsize);
    if(endRow >= map.rows) endRow = map.rows - 1;
    const offsetX = -o.x + startCol * map.tsize;
    const offsetY = -o.y + startRow * map.tsize;
    for (var c = startCol; c <= endCol; c++) {
      for (var r = startRow; r <= endRow; r++) {
        var tile = map.getTile(c, r);
        var x = (c - startCol) * map.tsize + offsetX;
        var y = (r - startRow) * map.tsize + offsetY;
        if (tile !== 0) { // 0 => empty tile
          context.drawImage(
            this.game.mapSprite, // image
            map.tileOrigin[tile].x, // source x
            map.tileOrigin[tile].y, // source y
            map.tsize, // source width
            map.tsize, // source height
            Math.round(x),  // target x
            Math.round(y), // target y
            map.tsize, // target width
            map.tsize // target height
          );
        }
      }
    }
    // 
    // context.drawImage(this.game.mapSprite, o.x, o.y)
  }
  drawPlayer(p, context){

    // select player sprite from direction
    let imdx;
    if(p.dir == 'down')
      imdx = 0;
    else if(p.dir == 'up')
      imdx = 1;
    else if(p.dir == 'left')
      imdx = 2;
    else if(p.dir == 'right')
      imdx = 3;
    let x,y;
    const o = this.viewPortOrigin()
    x = p.x - o.x
    y = p.y - o.y
    const sprite = this.game.playerSprites[p.charno]
    if(!sprite) {
      return(false);
    }
    context.drawImage(sprite, this.width * imdx, this.height * (p.frame % 4), 
      this.width, this.height, 
      x, y, 
      this.width, this.height);
    context.fillText(p.name, x, y - (0.5 * this.height));
  }
  draw(context){
    this.drawMap(context)
    for(let i in this.game.others) {
      const p = this.game.others[i]
      if(Math.abs(this.x - p.x) < this.game.width*0.5
        && Math.abs(this.y - p.y) < this.game.height*0.5){
        this.drawPlayer(p, context)
      }
    }
    this.drawPlayer(this, context)
  }
}
