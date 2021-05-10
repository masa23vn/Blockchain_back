const _ = require('lodash');
const { savePoolToFile } = require('./File')
const { Transaction, TxIn, UnspentTxOut, validateTransaction } = require('./transaction');
const fs = require('fs');

let transactionPool = [];

const getTransactionPool = () => {
    return _.cloneDeep(transactionPool);
};

const setPool = (pool, unspentTxOuts) => {
    let temp = [];
    for (let i = 0; i < pool.length; i++) {
        if (!validateTransaction(pool[i], unspentTxOuts)) {
            continue
        }
        temp.push(pool[i])
    }
    transactionPool = _.cloneDeep(temp);
}

const addToTransactionPool = (tx, unspentTxOuts) => {

    if (!validateTransaction(tx, unspentTxOuts)) {
        throw Error('Trying to add invalid tx to pool');
    }

    if (!isValidTxForPool(tx, transactionPool)) {
        throw Error('Trying to add invalid tx to pool');
    }
    transactionPool.push(tx);
    savePoolToFile(transactionPool)
};

const hasTxIn = (txIn, unspentTxOuts) => {
    const foundTxIn = unspentTxOuts.find((uTxO) => {
        return uTxO.txOutId === txIn.txOutId && uTxO.txOutIndex === txIn.txOutIndex;
    });
    return foundTxIn !== undefined;
};

const updateTransactionPool = (unspentTxOuts) => {
    const invalidTxs = [];
    for (const tx of transactionPool) {
        for (const txIn of tx.txIns) {
            if (!hasTxIn(txIn, unspentTxOuts)) {
                invalidTxs.push(tx);
                break;
            }
        }
    }
    if (invalidTxs.length > 0) {
        transactionPool = _.without(transactionPool, ...invalidTxs);
        savePoolToFile(transactionPool)
    }
};

const getTxPoolIns = (aTransactionPool) => {
    return _(aTransactionPool)
        .map((tx) => tx.txIns)
        .flatten()              // remove 1 outer array
        .value();               // perform all library lodash function 
};

const isValidTxForPool = (tx, aTtransactionPool) => {
    const txPoolIns = getTxPoolIns(aTtransactionPool);

    const containsTxIn = (txIns, txIn) => {
        return _.find(txPoolIns, ((txPoolIn) => {
            return txIn.txOutIndex === txPoolIn.txOutIndex && txIn.txOutId === txPoolIn.txOutId;
        }));
    };

    for (const txIn of tx.txIns) {
        if (containsTxIn(txPoolIns, txIn)) {
            console.log('txIn already found in the txPool');
            return false;
        }
    }
    return true;
};

module.exports = { addToTransactionPool, getTransactionPool, updateTransactionPool, setPool };