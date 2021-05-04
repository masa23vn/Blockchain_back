const CryptoJS = require("crypto-js");
const Block = require('./Block');

class Blockchain {
    constructor(blocks, io) {
        this.blocks = blocks || [this.getGenesisBlock()];
        this.currentTransactions = [];
        this.nodes = [];
        this.io = io;
    }

    toString = () => {
        return {
            blocks: this.blocks,
            currentTransactions: this.currentTransactions,
            nodes: this.nodes,
        }
    }

    getGenesisBlock = () => {
        return new Block(0, "0", 1465154705, "my genesis block!!", "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7");
    };

    getLatestBlock() {
        return this.blocks[this.blocks.length - 1];
    }

    getLength() {
        return this.blocks.length;
    }

    calculateHash = (index, previousHash, timestamp, data) => {
        return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
    }

    calculateHashForBlock = (block) => {
        return this.calculateHash(block.index, block.previousHash, block.timestamp, block.data);
    };

    generateNextBlock = (blockData) => {
        const previousBlock = this.getLatestBlock();
        const nextIndex = previousBlock.index + 1;
        const nextTimestamp = new Date().getTime() / 1000;
        const nextHash = this.calculateHash(nextIndex, previousBlock.hash, nextTimestamp, blockData);
        return new Block(nextIndex, previousBlock.hash, nextTimestamp, blockData, nextHash);
    };


    isValidNewBlock = (newBlock, previousBlock) => {
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        }
        else if (previousBlock.hash !== newBlock.previousHash) {
            console.log('invalid previoushash');
            return false;
        }
        else if (this.calculateHashForBlock(newBlock) !== newBlock.hash) {
            console.log('invalid hash');
            return false;
        }
        return true;
    };

    isValidChain = (blockchainToValidate) => {
        if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.getGenesisBlock())) {
            return false;
        }
        for (var i = 1; i < blockchainToValidate.length; i++) {
            if (!this.isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i - 1])) {
                return false;
            }
        }
        return true;
    };

    replaceChain = (newBlocks) => {
        if (this.isValidChain(newBlocks) && newBlocks.length > this.blocks.length) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.blocks = newBlocks;
            return true;
            //broadcast(responseLatestMsg());
        } else {
            console.log('Received blockchain invalid');
            return false;
        }
    };

    addBlock = (newBlock) => {
        if (this.isValidNewBlock(newBlock, this.getLatestBlock())) {
            this.blocks.push(newBlock);
        }
    };

    /*
    addNode(node) {
        this.nodes.push(node);
    }

    mineBlock(block) {
        this.blocks.push(block);
        console.log('Mined Successfully');
        this.io.emit(actions.END_MINING, this.toArray());
    }

    async newTransaction(transaction) {
        this.currentTransactions.push(transaction);
        if (this.currentTransactions.length === 2) {
            console.info('Starting mining block...');
            const previousBlock = this.lastBlock();
            process.env.BREAK = false;
            const block = new Block(previousBlock.getIndex() + 1, previousBlock.hashValue(), previousBlock.getProof(), this.currentTransactions);
            const { proof, dontMine } = await generateProof(previousBlock.getProof());
            block.setProof(proof);
            this.currentTransactions = [];
            if (dontMine !== 'true') {
                this.mineBlock(block);
            }
        }
    }
    */
}

module.exports = Blockchain;
