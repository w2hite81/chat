/**
 * Created by nodesj on 15. 8. 18..
 */
(function(){
    var util = require("./ncng-util").util;
    var NCNG_CONSTANT = require("./ncng-constant").ncngConstant;
    var messageSender = require('./message-sender');
    var config = require('./ncng-config').config.getConfig();
    var request = require('request');

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
            var _this = this;
            this.checkUser(user, function(result){
                if(!result || !result.nick) {
                    messageSender.disconnect(user);
                    return console.error("Login 정보를 확인하세요.");
                }
                var info = {};
                info.nick = result.nick;
                info.level = result.level;

                user.info = info;
                console.log(user.info.nick);

                _users.push(user);


                user.on("disconnect", function(){
                    _this.removeUser(user, function(){
                        // TODO 이벤트 삭제.
                    });
                });
                messageSender.send(user, NCNG_CONSTANT.MESSAGE_EVENT.UPDATE_USER);
                messageSender.send(user, NCNG_CONSTANT.MESSAGE_EVENT.SYSTEM_MESSAGE, {
                    message:user.info.nick+"님 환영합니다."
                });

                if(util.isFunction(callback)){
                    callback();
                }
            });
        };

        /**
         * 사용자 체크.
         * @param user
         * @param callback
         */
        this.checkUser = function(user, callback) {
            user.on("getKey", function(result){
                //user.off("getKey");
                var login = config.login;

                // TODO get post 방식 수정.
                if(login.method || login.method == "get"){
                    request(login.url, function(err, httpResponse, body){
                        console.log(err, httpResponse,body);
                        if(err) {
                            messageSender.disconnect(user);
                        } else{
                            if(util.isFunction(callback)){
                                callback(JSON.parse(body));
                            }
                        }
                    });
                } else {
                    request.post({url:login.url, form: result}, function(err, httpResponse, body){
                        console.log(err, httpResponse,body);
                        if(err) {
                            messageSender.disconnect(user);
                        } else{
                            if(util.isFunction(callback)){
                                callback(JSON.parse(body));
                            }
                        }
                    });
                }
            });
            user.emit("getKey");
        };

        /**
         * 사용자 제거.
         * @param user
         * @param callback
         */
        this.removeUser = function(user, callback) {
            var index = this.getUserIndex(user);
            console.log(index, user.info);
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
})();
