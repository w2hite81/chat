/**
 * Created by nodesj on 15. 8. 17..
 */
module.exports.util = (function(){
    var util = {
        extend:function(){
            var originalData;
            if(arguments.length > 0){
                originalData = arguments[0];
                for ( var i = 1 ; i < arguments.length ; i++) {
                    var data = arguments[i];
                    for( var key in data) {
                        originalData[key] = data[key];
                    }
                }
            }
            return originalData;
        },
        getUID:function(prefix){
            var randomID = new Date().getTime() + "" + Math.random() * 10000;
          return prefix ? prefix + randomID : randomID;
        },
        isFunction:function(value){
            return value && typeof value === 'function';
        },
        isArray:function(arr){
            return arr && Array.isArray(arr);
        },
        urlUtil:{
            toParam:function(obj){
                var temp = "";
                if(obj){
                    for ( var key in obj) {
                        temp += temp == "" ? "?" : "&";
                        temp += key + "=" + obj[key];
                    }
                }
                return temp;
            }
        },
        stringUtil:{

        },
        objectUtil:{
            isNotEmpty:function(obj) {
                return obj && typeof obj === 'object';
            },
            itemToValue:function(obj, property) {
                return util.objectUtil.isNotEmpty(obj) && obj[property] ? obj[property] : null;
            }
        },
        arrayUtil:{
            isEmpty:function(arr){
                return !util.arrayUtil.isNotEmpty(arr);
            },
            isNotEmpty:function(arr) {
                return util.isArray(arr) && arr.length > 0
            },
            inArray:function(value, arr) {
                return util.arrayUtil.isNotEmpty(arr) ? arr.indexOf(value) : -1;
            },
            each:function(arr, callback) {
                if(util.arrayUtil.isNotEmpty(arr)){
                    for ( var i in arr) {
                        if(util.isFunction(callback)) {
                            callback(i, arr[i]);
                        }
                    }
                }
            },
            filter:function(arr, callback) {
                if(util.arrayUtil.isNotEmpty(arr)){
                    for ( var i in arr) {
                        if(util.isFunction(callback)) {
                            if(callback(i, arr[i])){
                                return arr[i];
                                break;
                            }
                        }
                    }
                }
                return null;
            }
        },
        randomNickName:function() {
            return "USER_" + new Date().getTime();
        }
    };
    return util;
})();
