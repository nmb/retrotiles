const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketio = require("socket.io")(server, {
});

app.use( express.static(__dirname+'/../client') );

server.listen(3000, () => {
  console.log("Listening at :3000...");
});

socketio.on("connection", socket => {
  console.log("connect: ", socket.id)
  socketio.emit("new", socket.id)
  socket.on("move", msg => {
    console.log(msg)
    socketio.emit("move", {id: socket.id, data: msg})
  });
  socket.on("disconnecting", (reason) => {
    for (const room of socket.rooms) {
      if (room == socket.id) {
        socketio.emit("quitter", socket.id)
      }
    }
    console.log("disconnect: ", socket.id)
  });
});


