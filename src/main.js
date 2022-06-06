const { BlockChain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const myKey = ec.keyFromPrivate('81a31968ade14a68f4087e16fbc9e55803b7c4c7efde8748cde1dbf000bc7115');
const myWalletAddress = myKey.getPublic('hex');

let saveCoin = new BlockChain();

const tx1 = new Transaction(
    myWalletAddress,
    '0475c032f5cb663ad1dbb6064b848af6bb47dcb35357872bc0ac9680fc75bf85068aa51af93e1c187459dbfaa1817689d740031c2fc77ac716e93099508f127df1',
    20);

tx1.signTransaction(myKey);

saveCoin.addTransaction(tx1);

console.log("Starting miner");

saveCoin.minePendingTransactions(myWalletAddress);
saveCoin.minePendingTransactions(myWalletAddress);

console.log("Balance is: "+saveCoin.getBalanceOfAdrress(myWalletAddress));

console.log(JSON.stringify(saveCoin, null, 4));
