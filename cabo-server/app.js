const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const Player = require('./player');
const Card = require('./card');
const { shuffle, buildDeck } = require('./utils')

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


    const players = [];
    if (interval) {
        clearInterval(interval);
    }
    
    client.on("StartGame", () => {
        const shuffledDeck = shuffle(buildDeck());

        for (let i = 0; i < io.engine.clientsCount; i++) {
            const player = new Player(shuffledDeck.slice(4*i, 4*i + 4));
            players.push(player);
        }

        io.sockets.emit("DealCards", JSON.stringify(players))
    })

    client.on("FlipCard", (index, clientId)=> {
        console.log(`recieved flip update index: ${index}`);
        io.sockets.emit("CardFlipped", JSON.stringify({cardId: index, clientId: clientId}));
    });

    client.on("Swap", (data) => {
        io.sockets.emit("ShowSwap", data)
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