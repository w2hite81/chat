/**
 * Created by nodesj on 15. 9. 6..
 */

(function(){

    var fs = require('fs');
    var util = require("./ncng-util").util;

    /**
     * 환경설정.
     * @constructor
     */
    function Configurator(){

        /**
         * Run config.
         * @param options
         * @param callback
         */
        this.run = function(options, callback){
            if(!options || !options.path) {
                return console.error("path does not exist.");
            }
            this._options = options;
            var _this = this;
            fs.readFile(this._options.path, 'utf8', function (err, data) {
                if (err) {
                    console.log('Error: ' + err);
                    return;
                }
                var config = _this._config = JSON.parse(data);

                if(util.isFunction(callback)){
                    callback.apply(_this, [config]);
                }
            });
        };

        /**
         * get Config
         * @returns {*}
         */
        this.getConfig = function(){
            return this._config;
        };

    }

    module.exports.config = new Configurator();
})();
