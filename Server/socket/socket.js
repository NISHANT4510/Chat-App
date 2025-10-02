const http = require("http");
const {Server} = require("socket.io");
const express = require("express");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
        methods: ["GET", "POST", "PATCH", "DELETE"],
        credentials: true
    },
    path: '/socket.io/',
});


const getReceiverSocketId = (recipientId) => {
    return userSocketMap[recipientId];
}

const userSocketMap = {}; //userId: socketId

io.on("connection", (socket) =>{
    console.log("user connected", socket.id);
    const userId = socket.handshake.query.userId;

    if(userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }

    // Handle sending messages
    socket.on("sendMessage", (message, callback) => {
        console.log("Received message:", message);
        try {
            const recipientSocketId = getReceiverSocketId(message.receiverId);
            if (recipientSocketId) {
                console.log("Sending message to socket:", recipientSocketId);
                socket.to(recipientSocketId).emit("newMessage", message);
                
                // Acknowledge successful send
                if (typeof callback === 'function') {
                    callback({ success: true });
                }
            } else {
                console.log("Recipient not online:", message.receiverId);
                // Store message for offline delivery or handle accordingly
                socket.emit("messageError", { error: "User is offline" });
                
                if (typeof callback === 'function') {
                    callback({ error: "User is offline" });
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            if (typeof callback === 'function') {
                callback({ error: "Failed to send message" });
            }
            socket.emit("messageError", { error: "Failed to send message" });
        }
    });

    socket.on("disconnect", ()=>{
        console.log("user disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

module.exports = {io, server, app, getReceiverSocketId}