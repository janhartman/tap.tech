'use strict';

var express = require('express');
var fs = require('fs');
var path = require('path');
var cors = require('cors');
var app = express();

app.use(cors());

var games = require('./game.json');

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

app.listen(80, function() {
   console.log("Web server listening on port 80");
});