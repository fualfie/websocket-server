# websocket-server
  websocket server

  npm adduser
  npm publish --access public

## create on server
```js
//setup
let ws = new WebSocket(3993, '0.0.0.0', true)
ws.start()
//broadcating
ws.broadcast('hello world')
```

