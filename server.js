const http = require('http');
const express = require('express');
// path helps use loading files from client
const path = require('path');

// importing socket.io for multiplayer
const socketio = require('socket.io');

const RpsGame = require('./rps-game');

const app = express();

// create io server

// serving files to the server
// from our current folder(server) go one up, and the to the client folder
const clientPath = path.join(__dirname, './client');
console.log(`Serving files from ${clientPath}`);

app.use(express.static(clientPath));

const server = http.createServer(app);

const io = socketio(server);

// checking waiting players
let waitingPlayer = null;

io.on('connection', (sock) => {
    if(waitingPlayer) {
        // start the game
        // sock.emit('message', 'Game Starts!');
        // waitingPlayer('message', 'Game Starts!');
        // [sock, waitingPlayer].forEach(s => s.emit('message', 'Game Starts!'));
        new RpsGame(waitingPlayer, sock);
        waitingPlayer = null;
    } else {
        // the waiting player is the new connected socket!!!
        waitingPlayer = sock;
        waitingPlayer.emit('message', 'Waiting for an opponent!');
    }
    sock.on('message', (text) => {
        io.emit('message', text)
    })
});


// io.on('connection', (sock) => {
//     console.log('Someone connected!');
//     sock.emit('message', 'Hi, you are connected!');

//     // sending the message to everyone!
//     sock.on('message', (text) => {
//         io.emit('message', text)
//     })
// });

// if we have an error, return it to the console
server.on('error', (err) => {
    console.error("Server error ", err);
});

// server listening for the port 8080
const PORT = 8080;
server.listen(PORT, () => {
    console.log("Starting the game on http://localhost:8080 !");
    
});