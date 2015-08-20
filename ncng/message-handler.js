/**
 * Created by nodesj on 15. 8. 17..
 */

var util = require("./ncng-util").util;
var NCNG_CONSTANT = require("./ncng-constant").ncngConstant;
var roomManager = require('./room-manager').roomManager;
var userManager = require('./user-manager').userManager;
var messageSender = require('./message-sender');

module.exports.messageHandler = function(user, messageInfo, callback){
    // TODO 관리자 명령어 { 추방, 특정 닉네임 조회, 방 파괴, 방 전체 노티, 방만 노티, 귓속말
    // TODO 유저 목록 (전체, 방만)

    var message = messageInfo.getMessage();
    var eventName;
    var options = {};

    if(messageInfo.isCommandMessage()) {
        var command = messageInfo.getCommand();
        var room, roomName;
        eventName = NCNG_CONSTANT.MESSAGE_EVENT.SYSTEM_MESSAGE;
        switch(command) {
            case NCNG_CONSTANT.COMMAND.LIST:
                // TODO 방 목록 조회.
                var arr = [];
                var rooms = roomManager.getRooms();
                util.arrayUtil.each(rooms, function(i, room){
                    arr.push(room.getInfo().name + " (" + room.getUsers().length + ")");
                });
                options.message = "방 목록";
                options.data = arr;
                break;
            case NCNG_CONSTANT.COMMAND.CREATE:
                if(user.room) {
                    options.message = "이미 방에 접속해 있습니다.";
                } else {
                    roomName = messageInfo.getKey(0);
                    if(!roomName) {
                        options.message = "방 이름이 필요합니다.";
                    } else {
                        room = roomManager.createRoom(roomName);
                        if(room){
                            room.join(user);
                            options.message = "("+roomName +") 방에 접속했습니다.";
                        } else {
                            options.message = "("+roomName+") 이미 생성된 방입니다.";
                        }
                    }
                }
                break;
            case NCNG_CONSTANT.COMMAND.JOIN:
                // TODO 방 입장 여부.
                if(user.room) {
                    options.message = "이미 방에 접속해 있습니다.";
                } else {
                    roomName = messageInfo.getKey(0);
                    if(!roomName) {
                        options.message = "방 이름이 필요합니다.";
                    } else {
                        room = roomManager.getRoom(roomName);
                        if(room){
                            room.join(user);
                            options.message = "("+roomName +") 방에 접속했습니다.";
                        } else {
                            options.message = "("+roomName+") 방이 존재하지 않습니다.";
                        }
                    }
                }
                break;
            case NCNG_CONSTANT.COMMAND.LEAVE:
                // TODO 방 입장 여부.
                if(user.room) {
                    user.room.leave(user);
                    options.message = "방을 떠났습니다.";
                } else {
                    options.message = "방에 입장한 적이 없습니다.";
                }
                break;
            case NCNG_CONSTANT.COMMAND.UPDATE:
                user.info.level = messageInfo.getKey(0);
                messageSender.send(user, NCNG_CONSTANT.MESSAGE_EVENT.UPDATE_USER);
                options.message = "사용자 정보가 업데이트 되었습니다. (" + user.info.level + ")";
                break;
            case NCNG_CONSTANT.COMMAND.WHISPER:
                if(!messageInfo.getKey(0)) {
                    options.message = "귓속말 대상을 지정하세요.";
                } else if(!messageInfo.getKey(1)) {
                    options.message = "귓속말 내용이 필요합니다.";
                } else {
                    eventName = NCNG_CONSTANT.MESSAGE_EVENT.WHISPER_MESSAGE;
                    options.sender = user.info;
                    options.receiverName = messageInfo.getKey(0);
                    options.message = messageInfo.getKey(1);
                }
                break;
            case NCNG_CONSTANT.COMMAND.USERS:
                var users;
                if(messageInfo.getKey(0)) {
                   var roomName = messageInfo.getKey(0);
                    var room = roomManager.getRoom(roomName);
                    if(room){
                        users = room.getUsers();
                    } else {
                        options.message = "방이 존재하지 않습니다.";
                    }
                } else {
                    users = userManager.getUsers();
                }
                if(users){
                    var tepms = [];
                    util.arrayUtil.each(users, function(i, user){
                        tepms.push(user.info.nick);
                    });
                    options.message = "총 " + tepms.length + "명의 사용자가 있습니다.";
                    options.data = tepms;
                }
                break;
            case NCNG_CONSTANT.COMMAND.HELP:
                options.message = "명령어.";
                options.data = [];
                for ( var key in NCNG_CONSTANT.COMMAND) {
                    options.data.push(NCNG_CONSTANT.COMMAND[key]);
                }
                break;
            default :
                options.message = "정의 되어있지 않는 메세지 입니다.";
                break;
        }
    } else {
        if(user.room){
            eventName = NCNG_CONSTANT.MESSAGE_EVENT.ROOM_MESSAGE;
        } else {
            eventName = NCNG_CONSTANT.MESSAGE_EVENT.DEFAULT;
        }
        options.sender = user.info;
        options.message = message;
    }
    if(util.isFunction(callback)){
        callback(eventName, options);
    }
};