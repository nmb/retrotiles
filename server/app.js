import * as mapmod from '../client/js/map.mjs';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);

const map = mapmod.map
console.log(map.cols)
const socketio = require("socket.io")(server, {
});

app.use( express.static('../client') );

let players = {};
let tagged = {};
server.listen(3000, () => {
  console.log("Listening at :3000...");
});

socketio.on("connection", socket => {
  console.log("connect: ", socket.id)
  //socketio.emit("new", socket.id)
  const keys = Object.keys(players)
  if(Object.keys(tagged).length === 0 && keys.length > 0){
    const i = keys.length * Math.random() << 0
    const id = Object.keys(players)[i]
    players[id]["tagged"] = true
    tagged[id] = true
    console.log("Tagging ", id)
    socketio.emit("tag", id)
  }
  socket.emit("players", players)
  socket.on("move", msg => {
    players[socket.id] = msg
    if(!tagged[socket.id] && 
      Object.values(players).find(p => p.tile.x == msg.tile.x
        && p.tile.y == msg.tile.y && p.tagged)){
      msg["tagged"] = true
      players[socket.id]["tagged"] = true
      tagged[socket.id] = true
      socketio.emit("tag", socket.id)
    }
    else if(tagged[socket.id]){
      for(let p of Object.keys(players).filter(q => players[q].tile && players[q].tile.x == msg.tile.x
        && players[q].tile.y == msg.tile.y && !players[q].tagged)){
        if(!players[p])
          continue;
        players[p]["tagged"] = true
        tagged[p] = true
        msg["tagged"] = true
        socketio.emit("tag", p)
      }
    }
    socketio.emit("move", {id: socket.id, data: msg})
  });
  socket.on("disconnecting", (reason) => {
    delete players[socket.id];
    for (const room of socket.rooms) {
      if (room == socket.id) {
        socketio.emit("quitter", socket.id)
      }
    }
    console.log("disconnect: ", socket.id)
    delete tagged[socket.id]
  });
});


