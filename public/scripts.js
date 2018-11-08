var canvas = document.getElementById('canvas');
var radiusInput = document.getElementById('radius');
var colorInput = document.getElementById('color');

var ctx = canvas.getContext('2d');

var URL = 'ws://localhost:3000';
var lastReconnectsMs = 10000;

var socket;
var isDrawing = false;
var shape = 0;
var radius = 15;
var color = 'black';

function toggleShape(code) {
    if (code >= 2 || code < 0)
        shape = 0;
    else
        shape = code;
};

function setRadius(rad) {
    if (rad > 0) {
        radius = rad;
    } else {
        radius = 0;
    }
};

function setColor(c) {
    color = c;
};

function initSocket(address) {
    socket = new WebSocket(address);
    socket.onopen = function() {
        lastReconnectMs = 0;
    };

    socket.onmessage = function(event) {
        try {
            var msg = JSON.parse(event.data);
            if (msg.status == 'ok') {
                if (msg.type == 'update' || msg.type == 'init') {
                    drawObjectsByArray(msg.body);
                } else if (msg.type == 'clear') {
                    clearCanvas();
                } else {
                    console.error('Unknown status: ' +  msg.status);
                }
            } else if (msg.status == 'error') {
                console.error(msg.body);
            }
        } catch(e) {
            console.error(e);
        }        
    };

    socket.onerror = function(event) { 
        console.error('Something went wrong! Reopen page, please');
    };

    socket.onclose = function(event) {    
        console.error('Something went wrong! Reopen page, please');
    };
};

canvas.addEventListener('mousedown', function(e) {
    isDrawing = true;
});

canvas.addEventListener('mousemove', function(e) {
    if (isDrawing) {
        var rect = canvas.getBoundingClientRect();
        var pos = {
            'x': e.clientX - rect.x,
            'y': e.clientY - rect.y
        }

        drawObject(shape, {'pos': pos, 'radius': radius, 'color': color});
        putUpdate(shape, {'pos': pos, 'radius': radius, 'color': color});
    }
});

window.addEventListener('mouseup', function(e) {
    isDrawing = false;
});

canvas.addEventListener('mouseleave', function(e) {
    isDrawing = false;
});

canvas.addEventListener('mouseout', function(e) {
    isDrawing = false;
});


function drawObjectsByArray(objectsArray) {
    for (var i = 0; i < objectsArray.length; ++i) {
        drawObject(objectsArray[i].shape, objectsArray[i].opt);
    }
};

function drawObject(shape, opt) {
    ctx.fillStyle = opt.color;
    if (shape == 0) {
        ctx.beginPath();
        ctx.arc(opt.pos.x, opt.pos.y, opt.radius, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillRect(opt.pos.x - opt.radius/2, opt.pos.y - opt.radius/2, opt.radius, opt.radius);
    }   
    ctx.fillStyle = color;
};

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

function Query(type, body) {
    this.type = type;
    this.body = body;
};

function sendQuery(s, query) {
    if (s.readyState == 1 ) {
        s.send(JSON.stringify(query));
    }
};

function getUpdate() {
    var update = new Query('update');
    sendQuery(socket, update);
};

function putUpdate(shapeCode, opt) {
    var put = new Query('put', {
        'shape': shapeCode,
        'opt': opt
    });
    sendQuery(socket, put);
};

function sendClear() {
    clearCanvas();
    var clear = new Query('clear');
    sendQuery(socket, clear);
};



window.onload = function() {
    initSocket(URL);
};