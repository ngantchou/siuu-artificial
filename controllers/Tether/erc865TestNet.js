//This module help to listen request
var express = require("express");
var router = express.Router();
var axios = require("axios");
const Web3 = require("web3");

// const web3 = new Web3();
const ethUtil = require("ethereumjs-util");
const ethereum_address = require("ethereum-address");
const InputDataDecoder = require("ethereum-input-data-decoder");

var web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://ropsten.infura.io/v3/0148422f7f26401b9c90d085d2d3f928"
  )
);

var web32 = new Web3(
  new Web3.providers.HttpProvider("http://93.115.29.78:8545")
);

var abi = require("./erc865Json").abi; //require("human-standard-token-abi");
var contractAddress = process.env.CONTRACT_ADDRESS;

const decoder = new InputDataDecoder(abi);

router.post("/signedtransfer", async function (request, response) {
  let fromAddress = request.body.from_address;
  let privateKey = request.body.from_private_key;
  let toAddress = request.body.to_address;
  let tokenValue = request.body.value;
  let feeInTokens = process.env.FEE;
  let adminAddress = process.env.ADMIN_ADDRESS;
  let adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;

  try {
    if (!privateKey.startsWith("0x")) {
      privateKey = "0x" + privateKey;
    }
    let bufferedKey = ethUtil.toBuffer(privateKey);
    if (
      ethereum_address.isAddress(fromAddress) &&
      ethereum_address.isAddress(fromAddress) &&
      ethUtil.isValidPrivate(bufferedKey)
    ) {
      const contract = await new web3.eth.Contract(abi, contractAddress);
      // Adding wallet into geth
      web32.eth.accounts.wallet.add(privateKey);

      // Tokens decimal conversion
      getTokenInfo(contractAddress).then(async (tokenInfo) => {
        if (tokenInfo.decimals != 0) {
          tokenValue = calculatePower(tokenInfo.decimals, tokenValue); //tokenValue * 10 ** tokenInfo.decimals;
          feeInTokens = feeInTokens * 10 ** tokenInfo.decimals; //calculatePower(tokenInfo.decimals, feeInTokens);
        }
        // getting nonce of sender from contract
        let nonceAndBalance = await getNonceAndBalance(
          contractAddress,
          fromAddress
        );

        if (parseInt(nonceAndBalance.balance) < parseInt(tokenValue)) {
          return response.status(200).json({
            error: "insufficient token balance",
            detail: `You have ${nonceAndBalance.balance} in your wallet.`,
          });
        }

        // 0 - function bytes hex which will be constant
        // 1 - Recipient Address
        // 2 - Amount of tokens to send
        // 3 - Extra data to make Hex Strong
        // 4 - Amount of token you want send to delegate as a fee
        // 5 - token sender nonce from contract

        let signedData = await getPreSignedHash(
          contractAddress,
          "0xa9059cbb",
          toAddress.toString(),
          tokenValue,
          "0x01",
          feeInTokens.toString(),
          nonceAndBalance.nonce
        );

        // creating signature from singedHex and sender address
        let signature = await web32.eth.sign(signedData.signedHex, fromAddress);

        // Get Delegator nonce of network
        let count = await web3.eth.getTransactionCount(adminAddress);

        // Building a transaction
        const tx_builder = await contract.methods.transferPreSigned(
          signature,
          toAddress,
          tokenValue.toString(),
          feeInTokens.toString(),
          "0x01",
          nonceAndBalance.nonce
        );
        let encoded_tx = tx_builder.encodeABI();

        // Getting Gas price from network
        let gasPrice = await web3.eth.getGasPrice();
        let combineGas = parseInt(web3.utils.toWei("15", "gwei"));
        let overAllGasgPrice = parseInt(gasPrice) + combineGas;

        console.log(gasPrice);
        console.log(combineGas);
        console.log(overAllGasgPrice);

        // Creating Transaction Object
        let transactionObject = {
          nonce: web3.utils.toHex(count),
          from: fromAddress,
          gasPrice: web3.utils.toHex(overAllGasgPrice),
          gasLimit: web3.utils.toHex(300000),
          to: contractAddress,
          data: encoded_tx,
          chainId: 0x03,
        };

        // Broadcasting Transaction
        web3.eth.accounts
          .signTransaction(transactionObject, adminPrivateKey)
          .then((signedTx) => {
            web3.eth.sendSignedTransaction(
              signedTx.rawTransaction,
              async function (err, hash) {
                if (!err) {
                  console.log("hash is : ", hash);
                  return response.status(200).json({
                    hash: hash,
                  });
                } else {
                  return response.status(400).json({
                    msg: `Bad Request ${err}`,
                  });
                }
              }
            );
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

router.get("/address/:wallet_address", async (req, response) => {
  let walletAddress = req.params.wallet_address;
  try {
    const instance = await new web3.eth.Contract(abi, contractAddress);
    instance.methods.balanceOf(walletAddress).call(async (error, balance) => {
      if (!error) {
        let info = await getTokenInfo(contractAddress);
        balance = balance / 10 ** info.decimals;
        // balance = calculatePower(info.decimals, balance);
        response.status(200).json({
          balance,
        });
      }
    });
  } catch (e) {
    return response.status(400).json({
      msg: "invalid wallet or contract address",
      e,
      statuscode: 4,
    });
  }
});

router.get("/getinfo", async (req, response) => {
  try {
    let info = await getTokenInfo(contractAddress);
    console.log(info);
    response.json({
      contractAddress: contractAddress,
      name: info.name,
      symbol: info.symbol,
      decimals: info.decimals,
      totalSupply: info.totalSupply,
    });
  } catch (e) {
    return response.status(400).json({
      msg: "invalid contract address",
      e,
      statuscode: 4,
    });
  }
});

router.get("/fetchtx/:hash", async function (req, response) {
  var finalResponse = null;
  try {
    if (req.params) {
      if (!req.params.hash) {
        ResponseMessage = "hash is missing \n";
        ResponseCode = 206;
      } else {
        let hash = req.params.hash;

        if (hash.length == 66) {
          ResponseCode = 200;
          finalResponse = await getTransaction(hash);
          ResponseMessage = "Completed";
        } else {
          ResponseMessage = "Invalid Hash";
          ResponseCode = 400;
        }
      }
    } else {
      ResponseMessage =
        "Transaction cannot proceeds as request params is empty";
      ResponseCode = 204;
    }
  } catch (error) {
    ResponseMessage = `Transaction signing stops with the error ${error}`;
    ResponseCode = 400;
  } finally {
    if (finalResponse == null) {
      return response.status(400).json({
        meta: "Tx not found on network",
      });
    } else {
      return response.status(200).json({
        payload: finalResponse,
      });
    }
  }
});

router.get("/track/:wallet_address", async function (req, res) {
  var transactions = [];
  try {
    let tx = await axios.get(
      `https://api-ropsten.etherscan.io/api?module=account&action=tokentx&contractaddress=0x7baf080c8b219062bd426ddc850bc6b812d06f25&address=${req.params.wallet_address}&sort=asc&apikey=R3NZBT5BV4WK3VER42TJ3B5UK4WYEDZENH`
    );
    tx.data.result.map(async (itemApi) => {
      var unixtimestamp = itemApi.timeStamp;
      var date = new Date(unixtimestamp * 1000)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      let obj = {
        from: itemApi.from,
        to: itemApi.to,
        hash: itemApi.hash,
        value: itemApi.value / 10 ** itemApi.tokenDecimal,
        date: date,
        timestamp: itemApi.timeStamp,
        nonce: itemApi.nonce,
        confirmations: itemApi.blockNumber,
        block: itemApi.blockNumber,
        gas_price: itemApi.gasPrice,
        gas_used: itemApi.gas,
        name: itemApi.tokenName,
        symbol: itemApi.tokenSymbol,
        decimal: itemApi.tokenDecimal,
      };

      transactions.push(obj);
    });
    return res.status(200).json({
      _data: transactions,
    });

    // });
  } catch (error) {
    let errors = {
      error: {
        code: 1,
        message: `General error: ` + error,
      },
    };
    return res.status(500).json({
      meta: errors,
      source: "offical",
    });
    //  return res.status(500).json({ error: err.toString() });
  }
});

function getTransaction(hash) {
  var ResponseData;

  return new Promise(function (resolve, reject) {
    try {
      web3.eth.getTransaction(hash, async function (err, transaction) {
        if (transaction.blockHash !== null) {
          let inputdecode = await decoder.decodeData(transaction.input);
          //   console.log(inputdecode.inputs[1].toString());
          //   console.log(inputdecode.inputs[0].toString());
          // inputdecode.inputs.map((tx) => {
          //   console.log(" : ",tx.toString());
          // });

          var confirmation =
            (await web3.eth.getBlockNumber()) - transaction.blockNumber;
          let time = await web3.eth.getBlock(transaction.blockNumber);
          let info = await getTokenInfo(transaction.to);
          let decimals =
            parseInt(inputdecode.inputs[2].toString()) / 10 ** info.decimals;
          ResponseData = {
            name: info.name,
            symbol: info.symbol,
            decimal: info.decimals,
            from: transaction.from,
            to: "0x" + inputdecode.inputs[1].toString(),
            value: decimals,
            feeInTokens:
              parseInt(inputdecode.inputs[3].toString()) / 10 ** info.decimals,
            gas_price: transaction.gasPrice,
            hash: transaction.hash,
            confirmations: confirmation,
            timestamp: time.timestamp,
          };
          resolve(ResponseData);
        } else {
          reject("Transaction is in pending state");
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

function calculatePower(decimals, tokens) {
  let decimal = web3.utils.toBN(decimals);
  let tokenAmount = web3.utils.toBN(tokens);
  let totalTokens = tokenAmount
    .mul(web3.utils.toBN(10).pow(decimal))
    .toString();
  return totalTokens;
}

function getTokenInfo(contractAddress) {
  var ResponseData;

  return new Promise(async function (resolve, reject) {
    try {
      const contractInstance = await new web3.eth.Contract(
        abi,
        contractAddress
      );
      const decimal = [];
      await contractInstance.methods.decimals().call((req, res) => {
        decimal.push(res);
      });
      await contractInstance.methods.symbol().call((req, res) => {
        decimal.push(res);
      });
      await contractInstance.methods.name().call((req, res) => {
        decimal.push(res);
      });
      await contractInstance.methods.totalSupply().call((req, res) => {
        decimal.push(res);
      });

      console.log(decimal[3] / 10 ** decimal[0]);
      ResponseData = {
        name: decimal[2],
        symbol: decimal[1],
        decimals: decimal[0],
        totalSupply: decimal[3] / 10 ** decimal[0],
      };
      resolve(ResponseData);
    } catch (e) {
      reject(e);
    }
  });
}

function getNonceAndBalance(contractAddress, walletAddress) {
  var ResponseData;

  return new Promise(async function (resolve, reject) {
    try {
      const contractInstance = await new web3.eth.Contract(
        abi,
        contractAddress
      );
      const nonceArray = [];
      await contractInstance.methods
        .getNonce(walletAddress)
        .call((req, res) => {
          nonceArray.push(res);
        });
      await contractInstance.methods
        .balanceOf(walletAddress)
        .call((req, res) => {
          nonceArray.push(res);
        });

      ResponseData = {
        nonce: nonceArray[0],
        balance: nonceArray[1],
      };
      resolve(ResponseData);
    } catch (e) {
      reject(e);
    }
  });
}

function getPreSignedHash(
  contractAddress,
  funcBytes,
  toAddress,
  tokenToSend,
  extraData,
  gasPrice,
  nonce
) {
  return new Promise(async function (resolve, reject) {
    try {
      const contractInstance = await new web3.eth.Contract(
        abi,
        contractAddress
      );
      const signedArray = [];
      await contractInstance.methods
        .getPreSignedHash(
          funcBytes,
          toAddress,
          tokenToSend,
          extraData,
          gasPrice,
          nonce
        )
        .call((req, res) => {
          signedArray.push(res);
        });

      ResponseData = {
        signedHex: signedArray[0],
      };
      resolve(ResponseData);
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = router;
