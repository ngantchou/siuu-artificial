//node version: v9.10.0
//module versions:
//rlp@2.0.0
//keccak@1.4.0

const rlp = require('rlp');
const keccak = require('keccak');

var nonce = 0x00; //The nonce must be a hex literal!
var sender = '0x8b7CDe4C9B374a3FE82a353d0595C712806Ef5Ec'; //Requires a hex string as input!

var input_arr = [ sender, nonce ];
var rlp_encoded = rlp.encode(input_arr);

var contract_address_long = keccak('keccak256').update(rlp_encoded).digest('hex');

var contract_address = contract_address_long.substring(24); //Trim the first 24 characters.
console.log("contract_address: " + contract_address);