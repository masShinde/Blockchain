const sha256= require("sha256");
const currentNodeUrl = process.argv[3];
const uuid= require("uuid/v1");


function Blockchain(){
    this.chain =[];
    this.pendingTransactions =[];
    //current Node Url Assignment
    this.currentNodeUrl= currentNodeUrl;
    this.networkNodes =[];
    //creating Genesis Block
    this.createNewBlock(100,"0","0")
}

Blockchain.prototype.createNewBlock= function(nonce,previousBlockHash,hash){
    const newBlock={
        index:this.chain.length+1,
        timestamp:Date.now(),
        transactions:this.pendingTransactions,
        nonce:nonce,
        hash:hash,
        previousBlockHash:previousBlockHash,
    };

    this.pendingTransactions =[];
    this.chain.push(newBlock);

    return newBlock;
}

Blockchain.prototype.getLastBlock =function(){
    return this.chain[this.chain.length-1];
}

Blockchain.prototype.createNewTransaction = function(amount, sender ,recipient){
    const newTransaction ={
        amount:amount,
        sender:sender,
        recipient:recipient,
        transactionId: uuid().split('-').join('')
    };
    return newTransaction;

}

Blockchain.prototype.addTransactionToPendingTransactions= function(transactionObj){
    this.pendingTransactions.push(transactionObj);
    return this.getLastBlock()['index'] + 1;
}

Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce){
    const dataAsString = previousBlockHash+ nonce.toString()+JSON.stringify(currentBlockData);
    const hash =sha256(dataAsString);
    return hash;
}

Blockchain.prototype.proofOfWork= function(previousBlockHash, currentBlockData){
let nonce =0;
let hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);
while(hash.substring(0,4) !== "0000"){
        nonce++;
        hash = this.hashBlock(previousBlockHash,currentBlockData,nonce);
        //below line will log each hash generated
        //console.log(hash); 
        
}
 return nonce;
}

Blockchain.prototype.chainIsValid= function(blockchain){
    var validFlag = true;
    
    for (var i = 1; i<blockchain.length; i++){
        const currentBlock = blockchain[i];
      //  console.log("currentBlock:"+currentBlock.hash);
        
        const previousBlock = blockchain[i-1];
       // console.log("prev Block:"+previousBlock.hash);
        
        const blockHash =this.hashBlock(previousBlock['hash'],{transactions: currentBlock['transactions'], index : currentBlock['index']},currentBlock['nonce']);
       
      //  console.log("In the for loop");
        
        if(blockHash.substring(0,4) !== "0000"){
           // console.log("Check string");
            
            validFlag= false;

        }
    
        if(currentBlock['previousBlockHash'] !== previousBlock['hash']){
            //chain is invalid so flag down
            validFlag = false;
        }
      
    };

    const genesisBlock = blockchain[0];
    const correctNonce =  genesisBlock['nonce'] === 100;
    
    const correctPrevBlockHash = genesisBlock['previousBlockHash'] === '0';
    const correctHash = genesisBlock['hash'] === '0';
    const correctTransactions = genesisBlock['transactions'].length === 0;
    
    if (!correctNonce || !correctPrevBlockHash || !correctHash  || !correctTransactions){
        
        validFlag = false;

    }
    
return validFlag;
 
};


Blockchain.prototype.getblock =function(blockHash){
    let correctBlock = null;
    this.chain.forEach(function(block){
        if(block.hash == blockHash){
            correctBlock =block;
        }
    });
    return correctBlock;
};

Blockchain.prototype.getTransaction= function(transactionId){
    let correctTransaction = null;
    let correctBlock = null;
    this.chain.forEach(function(block){
        block.transactions.forEach(function( transaction){
            if(transaction.transactionId == transactionId){
                correctTransaction = transaction;
                correctBlock = block;                
            }
        })
    });
    return {
        transaction :correctTransaction,
        block: correctBlock
    };
};

Blockchain.prototype.getAddressData = function(address){
    const addressTransactions = [];
    this.chain.forEach(function(block){
        block.transactions.forEach(function(transaction){
            if(transaction.sender == address || transaction.recipient == address){
                addressTransactions.push(transaction);
            };
        });
    });
    let balance = 0;
    addressTransactions.forEach(function(transaction){
        if(transaction.recipient == address){
            balance += transaction.amount;
        }
        else if(transaction.sender == address){
            balance -= transaction.amount;
        }
    });
    return {
        addressTransactions : addressTransactions,
        addressBalance : balance
    }
};



module.exports = Blockchain;
