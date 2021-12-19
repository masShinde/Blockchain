const express = require("express");
const bodyParser = require("body-parser");
const Blockchain= require("./blockchain");
const uuid = require("uuid/v1");
const port= process.argv[2];
const rp= require("request-promise");

const nodeAddress = uuid().split('-').join('');

const bitcoin= new Blockchain();

var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));


app.get("/blockchain",function(req,res){
    res.send(bitcoin);
  
});

app.post("/transaction",function(req,res){
    
  const newTransaction = req.body;
  const blockIndex =  bitcoin.addTransactionToPendingTransactions(newTransaction);
  res.json({note:"Transaction will be added to block"+blockIndex});
});

//Broadcast transactions
app.post("/transaction/broadcast",function(req,res){
    const NewTransaction = bitcoin.createNewTransaction(req.body.amount,req.body.sender,req.body.recipient);
    bitcoin.addTransactionToPendingTransactions(NewTransaction);
    const requestPromises =[];

    bitcoin.networkNodes.forEach(function(networkNodeUrl){
        const requestOptions={
            uri: networkNodeUrl +'/transaction',
            method: 'POST',
            body:NewTransaction,
            json:true
        }



       requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises).then(function(data){
        res.json({note:"transaction created and broadcast succesfully"});
    });
});


//mine a block and broadcast
app.get("/mine",function(req,res){

    const lastBlock=bitcoin.getLastBlock();
    const previousBlockHash = lastBlock['hash'];
    const currentBlockData = {
        transactions: bitcoin.pendingTransactions,
        index: lastBlock['index']+1
    }
    const nonce = bitcoin.proofOfWork(previousBlockHash,currentBlockData);
    const blockHash= bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

    const newBlock= bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

    const requestPromises= [];

    bitcoin.networkNodes.forEach(function(networkNodeUrl){
        const requestOptions ={
            uri : networkNodeUrl +'/receive-new-block',
            method : 'POST',
            body : {newBlock : newBlock},
            json : true
        }
       requestPromises.push(rp(requestOptions));
    });
    Promise.all(requestPromises).then(function(data){
        const requestOptions ={
            uri : bitcoin.currentNodeUrl +'/transaction/broadcast',
            method : 'POST',
            body : {
                amount : 12.5,
                sender : "00",
                recipient : nodeAddress
            },
            json : true
        }
        return rp(requestOptions);
    })
    .then(function(data){
        res.json({
            note:"New Block mined and broadcast Successfully",
            block: newBlock
        })
    })
});

app.post('/receive-new-block',function(req,res){
     
    const newBlock = req.body.newBlock;
    const lastBlock = bitcoin.getLastBlock();
    const correctHash = lastBlock.hash == newBlock.previousBlockHash;
    const correctIndex = lastBlock['index']+1 == newBlock['index'];

    if(correctHash && correctIndex){
        bitcoin.chain.push(newBlock);
        bitcoin.pendingTransactions =[];
        res.json({
            note : "New Block is received and accepeted.",
            newBlock : newBlock
        })
    }else{
        res.json({
            note: "New Block Rejected ",
            newBlock:newBlock
        })
    }
});

//consensus calling - longest chain rule

app.get('/consensus', function(req,res){
    const requestPromises =[];
    bitcoin.networkNodes.forEach(function(networkNodeUrl){
        const requestOptions ={
            uri: networkNodeUrl = networkNodeUrl+ '/blockchain',
            method:'GET',
            json: true
        }
       requestPromises.push(rp(requestOptions));
    })
    Promise.all(requestPromises)
    .then(function(blockchains){
        
        const currentChainLength = bitcoin.chain.length;
        let maxChainLength = currentChainLength;
        let newLongestChain = null;
        let newPendingTransactions = null;

        blockchains.forEach(function(blockchain){
            if(blockchain.chain.length > maxChainLength){
                maxChainLength = blockchain.chain.length;
                newLongestChain = blockchain.chain;
                newPendingTransactions = blockchain.pendingTransactions;
            };
            
        });

        if(!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))){
            res.json({
                note: "current chain is not replaced.",
                chain : bitcoin.chain
            })
        }else 
         {
            bitcoin.chain = newLongestChain;
            bitcoin.pendingTransactions = newPendingTransactions;
            res.json({
                note:"This chain has been replaced",
                chain: bitcoin.chain
            });
        }

    })
})


//register a node and brodcast on network
app.post("/register-and-broadcast-node",function(req,res){
    const newNodeUrl = req.body.newNodeUrl;
    if(bitcoin.networkNodes.indexOf(newNodeUrl)== -1){
         bitcoin.networkNodes.push(newNodeUrl);
    }
    const regNodesPromises =[];

    bitcoin.networkNodes.forEach(function(networkNodeUrl){
        const requestOptions={
            uri: networkNodeUrl +'/register-node',
            method:'POST',
            body:{newNodeUrl: newNodeUrl},
            json:true
        }
      regNodesPromises.push(rp(requestOptions));
    });
    Promise.all(regNodesPromises).then(function(data){
        const bulkRegisterOptions={
            uri : newNodeUrl +'/register-nodes-bulk',
            method:"POST",
            body:{allNetworkNodes:[ ...bitcoin.networkNodes, bitcoin.currentNodeUrl]},
            json:true
        };
       return rp(bulkRegisterOptions);
    })
    .then(function(data){
        res.json({note :"New Node registered with network Successfully"});
    })
});


//register a node on the node
app.post("/register-node", function(req,res){

    const newNodeUrl = req.body.newNodeUrl;
    const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
    const notcurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;

    if(nodeNotAlreadyPresent && notcurrentNode) bitcoin.networkNodes.push(newNodeUrl);
    res.json({note:"New Node registered successfully with node."})
});

//register multiple nodes at a time on new node
app.post("/register-nodes-bulk",function(req,res){
    const allNetworkNodes= req.body.allNetworkNodes;
    allNetworkNodes.forEach(function(networkNodeUrl) {

    let nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
    //console.log("Node Not Present ALready"+nodeNotAlreadyPresent);
    
    const notcurrentNode= bitcoin.currentNodeUrl !== networkNodeUrl;
    //console.log("not Current Node "+notcurrentNode);
    

    if(nodeNotAlreadyPresent && notcurrentNode)
    { bitcoin.networkNodes.push(networkNodeUrl);
        //console.log(networkNodeUrl);
        
    }
    });
    res.json({note:"Bulk registration successfull."});
});


app.get('/block/:blockHash',function(req,res){
    const blockHash = req.params.blockHash;
    const correctBlock = bitcoin.getblock(blockHash);
    res.json({
        block : correctBlock
    })
});

app.get('/transaction/:transactionId',function(req,res){
    const transactionId = req.params.transactionId;
    const transactionData = bitcoin.getTransaction(transactionId);
    res.json({
        transaction : transactionData.transaction,
        block : transactionData.block
    })
});

app.get('/address/:address',function(req,res){
    const address = req.params.address;
    const addressData = bitcoin.getAddressData(address);
    res.json({
        addressData : addressData
    })
});

app.get('/block-explorer',function(req,res){
    res.sendFile('./blockExplorer/index.html', {root : __dirname});
});



app.listen(port,function(req,res){
    console.log(`working on ${port}...`);
    
})