//This module help to listen request
var express = require("express");
var router = express.Router();
const Web3 = require("web3");
const Wallet = require("ethereumjs-wallet");
const web3 = new Web3();
const Tx = require("ethereumjs-tx");
const InputDataDecoder = require("ethereum-input-data-decoder");

var abi = require("human-standard-token-abi");
var Web3EthAccounts = require("web3-eth-accounts");
const axios = require("axios");
web3.setProvider(
  new web3.providers.HttpProvider(
    "https://ropsten.infura.io/f94bc58a280645dba2eff3e86a959b10"
  )
);
const decoder = new InputDataDecoder(abi);
let MyContract = web3.eth.contract(abi);
var date = new Date();
var timestamp = date.getTime();

function toChecksum(address) {
  return web3._extend.utils.toChecksumAddress(address);
}
//----------------------------------Create Account----------------------------------------------
router.get("/create_wallet", async function(request, response) {
  var account = new Web3EthAccounts(
    "https://mainnet.infura.io/v3/f94bc58a280645dba2eff3e86a959b10"
  );
  account = account.create();
  var privateKey = account.privateKey;
  var address = account.address;

  let responseData = {
    privateKey,
    address,
    currency: "eth"
  };

  return response.status(200).json({
    payload: responseData,
    source: "official"
  });
});

//----------------------------------Send Tokens----------------------------------------------
router.post("/transfer", async function(request, response) {
  var ResponseData = null;
  var finalResponse = null;
  let checksum_address_from = null;
  let checksum_address_to = null;
  var ValidationCheck = true;

  try {
    if (
      request.body.fromAddress.length < 42 &&
      request.body.toAddress.length < 42
    ) {
      return (errors = {
        error: {
          code: 3000,
          message: `Not a valid Ethereum address`
        }
      });
    } else {
      checksum_address_from = web3._extend.utils.toChecksumAddress(
        request.body.fromAddress
      );
      checksum_address_to = web3._extend.utils.toChecksumAddress(
        request.body.toAddress
      );
    }
    if (request.body != "") {
      if (!request.body.fromAddress) {
        ValidationCheck = false;
        return (errors = {
          error: {
            code: 3004,
            message: `fromAddress cannot be null or empty`
          }
        });
      }
      if (!request.body.toAddress) {
        ValidationCheck = false;
        return (errors = {
          error: {
            code: 3005,
            message: `toAddress cannot be null or empty`
          }
        });
      }
      if (!request.body.privateKey) {
        ValidationCheck = false;
        return (errors = {
          error: {
            code: 3006,
            message: `privateKey cannot be null or empty`
          }
        });
      }
      if (!request.body.token) {
        ValidationCheck = false;
        return (errors = {
          error: {
            code: 3001,
            message: `Value is not provided`
          }
        });
      }
      if (!request.body.gasPrice) {
        ValidationCheck = false;
        return (errors = {
          error: {
            code: 3019,
            message: `Could not estimate gas price`
          }
        });
      }
      if (!request.body.gasLimit) {
        ValidationCheck = false;
        return (errors = {
          error: {
            code: 3020,
            message: `Could not estimate gas limit`
          }
        });
      }
      if (!request.body.contractAddress) {
        ValidationCheck = false;
        return (errors = {
          error: {
            code: 3024,
            message: `contract cannot be null or empty	`
          }
        });
      }
      // else if (!request.body.token === parseInt(request.body.token)) {
      //     ValidationCheck = false;
      //     return errors = {
      //         error: {
      //             code: 3011,
      //             message: `BigInt or BigDecimal conversion error`,
      //         }
      //     }
      // }

      if (ValidationCheck == true) {
        let fromAddress = request.body.fromAddress;
        let privateKey = request.body.privateKey;
        let toAddress = request.body.toAddress;
        let tokenValue = request.body.token;
        let gasPrice = request.body.gasPrice;
        let gasLimit = request.body.gasLimit;
        let contractAddress = request.body.contractAddress;
        let count = 0;

        if (!request.body.nounce) {
          count = await web3.eth.getTransactionCount(fromAddress);
        } else {
          count = request.body.nounce;
        }
        if (fromAddress.length < 42) {
          return (errors = {
            error: {
              code: 3000,
              message: fromAddress + ` is not a valid Ethereum address`
            }
          });
        } else if (toAddress.length < 42) {
          return (errors = {
            error: {
              code: 3000,
              message: toAddress + ` is not a valid Ethereum address`
            }
          });
        } else if (
          web3._extend.utils.isChecksumAddress(checksum_address_from) == false
        ) {
          //Added by Aqeel
          return (errors = {
            error: {
              code: 3000,
              message: fromAddress + ` is not a valid Ethereum address`
            }
          });
        } else if (
          web3._extend.utils.isChecksumAddress(checksum_address_to) == false
        ) {
          return (errors = {
            error: {
              code: 3000,
              message: toAddress + ` is not a valid Ethereum address`
            }
          });
        } else if (
          toChecksum(
            "0x" +
              Wallet.fromPrivateKey(Buffer.from(privateKey, "hex"))
                .getAddress()
                .toString("hex")
          ).toLowerCase() != fromAddress.toLowerCase()
        ) {
          return (errors = {
            error: {
              code: 3000,
              message: privateKey + ` not a valid Ethereum Private key`
            }
          });
        }

        web3.eth.defaultAccount = fromAddress;

        let info = await getTokenInfo(contractAddress);
        tokenValue = tokenValue * 10 ** info.decimals;
        let contract = web3.eth.contract(abi).at(contractAddress);
        let data = contract.transfer.getData(toAddress, tokenValue);

        let balance = contract.balanceOf(fromAddress).toString();

        let ethbalance = web3.eth.getBalance(fromAddress);

        if (ethbalance.toNumber() <= Number(gasPrice)) {
          return (errors = {
            error: {
              code: 3023,
              message: `ETH is not enough for fee`
            }
          });
        }
        if (Number(balance) >= Number(tokenValue)) {
          let rawTransaction = {
            from: fromAddress,
            nonce: web3.toHex(count),
            gasPrice: web3.toHex(gasPrice),
            gasLimit: web3.toHex(gasLimit),
            to: contractAddress,
            data: data,
            chainId: 0x03
          };
          privateKey = Buffer.from(privateKey, "hex");
          let tx = new Tx(rawTransaction);

          tx.sign(privateKey);
          let serializedTx = tx.serialize();
          let hashObj = await sendrawtransaction(serializedTx);
          if (hashObj.response == "") {
            let hash = hashObj.hash;
            ResponseData = {
              hex: hash
            };
            ResponseMessage = "Transaction successfully completed";
            ResponseCode = 200;
            finalResponse = ResponseData;
          } else {
            return (errors = hashObj.response);
          }
        } else {
          return (errors = {
            error: {
              code: 3022,
              message: `Not enough tokens`
            }
          });
        }
      } else {
        ResponseCode = 206;
      }
    } else {
      return (errors = {
        error: {
          code: 17,
          message: `Required request body is missing`
        }
      });
    }
  } catch (error) {
    errors = {
      error: {
        code: 1,
        message: `General error:  ${error}`
      }
    };
  } finally {
    if (finalResponse == null) {
      return response.status(400).json({
        meta: errors,
        source: "official"
      });
    } else {
      return response.status(200).json({
        payload: finalResponse,
        source: "official"
      });
    }
  }
});

