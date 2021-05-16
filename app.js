const express = require("express");
const cors = require("cors");
require('console-stamp')(console, '[HH:MM:ss.l]');
require('dotenv').config()
const fs = require('fs');
const _ = require('lodash');
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
const URL = process.env.API || "http://localhost:3000";
app.use(cors({
  origin: URL
}));

const { readPoolFromFile, readBlockchainFromFile, saveBlockchainToFile, savePoolToFile } = require('./models/File')
const { getTransactionPool, setPool } = require('./models/transactionPool');
const { getPublicFromWallet, initWallet } = require('./models/wallet');
const { generateNextBlock, getBlockchain, generatenextBlockWithTransaction,
  getAccountBalance, getMyUnspentTransactionOutputs, getUnspentTxOuts, sendTransaction,
  getFinishTransaction, replaceChain, sendTransactionGuess, generateNextBlockGuess, getAccountBalanceGuess,
  getFinishTransactionGuess
} = require('./models/Blockchain');
const { connectToPeers, getSockets, initP2PServer } = require('./socket/p2p');


const httpPort = parseInt(process.env.HTTP_PORT) || 9000;
const p2pPort = parseInt(process.env.P2P_PORT) || 8000;

initWallet();

// read blockchain and pool file
const blockchainLocation = 'keys/chain.json';
const poolLocation = 'keys/tx.json';
if (fs.existsSync(blockchainLocation)) {
  const data = readBlockchainFromFile()
  if (data && data.length > 1) {
    replaceChain(data)
  }
  else {
    saveBlockchainToFile(getBlockchain())
  }
}
else {
  saveBlockchainToFile(getBlockchain())
}

if (fs.existsSync(poolLocation)) {
  const data = readPoolFromFile()
  if (data) {
    setPool(data)
  }
  else {
    savePoolToFile([])
  }
}
else {
  savePoolToFile([])
}

// route
app.get('/blocks', (req, res) => {
  res.send(getBlockchain());
});

app.get('/balance', (req, res) => {
  const balance = getAccountBalance();
  res.send({ 'balance': balance });
});

app.post('/balanceGuess', (req, res) => {
  try {
    const balance = getAccountBalanceGuess(req.body.address);
    res.send({ 'balance': balance });
  }
  catch (error) {
    res.status(400).send(error.message);
  }
});

app.get('/unSpent', (req, res) => {
  res.send(getUnspentTxOuts());
});

app.get('/myUnSpent', (req, res) => {
  res.send(getMyUnspentTransactionOutputs());
});

app.get('/address', (req, res) => {
  const address = getPublicFromWallet();
  res.send({ 'address': address });
});

app.get('/pool', (req, res) => {
  res.send(getTransactionPool());
});

app.get('/finishPool', (req, res) => {
  const pool = getFinishTransaction(getBlockchain());
  res.send(pool);
});

app.post('/finishPoolGuess', (req, res) => {
  try {
    const pool = getFinishTransactionGuess(getBlockchain(), req.body.address);
    res.send(pool);
  }
  catch (error) {
    res.status(400).send(error.message);
  }
});

app.get('/block/:id', (req, res) => {
  const block = _.find(getBlockchain(), { 'index': Number(req.params.id) });
  if (block) {
    res.send(block);
  }
  else {
    res.status(400).send('could not find block');
  }
});

app.get('/transaction/:id', (req, res) => {
  const tx = _(getBlockchain())
    .map((blocks) => blocks.data)
    .flatten()
    .find({ 'id': req.params.id });
  res.send(tx);
});

app.get('/address/:address', (req, res) => {
  const unspentTxOuts =
    _.filter(getUnspentTxOuts(), (uTxO) => uTxO.address === req.params.address);
  res.send({ 'unspentTxOuts': unspentTxOuts });
});

app.get('/peers', (req, res) => {
  res.send(getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
});

app.post('/mineBlock', (req, res) => {                 //  reward for miner, but without transaction
  const newBlock = generateNextBlock();
  if (newBlock === null) {
    res.status(400).send('could not generate block');
  } else {
    res.send(newBlock);
  }
});

app.post('/mineBlockGuess', (req, res) => {                 //  reward for miner, but without transactiontry
  try {
    const newBlock = generateNextBlockGuess(req.body.address);
    if (newBlock === null) {
      res.status(400).send('could not generate block');
    } else {
      res.send(newBlock);
    }
  }
  catch (error) {
    res.status(400).send(error.message);
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

app.post('/sendTransaction', (req, res) => {
  try {
    const address = req.body.address;
    const amount = Number(req.body.amount);
    if (address === undefined || amount === undefined) {
      throw Error('invalid address or amount');
    }
    const resp = sendTransaction(address, amount);
    res.send(resp);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
});

app.post('/sendTransactionGuess', (req, res) => {
  try {
    const resp = sendTransactionGuess(req.body.transaction);
    res.send(resp);
  } catch (e) {
    console.log(e.message);
    res.status(400).send(e.message);
  }
});

app.post('/addPeer', (req, res) => {
  try {
    connectToPeers(req.body.peer);
    res.send(200);
  } catch (e) {
    res.status(400).send(e.message)
  }
});

app.post('/stop', (req, res) => {
  res.send({ 'msg': 'stopping server' });
  process.exit();
});

// catch 404 and forward to error handler
app.use(function (err, req, res, next) {
  console.log(err)
});


app.listen(httpPort, () => {
  console.log('Listening http on port: ' + httpPort);
});

// websocket for other server
initP2PServer(p2pPort);