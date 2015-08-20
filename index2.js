var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
app.get('/jquery-1.11.1.js', function(req, res){
  res.sendFile(__dirname + '/jquery-1.11.1.js');
});
app.get('/jquery-ui.js', function(req, res){
  res.sendFile(__dirname + '/jquery-ui.js');
});
app.get('/socket.io-1.2.0.js', function(req, res){
  res.sendFile(__dirname + '/socket.io-1.2.0.js');
});
app.get('/ncng-chat.js', function(req, res){
  res.sendFile(__dirname + '/ncng-chat.js');
});
app.get('/assets/css/ncng-chat.css', function(req, res){
  res.sendFile(__dirname + '/assets/css/ncng-chat.css');
});

http.listen(20000, function(){
  console.log('listening on *:20000');
});