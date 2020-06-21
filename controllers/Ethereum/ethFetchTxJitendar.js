//This module help to listen request
var express = require("express");
var router = express.Router();
const Web3 = require("web3");
const web3 = new Web3();

web3.setProvider(
  new web3.providers.HttpProvider("https://mainnet.infura.io/v3/f94bc58a280645dba2eff3e86a959b10")
);

// var web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io/f94bc58a280645dba2eff3e86a959b10'));

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
    } else if (transaction2.status == false) {
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