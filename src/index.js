const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app) // Need to manually create the server so that we can pass the server into socket.io
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.emit('message', 'Welcome to my chat app!') // socket.emit is only sent to that particular client
    socket.broadcast.emit('message', 'A new user has joined!') // socket.broadcast.emit is sent to everyone but that particular client

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.emit('message', message) // io.emit is sent to EVERYONE (all clients)
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit("locationMessage", `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left.')
    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})