const {
  Router
} = require("express");

var bodyParser = require("body-parser");
const mongoose = require("mongoose");
const conf = require("./config");
const queries = require("./database/queriesFunc");

const app = Router();

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const connection = conf.URL;

//Mongo DB Connection
mongoose
  .connect(connection, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log(err));

var erc20Test = require("./controllers/Tether/erc20Test");
var ethMain = require("./controllers/Ethereum/ethMain");
var ethTest = require("./controllers/Ethereum/ethTest");
var erc20Main = require("./controllers/Tether/erc20Main");
var ethFetchTxJitendar = require("./controllers/Ethereum/ethFetchTxJitendar");

var apiServices = require("./database/services");
app.use("/services", ensureWebToken, apiServices);

app.use("/token/testnet", ensureWebToken, erc20Test);
app.use("/token/mainnet", ensureWebToken, erc20Main);
app.use("/ether/mainnet", ensureWebToken, ethMain);
app.use("/ether/testnet", ensureWebToken, ethTest);

app.use("/ether/india/mainnet", ensureWebToken, ethFetchTxJitendar);

app.get("/", function (request, response) {
  response.contentType("application/json");
  response.end(JSON.stringify("Node is running"));
});

app.get("*", function (req, res) {
  return res.status(200).json({
    code: 404,
    data: null,
    msg: "Invalid Request {URL Not Found}",
  });
});

app.post("*", function (req, res) {
  return res.status(200).json({
    code: 404,
    data: null,
    msg: "Invalid Request {URL Not Found}",
  });
});

async function ensureWebToken(req, res, next) {
  const x_access_token = req.headers["authorization"];
  if (typeof x_access_token !== undefined) {
    
    const query = await queries.checkApiExist(x_access_token);
    if (query[0] != x_access_token && query.toString() != '') {
      next();
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(403);
  }
}

module.exports.routes = app;