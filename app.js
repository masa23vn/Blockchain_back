const express = require("express");
const cors = require("cors");
require('console-stamp')(console, '[HH:MM:ss.l]');
require('dotenv').config()
const http = require("http")
const createError = require('http-errors');
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
// const URL = process.env.API;
// app.use(cors({
//   origin: [URL]
// }));

const { Block, generateNextBlock, getBlockchain, generatenextBlockWithTransaction,
  getAccountBalance, getLatestBlock
} = require('./models/Blockchain');

const { connectToPeers, getSockets, initP2PServer } = require('./socket/p2p');
const { initWallet } = require('./models/wallet');

const httpPort = parseInt(process.env.HTTP_PORT) || 9000;
const p2pPort = parseInt(process.env.P2P_PORT) || 3000;

app.get('/blocks', (req, res) => {
  res.send(getBlockchain());
});
app.get('/balance', (req, res) => {
  const balance = getAccountBalance();
  res.send({ 'balance': balance });
});

app.post('/mineBlock', (req, res) => {                 //  reward for miner, but without transaction
  const newBlock = generateNextBlock();
  if (newBlock === null) {
    res.status(400).send('could not generate block');
  } else {
    res.send(newBlock);
  }
});

app.post('/mineTransaction', (req, res) => {           //  reward for miner and with transaction
  const address = req.body.address;
  const amount = Number(req.body.amount);
  try {
    const resp = generatenextBlockWithTransaction(address, amount);
    res.send(resp);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
});

app.get('/peers', (req, res) => {
  res.send(getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
});

app.post('/addPeer', (req, res) => {
  connectToPeers(req.body.peer);
  res.send();
});


// catch 404 and forward to error handler
app.use(function (err, req, res, next) {
  console.log(err)
});


app.listen(httpPort, () => {
  console.log('Listening http on port: ' + httpPort);
});

initP2PServer(p2pPort);
initWallet();

