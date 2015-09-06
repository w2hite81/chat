(function(){
  var app = require('express')();
  var http = require('http').Server(app);
  var io = require('socket.io')(http);
  var configManager = require('./ncng/ncng-config').config;

  // 환경설정 로드.
  configManager.run({path:'./config.json'}, function(config){

    var userManager = require('./ncng/user-manager').userManager;
    var messageHandler = require("./ncng/message-handler").messageHandler;
    var messageParser = require('./ncng/message-parser');
    var messageSender = require('./ncng/message-sender');

    var NCNG_CONSTANT = require("./ncng/ncng-constant").ncngConstant;
    var util = require("./ncng/ncng-util").util;

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
    app.get('/getUserInfo', function(req, res){
      console.log("req", req.body);
      var user = {};
      user.nick = "KEY 값으로 업데이트한 " + util.randomNickName();
      user.level = NCNG_CONSTANT.LEVEL.USER;
      res.send(user);
    });

    http.listen(30000, function(){
      console.log('listening on *:30000');
    });


    io.on('connection', function(user){
      console.log("user come on.");

      userManager.addUser(user, function(){

        user.on('chat message', function(msg){
          var messageInfo = messageParser.parse(msg);
          if(messageInfo){
            messageHandler(user, messageInfo, function(eventName, options){
              // 대화 : 대상 + 메세지.

              // 귓속말.

              // 게인 메세지.

              // 방 메세지.
              //io.to("room").emit('chat message', socket.rooms);
              //console.log(socket.rooms);

              // 전체 공지.
              //io.emit('chat message', "공지네");
              /**
               * 보내는 방식을 좌지우지한다.
               */
              switch(eventName){
                case NCNG_CONSTANT.MESSAGE_EVENT.ROOM_MESSAGE:
                  user.room.send(user, options);
                  break;
                case NCNG_CONSTANT.MESSAGE_EVENT.WHISPER_MESSAGE:
                  var receiver = userManager.getUserByNick(options.receiverName);
                  if(receiver){
                    messageSender.send(receiver, eventName, options);
                    messageSender.send(user, eventName, options);
                  } else {
                    messageSender.send(user, NCNG_CONSTANT.MESSAGE_EVENT.NOTICE, {
                      message:"귓속말 할 대상이 올바르지 않습니다."
                    });
                  }
                  break;
                default:
                  messageSender.send(user, eventName, options);
                  break;
              }
            });
          }
        });
      });
    });

  });
})();