router.get(
  "/address/:walletAddress/:contractAddress",
  async (req, response) => {
    var ResponseData = null;
    var finalResponse = null;
    let errors = null;
    let checksum_address = null;

    try {
      if (req.params.contractAddress < 42) {
        return (errors = {
          error: {
            code: 3000,
            message:
              req.params.contractAddress + ` is not a valid Contract address`
          }
        });
      }
      if (req.params.walletAddress.length < 42) {
        console.log("2");
        return (errors = {
          error: {
            code: 3000,
            message:
              req.params.walletAddress + ` is not a valid Ethereum address`
          }
        });
      } else {
        checksum_address = web3._extend.utils.toChecksumAddress(
          req.params.walletAddress
        );
      }
      if (!req.params.contractAddress) {
        return (errors = {
          error: {
            code: 17,
            message: `Required Contract address is missing`
          }
        });
      }
      if (!req.params.walletAddress) {
        return (errors = {
          error: {
            code: 17,
            message: `Required wallet address is missing`
          }
        });
      } else if (
        web3._extend.utils.isChecksumAddress(checksum_address) == false
      ) {
        //Added by Aqeel
        return (errors = {
          error: {
            code: 3000,
            message:
              req.params.walletAddress + ` is not a valid Ethereum address`
          }
        });
      } else {
        let walletAddress = req.params.walletAddress;

        if (walletAddress.length < 42) {
          return (errors = {
            error: {
              code: 3026,
              message: `Invalid address or contract`
            }
          });
        }
        var contractInstance = MyContract.at(req.params.contractAddress);

        let balance = contractInstance
          .balanceOf(req.params.walletAddress)
          .toString();
        let info = await getTokenInfo(req.params.contractAddress);

        if (balance == null) {
          return (errors = {
            error: {
              code: 400,
              message: `Error`
            }
          });
        }
        balance = balance / 10 ** info.decimals;
        ResponseData = {
          wallet: {
            name: info.name,
            token: balance,
            symbol: info.symbol
          },
          message: "",
          timestamp: timestamp,
          status: 200,
          success: true
        };
        finalResponse = ResponseData.wallet;
        message = "Completed";
        code = 200;
      }
    } catch (error) {
      return (errors = {
        error: {
          code: 1,
          message: `General error: ${error}`
        }
      });
    } finally {
      if (finalResponse == null) {
        return response.status(400).json({
          meta: errors,
          source: "official"
        });
      } else {
        return response.status(200).json({
          payload: finalResponse,
          source: "official"
        });
      }
    }
  }
);

