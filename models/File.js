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
        const file = fs.readFileSync('keys/chain.json', 'utf8')
        if (file === '') {
            return null
        }
        const data = JSON.parse(file);
        return data
    } catch (err) {
        console.log(err)
        return null
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
        const file = fs.readFileSync('keys/tx.json', 'utf8')
        if (file === '') {
            return null
        }
        const data = JSON.parse(file);
        return data
    } catch (err) {
        console.log(err)
        return null
    }
}

module.exports = {
    saveBlockchainToFile,
    readBlockchainFromFile,
    savePoolToFile,
    readPoolFromFile
};