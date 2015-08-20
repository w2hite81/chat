/**
 * Created by nodesj on 15. 8. 16..
 */
var NCNG_CONSTANT = {
    /**
     * 메세지 이벤트 명.
     */
    MESSAGE_EVENT:{

        /** 기본 채팅 */
        DEFAULT:"chat message",

        /** 사용자 업데이트. */
        UPDATE_USER:"update user",

        /** 공지 */
        NOTICE:"notice",

        /** 방 메세지 */
        ROOM_MESSAGE:"room message",

        /** 시스템 메세지 */
        SYSTEM_MESSAGE:"system message",

        /** 귓속말 메세지 */
        WHISPER_MESSAGE:"whisper message"
    },

    /**
     * Level
     */
    LEVEL : {
        USER:0,
        ADMIN:1
    },

    /**
     * 명령어.
     */
    COMMAND : {

        /** 방 목록 요청. */
        LIST:'list',

        /** 방 입장. */
        JOIN:'join',

        /** 방 생성. */
        CREATE:'create',

        /** 방 퇴장. */
        LEAVE:'leave',

        /** 사용자 정보 업데이트. */
        UPDATE:'update',

        /** 귓속말 */
        WHISPER:'w',

        /** 유저 정보 */
        USERS:'users'

        // 추가 명령어.

    }
};

if(module && module.exports) {
    module.exports.ncngConstant = NCNG_CONSTANT;
}
