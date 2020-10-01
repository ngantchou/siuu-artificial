//This module help to listen request
var express = require("express");
var router = express.Router();
var axios = require("axios");
const Web3 = require("web3");
const config = require('./abiAirdrop');
// const web3 = new Web3();
const ethUtil = require("ethereumjs-util");
const ethereum_address = require("ethereum-address");
const InputDataDecoder = require("ethereum-input-data-decoder");


// var web3 = new Web3(
//     new Web3.providers.HttpProvider(
//         "https://ropsten.infura.io/v3/0148422f7f26401b9c90d085d2d3f928"
//     )
// );

var web3 = new Web3(new Web3.providers.HttpProvider('http://167.99.192.187:8545'));
// var abi = require("human-standard-token-abi");

// const decoder = new InputDataDecoder(config.abi);

var contractAddress = config.address;

router.post("/airdrop", async function (request, response) {
    let fromAddress = process.env.ADMIN_ADDRESS;
    let privateKey = process.env.ADMIN_PRIVATE_KEY;
    let toAddress = request.body.to_address;
    let tokenValue = request.body.value;
    if (request.headers.authorization != config.apKey) {
        return response.status(403).json({
            msg: `FORBIDDEN ! Please pass correct authorization key in headers`,
        });
    }
    try {
        if (!privateKey.startsWith("0x")) {
            privateKey = "0x" + privateKey;
        }
        let bufferedKey = ethUtil.toBuffer(privateKey);
        console.log("xxx");

        if (
            ethereum_address.isAddress(fromAddress) &&
            ethUtil.isValidPrivate(bufferedKey)
        ) {
            const contract = await new web3.eth.Contract(config.abi, config.address);
            let count = await web3.eth.getTransactionCount(fromAddress);

            web3.eth.defaultAccount = fromAddress;

            console.log("0000000");
            console.log("toKEN leynt, ", tokenValue.length);

            for (let i = 0; i < tokenValue.length; i++) {
                tokenValue[i] = web3.utils.toWei(tokenValue[i], "ether");
            }

            const tx_builder = await contract.methods.multisendToken(
                "0x1ff93b2d47d974644bddc62bf66940ebf18703e8",
                toAddress,
                tokenValue
            );
            console.log(toAddress);
            console.log(tokenValue);

            console.log("11211212");
            let encoded_tx = tx_builder.encodeABI();

            let gasPrice = await web3.eth.getGasPrice();

            // let gasLimit = 300000;

            // console.log("gasg limit : ", gasLimit);

            // let transactionObject1 = {
            //   from: fromAddress,
            //   to: contractAddress,
            //   data: encoded_tx,
            //   chainId: 0x01,
            // };

            // var estimatedGas = await web3.eth.estimateGas({
            //   data: transactionObject1.data,
            //   from: transactionObject1.from,
            // });
            // console.log("estimatedGas = ", estimatedGas);
            // var gasValue = estimatedGas * gasPrice;

            // console.log("gasvalue = ", gasValue);
            let transactionObject = {
                nonce: web3.utils.toHex(count),
                from: fromAddress,
                gasPrice: web3.utils.toHex(gasPrice),
                gasLimit: web3.utils.toHex(100000),
                to: contractAddress,
                data: encoded_tx,
                chainId: 0x01,
            };
            console.log('sss')
            web3.eth.accounts
                .signTransaction(transactionObject, privateKey)
                .then((signedTx) => {
                    web3.eth.sendSignedTransaction(
                        signedTx.rawTransaction,
                        async function (err, hash) {
                            if (!err) {
                                console.log("hash is : ", hash);
                                return response.status(200).json({
                                    msg: "Transaction is in mining state. For more info please watch transaction hash on etherscan explorer",
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
                    console.log(err)
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