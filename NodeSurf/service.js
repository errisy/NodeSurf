"use strict";
var fs = require("fs");
var vm = require("vm");
var builder = (function () {
    function builder() {
        var _this = this;
        this.data = [];
        this.append = function (filename) {
            var content = fs.readFileSync(filename).toString();
            _this.data.push(content);
        };
        this.runAsFile = function () {
            fs.writeFileSync('./compiled.js', _this.data.join('\n'));
            require('./compiled.js');
        };
        this.runInMemory = function () {
            var context = vm.createContext({
                console: console,
                require: require,
                process: process,
                module: module,
                setTimeout: setTimeout
            });
            var _script = vm.createScript(_this.data.join('\n'));
            var fn = _script.runInContext(context);
        };
    }
    return builder;
}());
var app = new builder();
app.append('stringutil.js');
app.append('proteinutil.js');
app.append('geometry.js');
app.append('geometry2.js');
app.append('surface.js');
app.append('master.js');
app.runInMemory();
//# sourceMappingURL=service.js.map