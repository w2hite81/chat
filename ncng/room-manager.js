/**
 * Created by nodesj on 15. 8. 17..
 */

var util = require("./ncng-util").util;
var NCNG_CONSTANT = require("./ncng-constant").ncngConstant;

var messageSender = require('./message-sender');

/**
 * 방 생성자.
 * @param name
 * @constructor
 */
function Room(name){
    this._name = name;
    this._users = [];
    this._key = util.getUID();
}

/**
 * 방 정보.
 * @returns {*}
 */
Room.prototype.getInfo = function(){
    return {
        name:this._name
    };
};

/**
 * 방 입장.
 * @param user
 */
Room.prototype.join = function(user){
    var index = this.getUserIndex(user);
    if(index < 0 ) {
        // 방에 있는 사람에 공지
        this.notify(user.info.nick + "님이 입장하였습니다.");
        user.room = this;
        this._users.push(user);
    } else {
        console.error("duplication.");
    }
};


/**
 * 방 탈퇴.
 * @param user
 */
Room.prototype.leave = function(user){
    var index = this.getUserIndex(user);
    if(index > -1){
        user.room = null;
        this._users.splice(index, 1);
        this.notify(user.info.nick + "님이 퇴장하셨습니다.");
    }
};

/**
 * 사용자 인덱스 가져옴.
 * @param user
 * @returns {*}
 */
Room.prototype.getUserIndex = function(user){
  return util.arrayUtil.inArray(user, this._users);
};

/**
 * 사용자 정보.
 * @returns {*}
 */
Room.prototype.getUsers = function(){
    return this._users;
};

/**
 * 공지.
 * @param message
 */
Room.prototype.notify = function(message){
    this._sendMessage(NCNG_CONSTANT.MESSAGE_EVENT.NOTICE, {message:message});
};

Room.prototype.send = function(user, options){
    var defaultOption = {
        sender:user.info
    };
    this._sendMessage(NCNG_CONSTANT.MESSAGE_EVENT.ROOM_MESSAGE, util.extend(options, defaultOption));
};

/**
 * 방 전체 인원에게 메세지 전달.
 * @param eventName
 * @param options
 * @private
 */
Room.prototype._sendMessage = function(eventName, options){
    var defaultOption = {
        room:this.getInfo().name
    };
    util.arrayUtil.each(this._users, function(i, user){
        messageSender.send(user, eventName, util.extend({}, defaultOption, options));
    });
};


function RoomManager(){
    var _io = null;

    /**
     * IO 설정.
     * @param value
     */
    this.setIO = function(value){
        _io = value;
    };

    /**
     * 방 목록.
     * @type {Array}
     * @private
     */
    var _rooms = [];

    /**
     * 방들.
     * @returns {Array}
     */
    this.getRooms = function(){
        return _rooms;
    };

    /**
     * 방 생성.
     * @param name
     * @returns {*}
     */
    this.createRoom = function(name) {
        if (this.getRoom(name) == null) {
            var room = new Room(name);
            _rooms.push(room);
            return room;
        } else {
            console.error("이미 생성된 방입니다.");
        }
        return null;
    };

    /**
     * 방 가져옴.
     * @param name
     * @returns {*}
     */
    this.getRoom = function(name) {
        if(util.arrayUtil.isNotEmpty(_rooms)){
            for ( var i = 0 ; i < _rooms.length ; i++) {
                var room = _rooms[i];
                var info = room.getInfo();
                if(info.name == name) {
                    return room;
                }
            }
        }
        return null;
    };
}

module.exports.roomManager = new RoomManager();