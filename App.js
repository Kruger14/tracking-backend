const express = require('express')
const app = express();
const http = require("http");
const path = require('path');
const socket = require('socket.io');
const server = http.createServer(app);

const io = socket(server);
app.use(express.static('public'));
app.get('/', function (req, res) {
    res.render("index")
})
app.set("view engine", "ejs");
app.set(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
    socket.on("send-location", function (data) {
        io.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", function () {
        io.emit("user-disconnected", socket.id)
    })
})

server.listen(3000);