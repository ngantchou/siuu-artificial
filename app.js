var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json({
    type: 'application/json'
}));
app.use(bodyParser.urlencoded({
    extended: true
}));


var erc20 = require('./controllers/Tether/erc20')

app.use('/api/erc20', erc20);


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

if (module === require.main) {

    var server = app.listen(process.env.PORT || 4000, function () {
        var port = server.address().port;
        console.log('App listening on port %s', port);
    });

}