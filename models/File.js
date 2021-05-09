const fs = require('fs');

const saveBlockchainToFile = (blockchain) => {
    try {
        fs.writeFileSync('keys/chain.json', JSON.stringify(blockchain));
    } catch (err) {
        console.log(err)
    }
}

const readBlockchainFromFile = () => {
    try {
        const data = JSON.parse(fs.readFileSync('keys/chain.json', 'utf8'));
        return data
    } catch (err) {
        console.log(err)
        return []
    }
}

const savePoolToFile = (transactionPool) => {
    try {
        fs.writeFileSync('keys/tx.json', JSON.stringify(transactionPool));
    } catch (err) {
        console.log(err)
    }

}

const readPoolFromFile = () => {
    try {
        const data = JSON.parse(fs.readFileSync('keys/tx.json', 'utf8'));
        return data
    } catch (err) {
        console.log(err)
        return []
    }
}

module.exports = {
    saveBlockchainToFile,
    readBlockchainFromFile,
    savePoolToFile,
    readPoolFromFile
};