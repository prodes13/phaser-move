const http = require('http');
const express = require('express');
// path helps use loading files from client
const path = require('path');

// importing socket.io for multiplayer
const socketio = require('socket.io');

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
let players = {};

io.on('connection', (socket) => {
    console.log('A user connected!');
    
    // create a new player and add it to our players object
    players[socket.id] = {
        rotation: 0,
        x: Math.floor(Math.random() * 700) + 50,
        y: Math.floor(Math.random() * 500) + 50,
        playerId: socket.id,
        team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
    };
    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // when a player moves, update the player data
    socket.on('playerMovement', function (movementData) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected!');
        // remove this player from our players object
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnect', socket.id);
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
const PORT = 5000;
server.listen(PORT, () => {
    console.log("Starting the game on http://localhost:5000 !");
    
});