var WS = function (host, port, handler, reconnect) {
    host = host || 'localhost'
    port = port || 3993
    let times = 0
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
                if (message && message.toString().indexOf('->') > -1) {
                    if (message.toString().indexOf('online') > -1) online = message.toString().split('->')[1]
                    message = ''
                }
                if (handler) handler(message, online, send)
            };
            socket.onclose = function (event) {
                timer = setTimeout(function () {
                    if (reconnect && reconnect <= times) {
                        clearTimeout(timer)
                    }else{
                        connect();
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
    return { send, connect }
}