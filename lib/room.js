var ClientsPool = require('./clients').ClientsPool;
var Canvas = require('./canvas').Canvas;
var msg = require('./message');
var libfunc = require('./func');

var ROOM_ID_LENGTH = 15;

/**
 * @constructor
 * @param {ClientsPool} clientsPool Structure that helds clients info of room 
 * @param {Canvas} canvasObject Structure that helds canvas object
 * @param {Object=} options Some options 
 */
var Room = function(clientsPool, canvasObject, options) {
    this.clientsPool = clientsPool;
    this.canvasObject = canvasObject;
    this.id = libfunc.generateId(ROOM_ID_LENGTH);

    this.updateAll = function(expt, dataObject) {
        this.clientsPool.sendAll(msg.getUpdate(dataObject), expt);
    };
    
    this.sendUpdateFullCanvas = function(clientId) {
        this.clientsPool.sendTo(clientId, msg.getInit(this.canvasObject.getObjects()));
    };
    
    this.sendUpdate = function(clientsId, objects) {
        this.clientsPool.sendTo(clientsId, msg.getUpdate(objects));
    };
    
    this.sendClearAll = function(expt) {
        this.clientsPool.sendAll(msg.getClear(), expt);
    };
    
    this.sendError = function(clientId, what) {
        this.clientsPool.sendTo(clientId, msg.getError(what));
    };

    this.backUpCanvas = function(filePath, callback) {
        this.canvasObject.saveCanvas(filePath, callback);
    };

    this.removeClient = function(clientId) {
        this.clientsPool.deleteClient(clientId);
    };

    this.addObjectToCanvas = function(shape) {
        this.canvasObject.addObjects(shape);
    };

    this.clearCanvas = function() {
        this.canvasObject.clear();
    };
};

module.exports = {
    'Room': Room
};