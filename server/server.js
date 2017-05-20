'use strict';

var express = require('express');
var fs = require('fs');
var path = require('path');
var cors = require('cors');
var app = express();

app.use(cors());

var games = require('./game.json');
var ips = require('./ip.json');

app.use(express.static(path.join(__dirname, '..', 'website')));

/**
 * Load the website.
 */
app.get('/', function(req, res) {
    return res.sendFile(path.join(__dirname, '..', 'website', 'index.html'));
});

/**
 * Get the specified game details.
 */
app.get('/api/games/:gameId', function(req, res) {
   var gameId = req.params.gameId;

   if (!gameId) {
       return res.sendStatus(400);
   }

   if (gameId == "all") {
       res.setHeader('Content-Type', 'application/json');
       return res.send(JSON.stringify(games));
   }

   for (var idx in games) {
       //console.log(games);
       var game = games[idx];
       if (game.id.toString() == gameId.toString()) {
           res.setHeader('Content-Type', 'application/json');
           return res.send(JSON.stringify(game));
       }
   }

   res.sendStatus(404);
});

/**
 * Add a new game to the database.
 */
app.post('/api/games/', function(req, res) {
    var game = req.body;
    var newId = games[games.length - 1] + 1;
    game['id'] = newId;
    games.push(game);
    fs.writeFileSync('game.json', JSON.stringify(games));

    res.sendStatus(200);
});

/**
 * Add a new client socket server.
 */
app.post('/api/ip', function(req, res) {
   var socketServer = req.body;
   ips.push(socketServer);
   fs.writeFileSync('ip.json', JSON.stringify(ips));

   res.sendStatus(200);
});

/**
 * Redirect to client socket server.
 */
app.get('/play/:code', function(req, res) {
   var code = req.params.code;

   ips.forEach(function (record) {
       if (record.code == code) {
           return res.redirect(record.ip);
       }
   });

    res.sendStatus(404);
});

app.listen(80, function() {
   console.log("Web server listening on port 80");
});