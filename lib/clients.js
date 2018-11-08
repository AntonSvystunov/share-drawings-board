var ClientsPool = function() {
    this.clients = {};

    this.addClient = function(socket) {
        var id = Math.random();
        var newClient = {
            'clientId': id,
            'socket': socket
        };
        this.clients[id] = newClient;
        return id;
    };

    this.deleteClient = function(id) {
        delete this.clients[id];
    };

    this.sendTo = function(id, data) {
        var client = this.clients[id];
        if (client && client.socket) {
            if (client.socket.readyState == 1) {
                client.socket.send(JSON.stringify(data));
            } else {
                client.socket.close();
                this.deleteClient(id);
            }
        }
    };

    this.sendAll = function(data, except) {
        for (var clientId in this.clients) {
            if (clientId != except) {
                if (this.clients.hasOwnProperty(clientId)) {
                    this.sendTo(clientId, data);
                }
            }
        }
    };
};

module.exports = {
    'ClientsPool': ClientsPool
};