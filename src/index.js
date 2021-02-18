const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app) // Need to manually create the server so that we can pass the server into socket.io
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome!')) // socket.emit is only sent to that particular client
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`)) // socket.broadcast.emit is sent to everyone but that particular client

        callback()

        // socket.emit, io.emit, socket.broadcast.emit
        // FOR ROOMS: io.to.emit - emits an event to everyone in a specific room; socket.broadcast.to.emit - emits an event to everyone in a specific room except for the user
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to('Boston').emit('message', generateMessage(message)) // io.emit is sent to EVERYONE (all clients)
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit("locationMessage", generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left.`))
        }

    })
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})