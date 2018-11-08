var fs = require('fs');
var path = require('path');

var Canvas = function(path) {
    this.objects = [];
    
    this.getObjects = function() {
        return this.objects;
    };

    this.addObjects = function(obj) {
        this.objects.push(obj);
    };

    this.clear = function() {
        this.objects = [];
    };

    this.saveCanvas = function(path, callback) {
        var objectToSave = {
            'objects': this.objects
        };

        fs.writeFile(path, JSON.stringify(objectToSave), callback);
    };
};

var getCanvasFromFile = function(filePath) {
    try {
        var text = fs.readFileSync(filePath);
        var config = JSON.parse(text);
        var cnv = new Canvas();
        cnv.objects = config.objects;
        return cnv;
    } catch(e) {
        return new Canvas();
    }
};

module.exports = {
    'Canvas': Canvas,
    'getCanvasFromFile': getCanvasFromFile
};