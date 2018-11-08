var http = require('http');
var ws = require('ws');
var path = require('path');

var serveFunction = require('./lib/httpserver');
var Canvas = require('./lib/canvas');
var ClientsPool = require('./lib/clients').ClientsPool;
var msg = require('./lib/message');
var libfunc = require('./lib/func');

var TEMP_FILE_PATH = path.join(__dirname + '/temp/last.json');

var canvasObject = Canvas.getCanvasFromFile(TEMP_FILE_PATH);

setInterval(function() {
    canvasObject.saveCanvas(TEMP_FILE_PATH, function(err) {
        if (!err) {
            libfunc.log('Canvas saved!');
        } else {
            libfunc.log(true, 'Could not save canvas!', err);
        }
    });
}, 6000);

var clientsPool = new ClientsPool();

var httpServer = http.createServer(serveFunction);
var sockServer = new ws.Server({
    'server': httpServer
});

sockServer.on('connection', function(socket) {
    var id = clientsPool.addClient(socket);
    libfunc.log(id + ' joined');

    sendUpdateFullCanvas(id, canvasObject.getObjects());

    socket.on('message', function(data) {
        var parsedObject = libfunc.parseJSON(data);
        if (parsedObject && parsedObject.type) {
            //libfunc.log('id: ' + id + ' type: ' + parsedObject.type);
            serveQuery(id, parsedObject);
        } else {
            sendError(id);
        }
    });

    socket.on('close', function(code, reason) {
        libfunc.log(id + ' disconected (' + code + ', ' + reason + ')');
        clientsPool.deleteClient(id);
    });

    socket.on('error', function(err) {
        libfunc.log(true, err);
        clientsPool.deleteClient(id);
    });
});

function serveQuery(id, query) {
    switch (query.type) {
        case 'update':
            sendUpdateFullCanvas(id);
            break;
        case 'put':
            canvasObject.addObjects(query.body);
            updateAll(id, query.body);
            break;
        case 'clear':
            canvasObject.clear();
            sendClearAll(id);
            break;
        default:
            sendError(id);
    }
};


function updateAll(expt, dataObject) {
    clientsPool.sendAll(msg.getUpdate(dataObject), expt);
};

function sendUpdateFullCanvas(id) {
    clientsPool.sendTo(id, msg.getInit(canvasObject.getObjects()));
};

function sendUpdate(id, objects) {
    clientsPool.sendTo(id, msg.getUpdate(objects));
};

function sendClearAll(id) {
    clientsPool.sendAll(msg.getClear(), id);
};

function sendError(id, what) {
    clientsPool.sendTo(id, msg.getError(what));
};

httpServer.listen(3000, function() {
    libfunc.log('App is running on port 3000');
});

