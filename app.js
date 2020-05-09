var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const https = require('https');
const fs = require('fs');

app.use(bodyParser.json({
    type: 'application/json'
}));
app.use(bodyParser.urlencoded({
    extended: true
}));


var erc20Main = require('./controllers/Tether/erc20Main')
var erc20Test = require('./controllers/Tether/erc20Test')
var ethMain = require('./controllers/Ethereum/ethMain')
var ethTest = require('./controllers/Ethereum/ethTest')

app.use('/api/token/mainnet', erc20Main);
app.use('/api/token/testnet', erc20Test);
app.use('/api/ether/mainnet', ethMain);
app.use('/api/ether/testnet', ethTest);


app.get('/', function (request, response) {

    response.contentType('application/json');
    response.end(JSON.stringify("Node is running"));

});

app.get('*', function (req, res) {
    return res.status(200).json({
        code: 404,
        data: null,
        msg: 'Invalid Request {URL Not Found}'
    });
});

app.post('*', function (req, res) {
    return res.status(200).json({
        code: 404,
        data: null,
        msg: 'Invalid Request {URL Not Found}'
    });
});

// const options = {
//     key: fs.readFileSync('./key.pem'),
//     cert: fs.readFileSync('./cert.pem')
//   };
  
//   https.createServer(options, function (req, res) {
//     console.log('App listening');
//     res.writeHead(200);
//     res.end("hello world\n");

// }).listen(5000);


if (module === require.main) {

    var server = app.listen(process.env.PORT || 5000, function () {
        var port = server.address().port;
        console.log('App listening on port %s', port);
    });

}