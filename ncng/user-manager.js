/**
 * Created by nodesj on 15. 8. 18..
 */
var util = require("./ncng-util").util;
var NCNG_CONSTANT = require("./ncng-constant").ncngConstant;

var messageSender = require('./message-sender');

function UserManager(){

    /** 사용자들. */
    var _users = [];

    /**
     * 사용자 인덱스.
     * @param user
     * @returns {Array}
     */
    this.getUserIndex = function(user){
        return _users
    };

    /**
     * 닉으로 사용자를 가져온다.
     * @param nick
     */
    this.getUserByNick = function(nick) {
        return util.arrayUtil.filter(_users, function(i, user){
            return user.info.nick == nick;
        });
    };

    /**
     * 사용자들.
     * @returns {Array.<T>}
     */
    this.getUsers = function(){
        return _users.concat();
    };

    /**
     * 사용자 추가.
     * @param user
     * @param callback
     */
    this.addUser = function(user, callback) {
        var info = {};
        info.nick = util.randomNickName();
        info.level = NCNG_CONSTANT.LEVEL.USER;

        user.info = info;
        console.log(user.info.nick);

        _users.push(user);

        messageSender.send(user, NCNG_CONSTANT.MESSAGE_EVENT.UPDATE_USER);
        messageSender.send(user, NCNG_CONSTANT.MESSAGE_EVENT.SYSTEM_MESSAGE, {
            message:user.info.nick+"님 환영합니다."
        });

        if(util.isFunction(callback)){
            callback();
        }
    };

    /**
     * 사용자 제거.
     * @param user
     * @param callback
     */
    this.removeUser = function(user, callback) {
        var index = this.getUserIndex(user);
        if(index > -1) {
            _users.splice(index, 1);
            if(user.room){
                user.room.leave(user);
            }
        }
        if(util.isFunction(callback)){
            callback();
        }
    };

}
module.exports.userManager = new UserManager();