const WebSocket = require('ws');

class WS {
    constructor(port = 3993, host = '0.0.0.0') {
        this.host = host
        this.port = port
        this.online = {}
        this.tag = '[ws]'
    }
    start() {
        let self = this
        self.server = new WebSocket.Server({ port: self.port, host: self.host }, () => {
            self.tag = `[ws://${self.server.address().address}:${self.server.address().port}]`
            console.log(self.tag, 'Server start')
        });

        self.server.on('open', function open() {
            // console.log('connected');
        });

        self.server.on('close', function close() {
            // console.log('disconnected');
        });


        self.server.on('connection', function connection(ws, req) {
            let ip =
                (req.headers["x-forwarded-for"] || "").split(",").pop() ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
            // let ip = req.connection.remoteAddress;
            let port = req.connection.remotePort;
            let clientName = ip + ':' + port;
            console.log(self.tag + ' <--> %s', clientName)

            self.online[clientName] = clientName

            self.broadcast('online->' + Object.keys(self.online).length)

            ws.on('message', function incoming(message) {
                console.log(self.tag + ' <--- %s from %s', message, clientName);
                self.broadcast(message)
            });
            ws.on('close', () => {
                delete self.online[clientName]
                self.broadcast('online->' + Object.keys(self.online).length)
            })
            // ws.send(message);
        });
        return self
    }
    broadcast(message) {
        this.server.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
        console.log(this.tag + ' ---> %s to all', message);
        return this
    }
}

module.exports = WS