'use strict';

var path = require('path');
var fs = require('fs');
var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var robot = require("kbm-robot");
var request = require('request');
var opn = require('opn');
var ip = require('ip');
var randomstring = require("randomstring");

var app = express();
var server = http.Server(app);
var io = socketio(server);
var ipAddress = ip.address();

robot.startJar();

// the config (URL to webserver...)
var config = require('./config.json');
//var game = require('./../server/game.json');

// the connected clients (phones)
var clients = {};
var ids = {};

// the keymaps for the current game
var game = {};


/**
 * Getting game info / loading a new game
 * Wait for the request with the name of the game and request the keymappings from the web server.
 */
app.get('/game/:name', function(req, res) {
    var gameName = req.params.name;
    request.get(config.webURL + '/api/games/' + gameName, function(err, response, body) {
        if (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        game = JSON.parse(body);
        /*
        io.sockets.forEach(function(s) {
            s.disconnect(true);
        });
*/


        clients = {};
        ids = {};

        // load the template and inject ip, then save and display
        var code = randomstring.generate({length: 5, charset: 'alphabetic', capitalization: 'lowercase'});

        var template = fs.readFileSync('game.html', {encoding: 'utf8'});
        var toDisplay = template.replace('{ip}', ipAddress + ':3000');
        toDisplay = toDisplay.replace('{code}', code);

        fs.writeFileSync('newgame.html', toDisplay);
        opn(path.join(__dirname, 'newgame.html'));

    });
    res.sendStatus(200);
});

/**
 * Shut the server down.
 */
app.get('/shutdown', function(req, res) {
   process.exit(0);
});


/**
 * UI serving
 * Serve the HTML with client-side socket JS code based on the current game.
 */

app.get('/', function (req, res) {
    if (Object.keys(game).length == 0) {
        console.log("Game not started yet");
        return res.sendFile(path.join(__dirname, '..', 'client', 'gameNotStarted.html'));
    }

    var numOfClients = Object.keys(clients).length;

    if (numOfClients == game.numOfPlayers) {
        console.log('All available spots are filled');
        res.sendFile(path.join(__dirname, '..', 'client', 'tooManyPlayers.html'));
    }

    else if (numOfClients > game.numOfPlayers) {
        console.log('Error: there are more clients than allowed players');
        res.sendFile(path.join(__dirname, '..', 'client', 'tooManyPlayers.html'));

    }

    // TODO UI picking logic based on keymapping
    // potentially request UIs from main web server
    else {
        console.log("Sending HTML to client");
        switch (game.keys) {
            case 2:
                return res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
            case 3:
                return res.sendFile(path.join(__dirname, '..', 'client', 'index3.html'));
            case 4:
                return res.sendFile(path.join(__dirname, '..', 'client', 'index4.html'));
            case 5:
                return res.sendFile(path.join(__dirname, '..', 'client', 'index5.html'));
        }

    }

});



/**
 * Sockets: clients connecting and disconnecting
 */

io.on('connection', function (socket) {
    console.info('New client connected (id=' + socket.id + ').');

    var numOfClients = Object.keys(clients).length;

    if (numOfClients == game.numOfPlayers) {
        console.log('All available spots are filled');
        return socket.disconnect(true);
    }
    else if (numOfClients > game.numOfPlayers) {
        console.log('Error: there are more clients than allowed players');
        return socket.disconnect(true);

    }

    clients[socket.id] = socket;
    var playerId = "player" + Object.keys(clients).length;
    ids[socket.id] = playerId;
    console.log("Binding socket " + socket.id + " to player id " + playerId);

    socket.on('disconnect', function () {
        if (clients[socket.id]) {
            delete clients[socket.id];
            console.info('Client disconnected (id=' + socket.id + ').');
        }
    });
});

/**
 * Sockets: clients sending commands
 */

io.sockets.on('connection', function (socket) {
    socket.on('command', function (data) {
        //console.log(data);


        var playerId = ids[socket.id];
        if (!game.keyBindings || !game.keyBindings[playerId]) {
            console.log("Game not set or player number not allowed");
            return;
        }

        if(data.type === 'down'){

            robot.press(game.keyBindings[playerId][data.key]).go();
        }
        else if(data.type === 'up'){
            robot.release(game.keyBindings[playerId][data.key]).go();
        }

        socket.broadcast.emit('command', data);

    });


});


server.listen(3000, function () {
    console.log('Socket server listening on port 3000');
});

var ngrok = require('ngrok');

ngrok.connect(3000, function (err, url) {}); // https://757c1652.ngrok.io -> http://localhost:9090
