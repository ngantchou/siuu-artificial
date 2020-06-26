//This module help to listen request
var express = require("express");
var router = express.Router();
const Web3 = require("web3");
const web3 = new Web3();
const ethUtil = require("ethereumjs-util");
const ethereum_address = require("ethereum-address");
var abi = require("human-standard-token-abi");

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
  let contractAddress = "0x261c4c340b49e187ae7c40555cf0cd78cfac56d0"; //request.body.contract_address;

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

      const decimal = [];
      await contract.methods.decimals().call((req, res) => {
        decimal.push(res);
      });
      console.log(decimal[0]);
      const decimals = web3.utils.toBN(decimal[0]);

      const tokenAmount = web3.utils.toBN(tokenValue);

      const tokenAmountHex =
        "0x" +
        tokenAmount.mul(web3.utils.toBN(10).pow(decimals)).toString("hex");

      console.log(typeof tokenValue);

      console.log(typeof tokenValue);

      web3.eth.defaultAccount = fromAddress;

      console.log("0000000");
      const tx_builder = await contract.methods.transfer(
        toAddress,
        tokenAmountHex
      );

      console.log("11211212");
      let encoded_tx = tx_builder.encodeABI();

      let gasPrice = await web3.eth.getGasPrice();

      // let gasLimit = 300000;

      // console.log("gasg limit : ", gasLimit);

      let transactionObject1 = {
        from: fromAddress,
        to: contractAddress,
        data: encoded_tx,
        chainId: 0x01,
      };

      var estimatedGas = await web3.eth.estimateGas(transactionObject1);
      console.log("estimatedGas = ", estimatedGas);

      var gasValue = estimatedGas * gasPrice;
      console.log("gasvalue = ", gasValue);

      let transactionObject = {
        nonce: web3.utils.toHex(count),
        from: fromAddress,
        gasPrice: web3.utils.toHex(gasPrice),
        gasLimit: web3.utils.toHex(estimatedGas),
        to: contractAddress,
        data: encoded_tx,
        chainId: 0x01,
      };

      // console.log('transaction ', transactionObject)
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
                    "Transaction is in mining state. You can save this hash for future use. For more info please watch transaction hash on etherscan explorer",
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
