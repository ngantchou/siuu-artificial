var express = require("express");
var app = express();
var bodyParser = require("body-parser");
const dotenv = require("dotenv");
const assert = require("assert");

const stage = process.env.NODE_ENV || "production";
const env = dotenv.config({ path: `${stage}.env` });
assert.equal(null, env.error);
app.set("env", stage);

var webhook = require("./controllers/Tether/webhook");
app.use("/api/token/new/mainnet", webhook);

var webhooktest = require("./controllers/Tether/webhooktest");
app.use("/api/token/new/testnet", webhooktest);

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

var erc20Test = require("./controllers/Tether/erc20Test");

var ethMain = require("./controllers/Ethereum/ethMain");
var ethTest = require("./controllers/Ethereum/ethTest");
var erc20Main = require("./controllers/Tether/erc20Main");
var erc865TestNet = require("./controllers/Tether/erc865TestNet");

app.use("/api/token/testnet", erc20Test);
app.use("/api/gasless/testnet", erc865TestNet);

app.use("/api/token/mainnet", erc20Main);
app.use("/api/ether/mainnet", ethMain);
app.use("/api/ether/testnet", ethTest);

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

if (module === require.main) {
  var server = app.listen(process.env.PORT || 5000, function () {
    var port = server.address().port;
    console.log("App listening on port %s", port);
  });
}
