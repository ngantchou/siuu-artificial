//This module help to listen request
var express = require("express");
var router = express.Router();
const Web3 = require("web3");
const web3 = new Web3();
const ethUtil = require("ethereumjs-util");
const ethereum_address = require("ethereum-address");
var abi = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_from", type: "address" },
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "cap",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_amount", type: "uint256" },
    ],
    name: "mint",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_subtractedValue", type: "uint256" },
    ],
    name: "decreaseApproval",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_contributors", type: "address[]" },
      { name: "_balances", type: "uint256[]" },
    ],
    name: "multisendToken",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_addedValue", type: "uint256" },
    ],
    name: "increaseApproval",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "remaining", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "Mint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "previousOwner", type: "address" },
      { indexed: true, name: "newOwner", type: "address" },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
];

web3.setProvider(
  new web3.providers.HttpProvider(
    "https://mainnet.infura.io/v3/f94bc58a280645dba2eff3e86a959b10"
  )
);

// var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/f94bc58a280645dba2eff3e86a959b10'));

router.get("/fetchtx/:hash", async (req, res) => {
  try {
    const reciept = await web3.eth.getTransaction(req.params.hash);
    let transaction2 = await web3.eth.getTransactionReceipt(req.params.hash);

    if (reciept == null) {
      return res.status(200).json({
        msg:
          "Transaction is in mining state. For more info please watch transaction hash on etherscan explorer",
        hash: req.params.hash,
        statuscode: 2,
      });
    } else if (transaction2.status == false) {
      return res.status(200).json({
        reciept: reciept,
        statuscode: 0,
        message: "transaction failed",
        status: "failed",
      });
    } else if (transaction2.status == true) {
      return res.status(200).json({
        reciept: reciept,
        statuscode: 1,
        message: "transaction success",
        status: "success",
      });
    } else {
      return res.status(200).json({
        reciept,
        statuscode: 1,
      });
    }
  } catch (e) {
    return res.status(200).json({
      msg: "invalid transaction reciept",
      e,
      statuscode: 4,
    });
  }
});

// let contract = new web3.eth.Contract(abi, contractAddress);
router.post("/transfer", async function (request, response) {
  let fromAddress = request.body.from_address;
  let privateKey = request.body.from_private_key;
  let toAddress = request.body.to_address;
  let tokenValue = request.body.value;
  let contractAddress = "0x3f8C74F50c67273993C85aCC963FeACCB5C074f4";

  try {
    if (!privateKey.startsWith("0x")) {
      privateKey = "0x" + privateKey;
    }
    let bufferedKey = ethUtil.toBuffer(privateKey);
    console.log("xxx");

    if (
      ethereum_address.isAddress(fromAddress) &&
      ethereum_address.isAddress(fromAddress) &&
      ethUtil.isValidPrivate(bufferedKey)
    ) {
      const contract = await new web3.eth.Contract(abi, contractAddress);
      let count = await web3.eth.getTransactionCount(fromAddress);

      web3.eth.defaultAccount = fromAddress;

      console.log("0000000");
      console.log("toKEN leynt, ", tokenValue.length);

      for (let i = 0; i < tokenValue.length; i++) {
        tokenValue[i] = web3.utils.toWei(tokenValue[i], "ether");
      }

      const tx_builder = await contract.methods.multisendToken(
        toAddress,
        tokenValue
      );
      console.log(toAddress);
      console.log(tokenValue);

      console.log("11211212");
      let encoded_tx = tx_builder.encodeABI();

      let gasPrice = await web3.eth.getGasPrice();

      let transactionObject = {
        nonce: web3.utils.toHex(count),
        from: fromAddress,
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(5000000),
        to: contractAddress,
        data: encoded_tx,
        chainId: 0x01,
      };

      web3.eth.accounts
        .signTransaction(transactionObject, privateKey)
        .then((signedTx) => {
          web3.eth.sendSignedTransaction(
            signedTx.rawTransaction,
            async function (err, hash) {
              if (!err) {
                console.log("hash is : ", hash);
                return response.status(200).json({
                  msg:
                    "Transaction is in mining state. For more info please watch transaction hash on rinkeby explorer",
                  hash: hash,
                });
              } else {
                return response.status(400).json({
                  msg: `Bad Request ${err}`,
                });
              }
            }
          );
        })
        .catch((err) => {
          return response.status(400).json({
            msg: `Your private or public address is not correct`,
          });
        });
    } else {
      return response.status(400).json({
        msg: `Your private or public address is not correct`,
      });
    }
  } catch (e) {
    return response.status(400).json({
      msg: "invalid transaction signing",
      e,
      statuscode: 4,
    });
  }
});
module.exports = router;
