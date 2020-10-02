var WS = function (host, port, handler, reconnect) {
    host = host || 'localhost'
    port = port || 3993
    var times = 0
    var socket, send, online, timer;
    if (!window.WebSocket) window.WebSocket = window.MozWebSocket;
    if (window.WebSocket) {
        function connect() {
            socket = new WebSocket("ws://" + host + ":" + port);
            send = function (message) {
                if (socket.readyState == WebSocket.OPEN) socket.send(message);
            }
            socket.onopen = function (event) { };
            socket.onmessage = function (event) {
                let message = event.data
                if (message && message.indexOf('->') > -1) {
                    if (message.indexOf('online') > -1) online = message.split('->')[1]
                    message = ''
                }
                if (handler) handler(message, online, send)
            };
            socket.onerror = function (error) { console.log('connection failed') };
            socket.onclose = function (event) {
                timer = setTimeout(function () {
                    connect();
                    if (reconnect) {
                        if (reconnect <= times) clearTimeout(timer)
                        times++
                    }
                }, 2000);
            };
            socket.onerror = function (error) {
                socket.close();
            }
        }
        connect()
    }
    return { send }
}