router.get("/fetchtx/:hash", async function(req, response) {
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
        meta: errors
      });
    } else {
      return response.status(200).json({
        payload: finalResponse
      });
    }
  }
});

router.get("/track/:walletAddress/:contractAddress", async function(req, res) {
  var transactions = [];
  try {
    let tx = await axios.get(
      `https://api-ropsten.etherscan.io/api?module=account&action=tokentx&contractaddress=${req.params.contractAddress}&address=${req.params.walletAddress}&sort=asc&apikey=R3NZBT5BV4WK3VER42TJ3B5UK4WYEDZENH`
    );
    console.log(tx.data.result);
    var txids = tx.data.result;
    let txList = await Promise.all(
      txids.map(async itemApi => {
        // let info = await getTokenInfo(req.params.contractAddress);
        // let confirmation = web3.eth.blockNumber - itemApi.blockNumber;

        let obj = {
          from: itemApi.from,
          to: itemApi.to,
          hash: itemApi.hash,
          value: itemApi.value / 10 ** itemApi.tokenDecimal,
          timestamp: itemApi.timeStamp,
          nonce: itemApi.nonce,
          confirmations: itemApi.confirmation,
          block: itemApi.blockNumber,
          gas_price: itemApi.gasPrice,
          gas_used: itemApi.gas,
          name: itemApi.tokenName,
          symbol: itemApi.tokenSymbol,
          type: "ERC-20"
        };

        return obj;
      })
    );

    return res.status(200).json({
      payload: txList
    });
    // });
  } catch (error) {
    let errors = {
      error: {
        code: 1,
        message: `General error: ` + error
      }
    };
    return res.status(500).json({
      meta: errors,
      source: "offical"
    });
    //  return res.status(500).json({ error: err.toString() });
  }
});

function getTransaction(hash) {
  var ResponseData;

  return new Promise(function(resolve, reject) {
    try {
      web3.eth.getTransaction(hash, async function(err, transaction) {
        let inputdecode = decoder.decodeData(transaction.input);
        console.log(inputdecode.inputs[1].toString());
        var confirmation = web3.eth.blockNumber - transaction.blockNumber;
        let info = await getTokenInfo(transaction.to);
        let decimals =
          parseInt(inputdecode.inputs[1].toString()) / 10 ** info.decimals;
        ResponseData = {
          name: info.name,
          symbol: info.symbol,
          from: transaction.from,
          to: transaction.toAddress,
          value: decimals,
          gas_price: transaction.gasPrice,
          hash: transaction.hash,
          confirmations: confirmation
        };
        resolve(ResponseData);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function getTokenInfo(contractAddress) {
  var ResponseData;

  return new Promise(async function(resolve, reject) {
    try {
      let contractInstance = MyContract.at(contractAddress);
      let name = await contractInstance.name.call();
      let symbol = contractInstance.symbol.call();
      let decimals = contractInstance.decimals.call();

      console.log(name, "sss", symbol, "ss", decimals, "ww");
      ResponseData = {
        name: name,
        symbol: symbol,
        decimals: decimals
      };
      resolve(ResponseData);
    } catch (e) {
      reject(e);
    }
  });
}

function sendrawtransaction(serializedTx) {
  var hash;
  var response = "";
  return new Promise(function(resolve, reject) {
    web3.eth.sendRawTransaction("0x" + serializedTx.toString("hex"), function(
      err,
      hsh
    ) {
      if (err) {
        response = {
          error: {
            code: 1,
            message: `General error: ${err}`
          }
        };
      } else {
        hash = hsh;
      }
      var obj = {
        response: response,
        hash: hash
      };
      resolve(obj);
    });
  });
}

module.exports = router;
