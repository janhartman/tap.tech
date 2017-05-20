var path = require('path');
var fs = require('fs');
var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var ks = require('node-key-sender');
var request = require('request');

var app = express();
var server = http.Server(app);
var io = socketio(http);

// the config (URL to webserver...)
var config = require('./config.json');

// the connected clients (phones)
var clients = {};

// the keymaps for the current game
var game = {};


/**
 * Getting game info
 * Wait for the request with the name of the game and request the keymappings from the web server.
 */
app.get('/game/:name', function(req, res) {
    var gameName = req.params.name;
    request.get(config.webURL + '/api/games/' + gameName, function(err, response, body) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        game = body.game;

        // TODO set up the rest of the server - open webpage with socket server URL

        clients = {};


    });
    res.sendStatus(200);
});



/**
 * UI serving
 * Serve the HTML with client-side socket JS code based on the current game.
 */

app.get('/', function (req, res) {
    var numOfClients = Object.keys(clients).length;

    if (numOfClients == game.numOfPlayers) {
        console.log('All available spots are filled');
        res.sendFile(path.join(__dirname, 'client', 'tooManyPlayers.html'));
    }

    else if (numOfClients > game.numOfPlayers) {
        console.log('Error: there are more clients than allowed players');
        res.sendFile(path.join(__dirname, 'client', 'tooManyPlayers.html'));

    }

    // TODO UI picking logic based on keymapping
    // potentially request UIs from main web server
    else {
        console.log("Sending HTML to client");
        res.sendFile( + path.join(__dirname, 'client', 'index.html'));
    }

});

/**
 * Sockets: clients connecting and disconnecting
 */

io.on('connection', function (socket) {
    console.info('New client connected (id=' + socket.id + ').');
    clients[socket.id] = socket;

    socket.on('disconnect', function () {
        if (clients[socket.id]) {
            delete clients[socket.id];
            console.info('Client disconnected (id=' + socket.id + ').');
        }
    });
});

/**
 * Sockets: clients sending commands
 * TODO: use keysender to simulate keypresses
 */

io.sockets.on('connection', function (socket) {
    socket.on('command', function (data) {
        console.log(data);
    });
});


server.listen(3000, function () {
    console.log('Socket server listening on port 3000');
});