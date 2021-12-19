const Blockchain = require("./blockchain");

const bitcoin = new Blockchain();

//***test creating New Block***

// bitcoin.createNewBlock(3000,"KFJDKFSFJFEUFS","FGEFJFWJFKFJEWFKJFW");

// console.log(bitcoin);




//***test creating New Transaction and add it to block***

//created  a new block
// bitcoin.createNewBlock(3000,"HFJDFKJSFJFSKJF","FSFKJSHFSJFKJFJKS");

//generated new transaction
// bitcoin.createNewTransaction(250,"DASDHJFDJFSDJKF","AKJBFDSFBFBSDKFS");
// bitcoin.createNewTransaction(250,"DASDHJFDJFSDJKF","AKJBFDSFBFBSDKFS");
// bitcoin.createNewTransaction(300,"DASDHJFDJFSDJKF","AKJBFDSFBFBSDKFS");
//created new block again all transaction will be pushed in newly mined block
//bitcoin.createNewBlock(4000,"HFJDFKJSFJFSKJF","FSFKJSHFSJFKJFJKS");

//console.log(bitcoin);
//console.log(bitcoin.chain[1]);


//***Test hashing Block ***

// const previousBlockHash ="DASDFSDFJFNSKFJKSDNV";
// const currentBlockData =[
//     {
//         amount:200,
//         sender:"1DAJDAKJFBAKJFBAKJFADA",
//         recipient:"1RJAFJAFJKFNJFNJFFAA"
//     },
//     {
//         amount:250,
//         sender:"2DAJDAKJFBAKJFBAKJFADA",
//         recipient:"2RJAFJAFJKFNJFNJFFAA"
//     },
//     {
//         amount:300,
//         sender:"3DAJDAKJFBAKJFBAKJFADA",
//         recipient:"3RJAFJAFJKFNJFNJFFAA"
//     }
// ];
// const nonce = 3000;
// console.log( bitcoin.hashBlock(previousBlockHash,currentBlockData,nonce));


//***Test Proof of Work  ***


// const previousBlockHash ="DASDFSDFJFNSKFJKSDNV";
// const currentBlockData =[
//     {
//         amount:200,
//         sender:"1DAJDAKJFBAKJFBAKJFADA",
//         recipient:"1RJAFJAFJKFNJFNJFFAA"
//     },
//     {
//         amount:250,
//         sender:"2DAJDAKJFBAKJFBAKJFADA",
//         recipient:"2RJAFJAFJKFNJFNJFFAA"
//     },
//     {
//         amount:300,
//         sender:"3DAJDAKJFBAKJFBAKJFADA",
//         recipient:"3RJAFJAFJKFNJFNJFFAA"
//     }
// ];


// console.log(  bitcoin.proofOfWork(previousBlockHash, currentBlockData)  );


//test validation of chain

const bc1 =
{
    "chain": [
    {
    "index": 1,
    "timestamp": 1588171997460,
    "transactions": [],
    "nonce": 100,
    "hash": "0",
    "previousBlockHash": "0"
    },
    {
    "index": 2,
    "timestamp": 1588172025645,
    "transactions": [
    {
    "amount": 90,
    "sender": "NANANANANANANANA33",
    "recipient": "HAHAHAHAHAHAHAHA12",
    "TransactionId": "31ed50f08a2911eab05d15df8c513c41"
    }
    ],
    "nonce": 4334,
    "hash": "0000ab23c7ad1046edb2a8c03e605850a574bbc68678406a2318bae658788ee5",
    "previousBlockHash": "0"
    },
    {
    "index": 3,
    "timestamp": 1588172067277,
    "transactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "290336308a2911eab05d15df8c513c41",
    "TransactionId": "39d405708a2911eab05d15df8c513c41"
    },
    {
    "amount": 100,
    "sender": "NANANANANANANANA33",
    "recipient": "HAHAHAHAHAHAHAHA12",
    "TransactionId": "4bb162b08a2911eab05d15df8c513c41"
    }
    ],
    "nonce": 30094,
    "hash": "00000041f3740ce659cbd8179f1622c45875d18cc11f140e5534884568a369e4",
    "previousBlockHash": "0000ab23c7ad1046edb2a8c03e605850a574bbc68678406a2318bae658788ee5"
    }
    ],
    "pendingTransactions": [
    {
    "amount": 12.5,
    "sender": "00",
    "recipient": "290336308a2911eab05d15df8c513c41",
    "TransactionId": "52a0e5f08a2911eab05d15df8c513c41"
    }
    ],
    "currentNodeUrl": "http://localhost:3001",
    "networkNodes": []
    }

    console.log("Is chain valid "+ bitcoin.chainIsValid(bc1.chain));
    
