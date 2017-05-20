'use strict';
var express = require('express');

var app = express();

app.get('/api/games/:gameName', function(req, res) {
   var gameName = req.params.gameName;

   res.send({name: "test-game", numOfPlayers: 4});
});

app.listen(8080, function() {
   console.log("Web server listening on port 8080");
});