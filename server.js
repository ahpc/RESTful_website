var http = require('http');
var errorHandler = require('express-error-handler');
var port = process.env.PORT || 3000;
var app = require('./app');

var server = http.createServer(app);

// Log the error
app.use(function (err, req, res, next) {
  console.log(err);
  next(err);
});

app.use( errorHandler({server: server}) );

server.listen(port, function(){
	console.log("Server is running on port 3000!");
});