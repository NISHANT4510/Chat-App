const http = require("http");
const {Server} = require("socket.io");
const express = require("express");

const app = express();
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PATCH", "DELETE"],
    },
});


const getReceiverSocketId = (recipientId) => {
    return userSocketMap[recipientId];
}

const userSocketMap = {}; //userId: socketId

io.on("connection", (socket) =>{
    console.log("user connected", socket.id);
    const userId = socket.handshake.query.userId;

    if(userId != "undefined") userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", ()=>{
        console.log("user disconnected");
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object,keys(userSocketMap));
    });
});

module.exports = {io, server, app, getReceiverSocketId}