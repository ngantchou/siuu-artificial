const express = require('express');
const cors = require('cors');
const helmet = require('helmet')
const {
    routes
} = require('./app');

const app = express();

app.use(cors());
app.use(helmet())

app.get("/f", function (req, res) {
    res.send("faaaaaaa")
})

app.use('/api/', routes)

if (module === require.main) {
    var server = app.listen(process.env.PORT || 4000, function () {
        var port = server.address().port;
        console.log("App listening on port %s", port);
    });
}