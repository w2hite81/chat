/**
 * Created by nodesj on 15. 8. 17..
 *
 * 보내는 파라미터의 규칙을 정한다.
 */

(function(){

    var util = require("./ncng-util").util;
    var NCNG_CONSTANT = require("./ncng-constant").ncngConstant;

    var send = function(user, eventName, options) {
        var sender = util.objectUtil.itemToValue(options, "sender");
        var message = util.objectUtil.itemToValue(options, "message");
        var data = util.objectUtil.itemToValue(options, "data");

        var arg = [eventName];

        switch(eventName) {
            case NCNG_CONSTANT.MESSAGE_EVENT.SYSTEM_MESSAGE:
                arg.push(message);
                arg.push(data);
                break;
            case NCNG_CONSTANT.MESSAGE_EVENT.NOTICE:
                arg.push(message);
                break;
            case NCNG_CONSTANT.MESSAGE_EVENT.UPDATE_USER:
                arg.push(user.info);
                break;
            case NCNG_CONSTANT.MESSAGE_EVENT.WHISPER_MESSAGE:
                arg.push(sender);
                arg.push(message);
                break;
            default:
                arg.push(sender);
                arg.push(message);
                break;
        }

        console.log(arg);
        user.emit.apply(user, arg);
    };

    var disconnect = function(user){
        send(user, NCNG_CONSTANT.MESSAGE_EVENT.NOTICE, {message:"연결이 끊겼습니다."});
        user.disconnect();
    };

    module.exports.disconnect = disconnect;
    module.exports.send = send

})();


