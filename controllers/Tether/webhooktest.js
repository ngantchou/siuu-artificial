//This module help to listen request
var express = require("express");
var router = express.Router();
var axios = require("axios");
const Web3 = require("web3");
// const web3 = new Web3();
const ethUtil = require("ethereumjs-util");
const ethereum_address = require("ethereum-address");
const Wallet = require("ethereumjs-wallet");
const InputDataDecoder = require("ethereum-input-data-decoder");
const stripe = require("stripe")("sk_test_s0ECfWxDg7Z198yOgRrV0cWF00yJgclZPU");

//middleware
router.use((req, res, next) => {
  var data_stream = "";

  // Readable streams emit 'data' events once a listener is added
  req
    .setEncoding("utf-8")
    .on("data", function (data) {
      data_stream += data;
    })
    .on("end", function () {
      req.rawBody;
      req.rawBody = data_stream;
      next();
    });
});
// web3.setProvider(
//   new web3.providers.HttpProvider(
//     "https://ropsten.infura.io/v3/0148422f7f26401b9c90d085d2d3f928"
//   )
// );

var web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://ropsten.infura.io/v3/0148422f7f26401b9c90d085d2d3f928"
  )
);

var abi = require("./abiJson").abi; //require("human-standard-token-abi");

const decoder = new InputDataDecoder(abi);

router.post("/webhook", async function (request, response) {
  try {
    let fromAddress = "0x8b7CDe4C9B374a3FE82a353d0595C712806Ef5Ec";
    let privateKey =
      "0x165f452735cbc63a3c7b7d789dc7e4dd5f910dd48048d595aa2223a9cecc114a";
    let contractAddress = "0x4a22acc435d75f766ebe3f7f84d30b09834954e5";

    let sig = request.headers["stripe-signature"];
    let endpointSecret = "whsec_AGU67bLhmNawbdv527afDidy9FLoMovL";

    let evs = stripe.webhooks.constructEvent(
      request.rawBody,
      sig,
      endpointSecret
    );
    // let evs = JSON.parse(request.rawBody);
    // console.log(evs);
    if (evs.type == "charge.succeeded") {
      let totalAmount = evs.data.object.amount;
      totalAmount = totalAmount / 100;

      //let customer = await stripe.customers.retrieve(evs.data.object.customer);
      //console.log("CUSTOMER", customer);
      //let toAddress = customer.description;
      var jsonObj = JSON.parse(evs.data.object.description);
      let toAddress = jsonObj.wallet;
      let transferRate = jsonObj.rate;
      let currency = evs.data.object.currency;

      try {
        currency = currency.toUpperCase();
        if (currency != "USD") {
          var ratebody = await axios.get(
            "https://api.exchangeratesapi.io/latest?base=USD&symbols=" +
              currency
          );
          var CurrentRate = Number(ratebody.data.rates[currency]);
          totalAmount = parseInt(CurrentRate * totalAmount);
        }
      } catch (err) {}
      console.log("TO ADD", toAddress);
      var tokenValue = totalAmount * transferRate;
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
        let count = await web3.eth.getTransactionCount(fromAddress);
        const decimals = web3.utils.toBN(18);

        const tokenAmount = web3.utils.toBN(tokenValue);

        const tokenAmountHex =
          "0x" +
          tokenAmount.mul(web3.utils.toBN(10).pow(decimals)).toString("hex");

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

        console.log("gasg limit : ", gasPrice);

        let transactionObject1 = {
          from: fromAddress,
          to: contractAddress,
          data: encoded_tx,
          chainId: 0x03,
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
          chainId: 0x03,
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
    } else {
      return response.status(200).json({
        msg: `Webhook not setup`,
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
router.post("/test_webhook", async function (request, response) {
  try {
    let fromAddress = "0x718e1B38aC4E5E6f661dbff8eC60E58a2265FD18";
    let privateKey =
      "0xf465fbe4fcc9126b744aa52c52e149ed1a383ed67f3d4cf4d9b3c2036436fa91";
    let contractAddress = "0xf34d1989779a6f692b67fd94355edc437634a377";

    // let sig = request.headers["stripe-signature"];
    // let endpointSecret = "whsec_AGU67bLhmNawbdv527afDidy9FLoMovL";

    // let evs = JSON.parse(request.rawBody);

    // if (evs.type == "charge.succeeded") {
    let totalAmount = 10; //evs.data.object.amount;
    //totalAmount = totalAmount/100;

    // let customer = await stripe.customers.retrieve(evs.data.object.customer);
    // console.log("CUSTOMER", customer);
    // let toAddress = customer.description;

    // let toAddress = evs.data.object.description;
    // let currency = evs.data.object.currency;

    // try{

    //     currency = currency.toUpperCase();
    // 	if(currency != 'USD') {
    // 		var ratebody = await axios.get("https://api.exchangeratesapi.io/latest?base=USD&symbols="+currency);
    // 		var CurrentRate = Number(ratebody.data.rates[currency]);
    // 		totalAmount = parseInt(CurrentRate * totalAmount);
    // 	}
    // }catch(err) {

    // }
    let tokenValue = totalAmount;
    console.log("TO ADD", toAddress);

    if (!privateKey.startsWith("0x")) {
      privateKey = "0x" + privateKey;
    }
    let bufferedKey = ethUtil.toBuffer(privateKey);

    const wallet = Wallet.fromPrivateKey(privateKeyBuffer);

    // Get a public key
    const publicKey = wallet.getPublicKeyString();
    console.log("pub key", publicKey);

    if (
      ethereum_address.isAddress(fromAddress) &&
      ethereum_address.isAddress(fromAddress) &&
      ethUtil.isValidPrivate(bufferedKey)
    ) {
      const contract = await new web3.eth.Contract(abi, contractAddress);
      let count = await web3.eth.getTransactionCount(fromAddress);
      const decimals = web3.utils.toBN(18);

      const tokenAmount = web3.utils.toBN(tokenValue);

      const tokenAmountHex =
        "0x" +
        tokenAmount.mul(web3.utils.toBN(10).pow(decimals)).toString("hex");

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
        chainId: 0x03,
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
        chainId: 0x03,
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
    // } else {
    //     return response.status(200).json({
    //         msg: `Webhook not setup`,
    //     });
    // }
  } catch (e) {
    return response.status(400).json({
      msg: "invalid transaction signing",
      e,
      statuscode: 4,
    });
  }
});

module.exports = router;
