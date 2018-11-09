var http = require('http');
var ws = require('ws');
var path = require('path');

var serveFunction = require('./lib/httpserver');
var Canvas = require('./lib/canvas');
var ClientsPool = require('./lib/clients').ClientsPool;
var msg = require('./lib/message');
var libfunc = require('./lib/func');
var rooms = require('./lib/room');

var TEMP_FILE_PATH = path.join(__dirname + '/temp/last.json');

var canvasObject = Canvas.getCanvasFromFile(TEMP_FILE_PATH);
var clientsPool = new ClientsPool();

var mainRoom = new rooms.Room(clientsPool, canvasObject);

setInterval(function() { 
    mainRoom.backUpCanvas(TEMP_FILE_PATH, function(err) {
        if (!err) {
            libfunc.log('Canvas saved!');
        } else {
            libfunc.log(true, 'Could not save canvas!', err);
        }
    });
}, 6000);


var httpServer = http.createServer(serveFunction);
var sockServer = new ws.Server({
    'server': httpServer
});

sockServer.on('connection', function(socket) {
    var id = clientsPool.addClient(socket);
    libfunc.log(id + ' joined');

    mainRoom.sendUpdateFullCanvas(id);

    socket.on('message', function(data) {
        var parsedObject = libfunc.parseJSON(data);
        if (parsedObject && parsedObject.type) {
            //libfunc.log('id: ' + id + ' type: ' + parsedObject.type);
            serveQuery(id, parsedObject);
        } else {
            mainRoom.sendError(id);
        }
    });

    socket.on('close', function(code, reason) {
        libfunc.log(id + ' disconected (' + code + ', ' + reason + ')');
        mainRoom.removeClient(id);
    });

    socket.on('error', function(err) {
        libfunc.log(true, err);
        mainRoom.removeClient(id);
    });
});

function serveQuery(id, query) {
    switch (query.type) {
        case 'update':
            mainRoom.sendUpdateFullCanvas(id);
            break;
        case 'put':
            mainRoom.addObjectToCanvas(query.body);
            mainRoom.updateAll(id, query.body);
            break;
        case 'clear':
            mainRoom.clear();
            mainRoom.sendClearAll(id);
            break;
        default:
            mainRoom.sendError(id);
    }
};

httpServer.listen(3000, function() {
    libfunc.log('App is running on port 3000');
});

