//This module help to listen request
var express = require("express");
var router = express.Router();
const Web3 = require("web3");
// const web3 = new Web3();
const axios = require("axios");
const Web3EthAccounts = require("web3-eth-accounts");
const ethUtil = require("ethereumjs-util");
const ethereum_address = require("ethereum-address");

// web3.setProvider(
//   new web3.providers.HttpProvider("http://167.99.192.187:8545")
// );

var web3 = new Web3(new Web3.providers.HttpProvider('http://93.115.29.78:8545'));

// ---------------------------------Create Account----------------------------------------------
router.get("/create_wallet", async function (request, response) {
  var ResponseCode = 200;
  var ResponseMessage = ``;
  var ResponseData = null;
  try {
    var account = new Web3EthAccounts(
      "https://mainnet.infura.io/v3/0148422f7f26401b9c90d085d2d3f928"
    );

    let wallet = account.create();
    let walletAddress = wallet.address;
    const balance = await web3.eth.getBalance(walletAddress);
    const weiBalance = web3.utils.fromWei(balance, "ether");
    const count = await web3.eth.getTransactionCount(walletAddress);
    var date = new Date();
    var timestamp = date.getTime();

    ResponseData = {
      wallet: {
        private: wallet.privateKey,
        public: wallet.address,
        currency: "ETH",
        balance: weiBalance,
        create_date: date,
        sent: count,
        received: count,
        link: `https://www.etherscan.io/account/${walletAddress}`
      },
      message: "",
      timestamp: timestamp,
      status: 200,
      success: true
    };
    ResponseMessage = "Completed";
    ResponseCode = 200;
  } catch (error) {
    ResponseMessage = `Transaction signing stops with the error ${error}`;
    ResponseCode = 400;
  } finally {
    return response.status(200).json({
      code: ResponseCode,
      data: ResponseData,
      msg: ResponseMessage
    });
  }
});

//-----------------------------Get Balance of Account----------------------------------------------

router.get("/address/:walletAddress", async function (request, response) {
  try {
    const wallet = request.params.walletAddress;
    const balance = await web3.eth.getBalance(wallet);
    const weiBalance = web3.utils.fromWei(balance, "ether");
    if (weiBalance) {
      response.json({
        balance: weiBalance,
        address: wallet,
        currency: "ETH"
      });
    }
  } catch (e) {
    response.status(400).json({
      invalidrequest: "Your wallet address is invalid"
    });
  }
});

//----------------------------------Send Ethers----------------------------------------------
router.post("/transfer", async function (request, response) {
  let fromAddress = request.body.from_address;
  let privateKey = request.body.from_private_key;
  let toAddress = request.body.to_address;
  let etherValue = request.body.value;
  let errors = {};

  if (fromAddress == "") {
    response
      .status(400)
      .json(
        (errors.fromAddress = "From address or sender address is required")
      );
  } else if (toAddress == "") {
    response
      .status(400)
      .json((errors.toAddress = "To address or recipient address is required"));
  } else if (etherValue == "") {
    response.status(400).json((errors.etherValue = "ether value is required"));
  } else if (privateKey == "") {
    response
      .status(400)
      .json((errors.privateKey = "private key of sender is required"));
  }
  try {
    if (!privateKey.startsWith('0x')) {
      privateKey = '0x' + privateKey;
    }
    let bufferedKey = ethUtil.toBuffer(privateKey);

    if (
      ethereum_address.isAddress(fromAddress) &&
      ethereum_address.isAddress(fromAddress) &&
      ethUtil.isValidPrivate(bufferedKey)
    ) {
      etherValue = web3.utils.toWei(etherValue, "ether");

      let count = await web3.eth.getTransactionCount(fromAddress);

      web3.eth.defaultAccount = fromAddress;

      let gasPrice = await web3.eth.getGasPrice();

      let gasLimit = 21000;

      console.log("gasg limit : ", gasLimit);

      let transactionObject = {
        nonce: web3.utils.toHex(count),
        from: fromAddress,
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(gasLimit),
        to: toAddress,
        value: web3.utils.toHex(etherValue),
        chainId: 0x01
      };
      // console.log('transaction ', transactionObject)
      web3.eth.accounts
        .signTransaction(transactionObject, privateKey)
        .then(signedTx => {
          web3.eth.sendSignedTransaction(
            signedTx.rawTransaction,
            async function (err, hash) {
              if (!err) {
                console.log("hash is : ", hash);
                return response.status(200).json({
                  msg: "Transaction is in mining state. For more info please watch transaction hash on etherscan explorer",
                  hash: hash
                });
              } else {
                return response.status(400).json({
                  msg: `Bad Request ${err}`
                });
              }
            }
          );
        }).catch(err => {
          return response.status(400).json({
            msg: `Your private or public address is not correct`,
          });
        })
    } else {
      return response.status(400).json({
        msg: `Your private or public address is not correct`
      });
    }
  } catch (e) {
    return response.status(400).json({
      msg: "invalid transaction signing",
      e,
      statuscode: 4
    });
  }
});

router.get("/track/:wallet_address", async (req, res) => {
  try {
    const result = await axios.get(
      "http://api.etherscan.io/api?module=account&action=txlist&address=" +
      req.params.wallet_address
    );
    const parsed = result.data.result;
    if (parsed == "") {
      res.status(404).json({
        notfound: "no transaction found"
      });
    } else res.json(parsed);
  } catch (e) {
    res.status(400).json(e);
  }
});

router.get("/fetchtx/:hash", async (req, res) => {
  try {
    const reciept = await web3.eth.getTransaction(req.params.hash);
    let transaction2 = await web3.eth.getTransactionReceipt(req.params.hash);

    if (reciept == null) {
      return res.status(200).json({
        msg: "Transaction is in mining state. For more info please watch transaction hash on etherscan explorer",
        hash: req.params.hash,
        statuscode: 2
      });
    } else if (transaction2.status === false) {
      return res.status(200).json({
        reciept: reciept,
        statuscode: 0,
        message: "transaction failed",
        status: "failed"

      });
    } else if (transaction2.status == true) {
      return res.status(200).json({
        reciept: reciept,
        statuscode: 1,
        message: "transaction success",
        status: "success"
      });
    } else {
      return res.status(200).json({
        reciept,
        statuscode: 1
      });
    }
  } catch (e) {
    return res.status(200).json({
      msg: "invalid transaction reciept",
      e,
      statuscode: 4
    });
  }
});
module.exports = router;