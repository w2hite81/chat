/**
 * Created by nodesj on 15. 8. 20..
 */
(function($){
    $.widget("ncng.chat", {
        /**
         * 생성.
         * @private
         */
        _create: function() {
            this.nickName = "";
            this.level = 1;

            this.element.append($(TEMPLATE.BODY));
            this.element.append($(TEMPLATE.FORM));
            this._addEventHandler();
            this._connect();
        },
        /**
         * 파괴.
         */
        destroy:function(){
            if(this.socket){
                this.socket.disconnect();
            }
            this._removeEventListener();
            this.element.empty();
        },
        /**
         * 연결.
         * @private
         */
        _connect:function(){
            var _this = this;
            var client = this._client = new  ChatClient({
                host:this.options.host,
                onMessage:function(type, data){
                    switch(type) {
                        case 0: // 시스템
                            _this._displaySystemMessage(data.message);
                            if(data.data){
                                $.each(data.data, function(i, message){
                                    _this._displaySystemMessage(i+1 + ". " + message);
                                });
                            }
                            break;
                        case 1: // 공지
                            _this._displayMessage({nick:'공지',level:2}, data.message).css("color", "#ff0000");
                            break;
                        case 2: // 일반
                            _this._displayMessage(data.sender, data.message);
                            break;
                        case 3: // 방 채팅.
                            _this._displayMessage(data.sender, data.message).css("color", "#ff00ff");
                            break;
                        case 4: // 귓속말
                            _this._displayMessage(data.sender, "귓속말:"+ data.message).css("color", "#0000ff");
                            break;
                    }
                },
                onUserUpdate:function(param){
                    _this.nickName = param.nick;
                    _this.user_level = param.user_level;
                },
                getSessionKey:this.options.getSessionKey
            });
            client.connect();
        },
        /**
         * 시스템 메세지.
         * @param message
         * @returns {*|HTMLElement}
         * @private
         */
        _displaySystemMessage:function(message){
            var $li = $('<li><string><span class="message"></span></li>');
            $li.css("fontStyle", 'italic');
            $li.css("color", "#336699");
            $li.find(".message").text(message);
            $('#messages').append($li);
            this._goScrollEnd();
            return $li;
        },
        /**
         * 일반 메세지.
         * @param sender
         * @param message
         * @returns {*}
         * @private
         */
        _displayMessage: function(sender, message){
            var isMe = sender.nick == this.nickName;
            var $li = isMe ?
                $('<li><string><span class="message"></span> : [<span class="nick"></span>]</string></li>').css({"text-align":"right"}) :
                $('<li><string>[<span class="nick"></span>]</string> : <span class="message"></span></li>');
            $li.find(".nick").text(sender.nick).addClass("level"+sender.level).data(sender);
            $li.find(".message").text(message);
            $('#messages').append($li);
            this._goScrollEnd();
            return $li;
        },
        /**
         * 이벤트 핸들러 추가.
         * @private
         */
        _addEventHandler:function(){
            var $input = this.element.find('#m');
            var _this = this;
            $('form').submit(function(){
                _this._client.send($input.val());
                //_this.socket.emit('chat message', $input.val());
                $input.val('');
                return false;
            });
        },
        /**
         * 이벤트 삭제.
         * @private
         */
        _removeEventListener:function(){
        },
        /**
         * 스크롤 마지막으로.
         * @private
         */
        _goScrollEnd:function(){
            var $ul = $("ul");
            $ul.scrollTop($ul.prop("scrollHeight"));
        }
    });

    var TEMPLATE = {
        BODY:'<ul id="messages"></ul>',
        FORM:'<form action="">'
            +'<input id="m" autocomplete="off" /><button>Send</button>'
            +'</form>'
    };

    $.getParam = function(paramName) {
        var sURL = window.document.URL.toString();
        if (sURL.indexOf("?") > 0)
        {
            var arrParams = sURL.split("?");
            var arrURLParams = arrParams[1].split("&");
            var arrParamNames = new Array(arrURLParams.length);
            var arrParamValues = new Array(arrURLParams.length);

            var i = 0;
            for (i = 0; i<arrURLParams.length; i++)
            {
                var sParam =  arrURLParams[i].split("=");
                arrParamNames[i] = sParam[0];
                if (sParam[1] != "")
                    arrParamValues[i] = unescape(sParam[1]);
                else
                    arrParamValues[i] = "No Value";
            }

            for (i=0; i<arrURLParams.length; i++)
            {
                if (arrParamNames[i] == paramName)
                {
                    //alert("Parameter:" + arrParamValues[i]);
                    return arrParamValues[i];
                }
            }
            return "";
        }
    };

})(jQuery);