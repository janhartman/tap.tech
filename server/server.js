'use strict';

var express = require('express');
var fs = require('fs');
var app = express();

var games = require('./game.json');


/**
 * Get the specified game details.
 */
app.get('/api/games/:gameId', function(req, res) {
   var gameId = req.params.gameId;

   if (gameId == undefined) {
       return res.sendStatus(400);
   }

   if (gameId == "all") {
       return res.send(games);
   }

   for (var game in games) {
       if (game["id"].toString() == gameId.toString()) {
           return res.send(game);
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

app.listen(8080, function() {
   console.log("Web server listening on port 8080");
});