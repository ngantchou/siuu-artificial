// //node version: v9.10.0
// //module versions:
// //rlp@2.0.0
// //keccak@1.4.0

// const rlp = require('rlp');
// const keccak = require('keccak');

// var nonce = 0x00; //The nonce must be a hex literal!
// var sender = '0x8b7CDe4C9B374a3FE82a353d0595C712806Ef5Ec'; //Requires a hex string as input!

// var input_arr = [ sender, nonce ];
// var rlp_encoded = rlp.encode(input_arr);

// var contract_address_long = keccak('keccak256').update(rlp_encoded).digest('hex');

// var contract_address = contract_address_long.substring(24); //Trim the first 24 characters.
// console.log("contract_address: " + contract_address);

// var Web3 = require('web3')
// var web3 = new Web3(new Web3.providers.HttpProvider('http://167.99.192.187:8545'));


// web3.currentProvider.send({
//     method: "debug_traceTransaction",
//     params: ['0x3684f071b34da1116282ee88a106a8f2a266d273ef7d8964957f65128fb58d77',{}],
//     jsonrpc: "2.0",
//     id: "1"
// }, function (err, result) {
//     console.log('aaaa', result)

// });


function stripeSetup() {
    var stripe = require('stripe')('sk_test_4eC39HqLyjWDarjtT1zdp7dc');
  
    stripe.balanceTransactions.retrieve(
      'txn_19XJJ02eZvKYlo2ClwuJ1rbA',
      function(err, balanceTransaction) {
        // asynchronously called
    console.log(balanceTransaction)  
    }
    );
  }


  stripeSetup()