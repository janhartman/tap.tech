var path = require('path');
var fs = require('fs');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ks = require('node-key-sender');


var clients = [];

var keyMapping = {};


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/m', function (req, res) {
    res.sendFile(__dirname + '/multiplayer.html');
});


io.on('connection', function (socket) {
    console.info('New client connected (id=' + socket.id + ').');

    console.log('a user connected');
    socket.on('disconnect', function () {
        var index = clients.indexOf(socket);
        if (index != -1) {
            clients.splice(index, 1);
            console.info('Client gone (id=' + socket.id + ').');
        }
    });
});



io.sockets.on('connection', function (socket) {
    socket.on('ukaz', function (data) {
        console.log(data);

    });
});


http.listen(3000, function () {
    console.log('listening on *:3000');
});