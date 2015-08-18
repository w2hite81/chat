/**
 * Created by nodesj on 15. 8. 16..
 */

var NCNG_CONSTANT = require("./ncng-constant").ncngConstant;
const KEY = "_key";
/**
 * 메세지 정보 객체.
 * @param data
 * @constructor
 */
function MessageInfo(data) {
    this._message = data.message;
    this._command = data.command;
    this._data = data;
}

/**
 * 명령어 메세지인지 여부.
 * @returns {boolean}
 */
MessageInfo.prototype.isCommandMessage = function(){
    return this._command != null;
};
MessageInfo.prototype.getCommand = function(){
    return this._command;
};
MessageInfo.prototype.getMessage = function(){
    return this._message;
};
MessageInfo.prototype.setMessage = function(value){
    this._message = value;
};
MessageInfo.prototype.getKey = function(i){
    var data = this._data;
    return data && data[KEY+i] ? data[KEY+i] : null;
};


/**
 * 메세지를 파싱한다.
 * @param message
 * @returns {MessageInfo}
 */
function parse(msg){
    try {
        var data = {
            message:msg
        };

        var commandPattern = /^\//g;

        if(commandPattern.test(msg)){
            msg = msg.replace(commandPattern, "");
            msg = msg.split(" ");
            if(msg.length > 0) {
                var command = msg[0];
                if(msg.length > 1) {
                    msg = msg.splice(1,msg.length);
                    for ( var i = 0 ; i < msg.length ; i++) {
                        data[KEY+i] = msg[i];
                    }
                }
            }
            data.key = msg.length > 1 ? msg[1] : "";
            data.command = command;
        }

        return new MessageInfo(data);

    } catch(e) {
        console.error(e);
    }
    return null;
}


module.exports.parse = parse;
module.exports.MessageInfo = MessageInfo