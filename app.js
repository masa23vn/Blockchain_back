const express = require("express");
const cors = require("cors");
const createError = require('http-errors');
const http = require("http");
const socketIO = require('socket.io');
const client = require('socket.io-client');
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const BlockChain = require('./models/Blockchain');
const config = require("./config/default.json");
const URL = config.HOST.CURRENT;

// socket
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: [URL],
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: [URL]
}));

const blockChain = new BlockChain(null, io);

require('./middlewares/routes.mdw')(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

server.listen(process.env.PORT || config.PORT, () => {
  console.log(`Backend APIs is running at http://localhost:${config.PORT}`)
})

module.exports = io;