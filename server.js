var express = require('express'),
    pug = require('pug'),
    path = require('path');
    bodyParser = require('body-parser')
    port = process.env.PORT || 8080;

var routes = require('./routes/index');
var app = express();

var server = app.listen(port, function () {
	var host = server.address().address;
	var port = server.address().port;
  	console.log("\nListening at http://%s:%s\n",host ,port);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/', routes);


module.exports = app;
