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
            var socket = this.socket = io();
            var _this = this;

            socket.on('chat message', function(sender, param){
                _this._displayMessage(sender, param);
            });

            socket.on('update user', function(param){
                _this.nickName = param.nick;
                _this.level = param.level;
            });

            socket.on('notice', function(message){
                _this._displayMessage({nick:'공지',level:2}, message).css("color", "#ff0000");
            });

            socket.on('system message', function(message, data){
                _this._displaySystemMessage(message);
                if(data){
                    $.each(data, function(i, message){
                        _this._displaySystemMessage(i+1 + ". " + message);
                    });
                }
            });

            socket.on('whisper message', function(sender, message){
                _this._displayMessage(sender, "귓속말:"+message).css("color", "#0000ff");
            });

            socket.on('room message', function(sender, message){
                _this._displayMessage(sender, message).css("color", "#ff00ff");
            });
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
                _this.socket.emit('chat message', $input.val());
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

})(jQuery);