import http from 'node:http'
import { Server } from 'socket.io'
import app from './app.js'
import { env } from './config/env.js'

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: env.clientOrigin,
    credentials: true,
  },
})

io.on('connection', (socket) => {
  socket.emit('system:boot', {
    channel: 'relay-room',
    onlineAt: new Date().toISOString(),
  })
})

server.listen(env.port, () => {
  console.log(`Last Message backend listening on http://localhost:${env.port}`)
})
