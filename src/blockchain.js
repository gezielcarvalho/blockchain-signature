const sha256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction {
    constructor(fromAddress,toAddress,amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    calculateHash(){
        sha256(this.fromAddress,this.toAddress,this.amount).toString();
    }

    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('You cannot sign transactions for other wallets!');
        }
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx,'base64');
        this.signature = sig.toDER('hex');
    }

    isValid(){
        if(this.fromAddress === null) return true;

        if (!this.signature || this.signature.length === 0){
            throw new Error('Transaction is not valid!');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex')

        return publicKey.verify(this.calculateHash(),this.signature)
    }
}

class Block {
    constructor(timestamp, transactions, previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    calculateHash(){
        return sha256(this.timestamp + JSON.stringify(this.transactions) + this.previousHash + this.nonce).toString();
    }

    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty)!=="".padStart(difficulty,"1")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined. Hash: "+this.hash);
        console.log("Nonce: "+this.nonce);
    }

    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

class BlockChain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 4;
        this.pendingTransactions = [];
        this.miningReward = 50;
    }

    createGenesisBlock() {
        return new Block(Date.now(), "Genesis block", "0");
    }

    getLatesBlock(){
        return this.chain[this.chain.length-1];
    }

    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions,"0");
        block.previousHash = this.getLatesBlock().hash;
        block.mineBlock(this.difficulty);
        console.log("Block successfully mined!");
        this.chain.push(block);
        this.pendingTransactions = [
            new Transaction(null,miningRewardAddress,this.miningReward)
        ];
    }

    addTransaction(transaction){

        if(!transaction.fromAddress || !transaction.toAddress)
            throw new Error('Incomplete addresses');

        if(!transaction.isValid())
            throw new Error('Cannot add invalid transaction');

        this.pendingTransactions.push(transaction);
    }

    getBalanceOfAdrress(address){
        let balance = 0;

        for (const block of this.chain) {
            for (const transaction of block.transactions) {
                if(transaction.fromAddress === address){
                    balance -= transaction.amount;
                }
                if(transaction.toAddress === address){
                    balance += transaction.amount;
                }
            }
        }
        return balance;
    }

    isChainValid(){
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i];
            if(!currentBlock.hasValidTransactions()) return false; 
            if(currentBlock.hash !== previousBlock.calculateHash()) return false;
            if (currentBlock.previousHash !== previousBlock.hash) return false;
        }
        return true;
    }
    
}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;