import {loadSprites} from './loader.js';
import { Game} from './game.js';

window.addEventListener('load', async function(){
  const canvas = document.getElementById('gamecanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 500;
  canvas.height = 500;
  // show loading screen
  const txt = "Loading...";
  ctx.font = "48px Arial";
  const txtWidth = ctx.measureText(txt).width
  ctx.fillText(txt, (canvas.width/2) - (txtWidth / 2), 250);
  ctx.font = "10px Arial";
  // load sounds
  const sndNew = new Audio('/snd/new.ogg')
  const sndEnd = new Audio('/snd/end.ogg')
  // load graphics files
  const mapSprite = await loadSprites('./assets/fantasy-tileset.png');
  let playerSprites = []
  let loader = []
  for(let i = 1; i <= 23; i++) {
    loader.push(loadSprites('./assets/characters/' + i + '.png'));
  }
  await Promise.all(loader).then((values) => {playerSprites = values});

  const game = new Game(canvas.width, canvas.height, mapSprite, playerSprites);
  window.game = game

  game.socket.on("new", data => {
    if(data != game.socket.id){
      game.others[data] = {}
      sndNew.play();
    }

  });
  game.socket.on("quitter", data => {
    delete game.others[data];
    sndEnd.play();
  });
  game.socket.on("move", msg => {
    if(msg.id != game.socket.id)
    game.others[msg.id] = msg.data
  });
  game.socket.emit("new", game.player.info())

  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx);
    requestAnimationFrame(animate);
  }
  animate(0);
});
