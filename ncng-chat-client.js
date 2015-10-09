var ChatClient = (function(){

    /**
     * 채팅 타입.
     * @type {{CHART_MESSAGE: string, UPDATE_USER: string, NOTICE: string, SYSTEM_MESSAGE: string, WHISPER_MESSAGE: string, ROOM_MESSAGE: string, GET_KEY: string}}
     */
    var CHART_TYPE = {
        CHART_MESSAGE:"chat message",
        UPDATE_USER:"update user",
        NOTICE:"notice",
        SYSTEM_MESSAGE:"system message",
        WHISPER_MESSAGE:"whisper message",
        ROOM_MESSAGE:"room message",
        GET_KEY:"getKey"
    };

    /**
     * 메세지 타입.
     * @type {{SYSTEM: number, NOTICE: number, NORMAL: number, ROOM: number, WHISPER: number}}
     */
    var MESSAGE_TYPE = {
        SYSTEM:0,
        NOTICE:1,
        NORMAL:2,
        ROOM:3,
        WHISPER:4
    };

    /**
     * 채팅 클리아언트.
     * @param options
     * @constructor
     */
    function ChatClient(options){
        this._options = options;

    }

    /**
     * 초기화.
     */
    ChatClient.prototype.initialize = function(){
        var _this = this;

        /**
         * 세션키를 얻기 위함.
         */
        this.receive(CHART_TYPE.GET_KEY, function(param){
            if($.isFunction(_this._options.getSessionKey)) {
                _this._options.getSessionKey(param, function(result){
                    _this.send(result, CHART_TYPE.GET_KEY);
                });
            } else {
                console.error("getSessionKey is undefined.");
            }
        });

        /**
         * 일반 메세지.
         */
        this.receive(CHART_TYPE.CHART_MESSAGE, function(sender, message){
            _this.onMessaged(MESSAGE_TYPE.NORMAL, {sender:sender, message:message});
        });

        /**
         * 사용자 업데이트.
         */
        this.receive(CHART_TYPE.UPDATE_USER, function(param){
            if($.isFunction(_this._options.onUserUpdate)) {
                _this._options.onUserUpdate(param);
            }
        });

        /**
         * 공지
         */
        this.receive(CHART_TYPE.NOTICE, function(message){
            _this.onMessaged(MESSAGE_TYPE.NOTICE, {message:message});
        });

        /**
         * 시스템 메세지.
         */
        this.receive(CHART_TYPE.SYSTEM_MESSAGE, function(message, data){
            _this.onMessaged(MESSAGE_TYPE.SYSTEM, {message:message, data:data});
        });

        /**
         * 귓속말
         */
        this.receive(CHART_TYPE.WHISPER_MESSAGE, function(sender, message){
            _this.onMessaged(MESSAGE_TYPE.WHISPER, {message:message, sender:sender});
        });

        /**
         * 방 메세지.
         */
        this.receive(CHART_TYPE.ROOM_MESSAGE, function(sender, message){
            _this.onMessaged(MESSAGE_TYPE.ROOM, {message:message, sender:sender});
        });
    };

    /**
     * 메세지.
     */
    ChatClient.prototype.onMessaged = function(messageType, data){
        if($.isFunction(this._options.onMessage)) {
            this._options.onMessage.apply(this, [messageType, data]);
        }
    };

    /**
     * 정리.
     */
    ChatClient.prototype.destroy = function(){

    };

    /**
     * 채팅 연결.
     */
    ChatClient.prototype.connect = function(){
        this._socket = io(this._options.host ? this._options.host : null);
        this.initialize();
    };

    /**
     * 연결 끊기.
     */
    ChatClient.prototype.disconnect = function(){

    };

    /**
     * 메세지를 보낸다.
     * @param data 보낼 데이터.
     * @param type 챗 타입.
     */
    ChatClient.prototype.send = function(data, type){
        if(this._socket){
            if(!type) {
                type = CHART_TYPE.CHART_MESSAGE;
            }
            this._socket.emit(type, data);
        }
    };

    /**
     * 메세지를 받는다.
     * @param type
     * @param callback
     */
    ChatClient.prototype.receive = function(type, callback){
        if(isAllowReceiveType(type)) {
            this._socket.on(type, callback);
        } else {
            console.error("허용하는 타입이 아닙니다.");
        }
    };

    /**
     * 허용되는 메세지 타입.
     * @param type
     * @returns {boolean}
     */
    function isAllowReceiveType(type){
        for ( var key in CHART_TYPE) {
            if(CHART_TYPE[key] == type){
                return true;
            }
        }
        return false;
    }

    return ChatClient;
})();