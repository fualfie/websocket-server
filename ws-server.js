const WebSocket = require('ws');

class WS {
    constructor(port = 3993, host = '0.0.0.0', log = false) {
        this.host = host
        this.port = port
        this.online = {}
        this.tag = '[WS]'
        this.log = log
    }
    start() {
        let self = this
        self.server = new WebSocket.Server({ port: self.port, host: self.host }, () => {
            self.tag = `[WS:${self.server.address().port}]`
            console.log(`Websocket Server start on ${self.server.address().address}:${self.server.address().port}`)
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
            if (self.log) console.log(`${self.tag} <--> ${clientName}`);
            self.online[clientName] = clientName

            self.broadcast('online->' + Object.keys(self.online).length)

            ws.on('message', function incoming(message) {
                if (self.log) console.log(`${self.tag} <--- ${message} from ${clientName}`);
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
        if (this.log) console.log(`${this.tag} ---> ${message}`);
        return this
    }
}

module.exports = WS