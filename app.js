const express = require("express");
const cors = require("cors");
require('dotenv').config()
const axios = require('axios');
const createError = require('http-errors');
const socketIO = require('socket.io');
const client = require('socket.io-client');
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

const BlockChain = require('./models/Blockchain');
const { connectToPeers, getSockets, initP2PServer } = require('./socket/p2p');

const URL = process.env.API;
app.use(cors({
  origin: [URL]
}));


const blockChain = new BlockChain(null);

app.get('/blocks', (req, res) => {
  res.send(blockChain.getBlockchain());
});
app.post('/mineBlock', (req, res) => {
  const newBlock = blockChain.generateNextBlock(req.body.data);
  res.send(newBlock);
});
app.get('/peers', (req, res) => {
  res.send(getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
});
app.post('/addPeer', (req, res) => {
  connectToPeers(req.body.peer);
  res.send();
});

initP2PServer(process.env.PORT_SOCKET);

app.listen(process.env.PORT, () => {
  console.log('Listening on port: ' + process.env.PORT);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

module.exports = blockChain;