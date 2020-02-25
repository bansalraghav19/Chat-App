const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generteObject} = require('./utils/messagesObject')
const {addUser, removeUser, getUser, getUserInRoom} = require('./utils/users')

const app = express()
const publicDirectory = path.join(__dirname,'../Public')
const port = process.env.PORT||3000
const server = http.createServer(app)
const io = socketio(server)

io.on('connection', (socket) => {
    const filter = new Filter()

    socket.on('join', (options, callback) => {

        const {error, user} = addUser({_Id: socket.id, ...options})
        
        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('sendMsg', generteObject('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('sendMsg',generteObject(`${user.username} has Joined`))
        io.to(user.room).emit('RoomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })
        callback()
    })

    socket.on('message', (msg, callback) => {
        const user = getUser(socket.id)
        if(filter.isProfane(msg)){
            return callback('Profanity Not Allowed')
        }
        io.to(user.room).emit('sendMsg', generteObject(user.username,msg))
        callback()
    })

    socket.on('LocationSend', (msg, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('SendLocMsg',generteObject(user.username,`https://google.com/maps?q=${msg.latitude},${msg.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('sendMsg', generteObject(`${user.username} has Left`))
            io.to(user.room).emit('RoomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })
})

app.use(express.static(publicDirectory))

server.listen(port, () => {
    console.log(`Server is Running on Port ${port}`)
})