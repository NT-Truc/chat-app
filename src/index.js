const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');

//utils
const utils = require("../utils/index.js");
//const {genergateMessage} = require("../utils/index.js")
const { createUser, getUserInfo, getUsersInRoom, removeUser } = require("../db/user.js");


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, "../public");

app.use(express.static(publicDirectory));


io.on("connection", (socket) => {
    console.log("New websocket connection");
    //Create Room
    socket.on("joinRoom", function ({ _id, username, room }) {
        //create room
        createUser(socket.id, username, room);
        socket.join(room); //A
        socket.emit("message", utils.genergateMessage("Admin", "Welcome " + username + " !"));

        io.to(room).emit("roomData", {
            room: room,
            users: getUsersInRoom(room),
        });

        socket.broadcast
            .to(room)
            .emit("message", utils.genergateMessage("Admin", `${username} has joined the group!`));
    });

    //socket.emit
    socket.on("sendMessage", (message, callback) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback("Profanity is not allowed!");
        }
        const user_info = getUserInfo(socket.id);
        console.log(user_info);
        io.to(user_info.room).emit("message", utils.genergateMessage(user_info.username, message));
        callback("Ok server");
    });


    //Server nhận và gửi location cho client
    socket.on("sendLocation", (coords, callback) => {
        io.emit("locationMessage", utils.genergateLocationMessage(coords.lat, coords.long));
        callback();
    });

    //Server nhận và gửi thông báo client rời khỏi phòng
    socket.on("disconnect", () => {
        const user = getUserInfo(socket.id);
        if (user) {
            removeUser(socket.id);
            io.to(user.room).emit("roomData", {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
            io.to(user.room).emit("message", utils.genergateMessage("Admin", user.username + " has left the group!"));

        }
        console.log(user);
    });
});


server.listen(port, () => {
    console.log("Server is listen on port: " + port);
});