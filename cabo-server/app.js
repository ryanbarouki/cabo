const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const PORT = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: '*'
    }
}); // < Interesting!

let interval;
io.sockets.on("connection", client => {
    console.log("New client connected");

    if (interval) {
        clearInterval(interval);
    }

    client.on("FlipCard", (index, clientId)=> {
        console.log(`recieved flip update index: ${index}`);
        io.sockets.emit("CardFlipped", JSON.stringify({cardId: index, clientId: clientId}));
    });

    interval = setInterval(() => getApiAndEmit(io.sockets), 1000);
    client.on('disconnect', () => {
        console.log("Client disconnected");
        clearInterval(interval);
    });
});

const getApiAndEmit = sockets => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  sockets.emit("FromAPI", response);
};

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));