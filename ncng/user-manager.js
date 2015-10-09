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
            return util.arrayUtil.inArray(user, _users);
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
         * 아이디로 사용자를 가져온다.
         * @param Id
         */
        this.getUserById = function(user_id) {
            return util.arrayUtil.filter(_users, function(i, user){
                return user.info.user_id == user_id;
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
                user.on("disconnect", function(){
                   _this.removeUser(user);
                });
                var info = {};
                info.nick = result.nick;
                info.user_level = result.user_level;
                info.user_id = result.user_id;
                info.session_key = result.session_key;

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
         * 로그인한 정보 체크.
         * @param info
         */
        this.checkLoingUserInfo = function(info){
            return this.getUserById(info.user_id);
        };

        /**
         * 사용자 체크.
         * @param user
         * @param callback
         */
        this.checkUser = function(user, callback) {
            var _this = this;
            var getKeyHandler = function(result){
                user.removeListener("getKey", getKeyHandler);
                var login = config.login;
                send({
                    method:login.method,
                    url:login.url,
                    param:result,
                    onSuccess:function(res, body){
                        var result = JSON.parse(body);
                        if(!result || !result.user_id || !result.session_key) {
                            messageSender.send(user, NCNG_CONSTANT.MESSAGE_EVENT.NOTICE, {
                                message:"로그인 정보를 확인하세요."
                            });
                            messageSender.disconnect(user);
                            console.error("Login 정보를 확인하세요.");
                        } else if ( _this.checkLoingUserInfo(result)) {
                            messageSender.send(user, NCNG_CONSTANT.MESSAGE_EVENT.NOTICE, {
                                message:"이미 접속한 사용자입니다."
                            });
                            messageSender.disconnect(user);
                        } else if (result.res == 9){
                            messageSender.send(user, NCNG_CONSTANT.MESSAGE_EVENT.NOTICE, {
                                message:"정상적인 접속이 아닙니다."
                            });
                            messageSender.disconnect(user);
                        } else {
                            if(util.isFunction(callback)){
                                callback(result);
                            }
                        }
                    },
                    onError:function(err){
                        messageSender.disconnect(user);
                        console.error("Loing Server 정보를 확인하세요.")
                    }
                });
            };
            user.on("getKey", getKeyHandler);
            user.emit("getKey");
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
                var logout = config.logout;
                send({
                    method:logout.method,
                    url:logout.url,
                    param:{
                        user_id:user.user_id
                    },
                    onSuccess:function (res, body) {
                        console.log("성공적으로 로그아웃 했습니다.");
                        if(util.isFunction(callback)){
                            callback();
                        }
                    },
                    onError:function(err){
                        console.error("로그아웃을 실패했습니다.", error);
                    }
                });
            } else {
                if(util.isFunction(callback)){
                    callback();
                }
            }

        };
    }

    function send(options){
        var handler = function (err, httpResponse, body) {
            if(err) {
                if(util.isFunction(options.onError)) {
                    options.onError(error);
                }
            } else {
                if(util.isFunction(options.onSuccess)) {
                    options.onSuccess(httpResponse, body);
                }
            }
        };
        if(!options.method || options.method == "get") {
            var url = options.url + util.urlUtil.toParam(options.param);
            request(url, handler);
        } else {
            request.post({url:options.url, form: options.data}, handler);
        }
    }

    module.exports.userManager = new UserManager();
})();
