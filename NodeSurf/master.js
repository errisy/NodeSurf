"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var http = require("http");
var fs = require("fs");
var moment = require("moment");
var MasterController;
(function (MasterController) {
    var folder = 'C:\\Users\\Jack\\Documents\\Visual Studio 2015\\Projects\\PDBCasper\\PDBCasper\\pdbSelected\\';
    var HierarchicalTask = (function () {
        function HierarchicalTask(parent) {
            var _this = this;
            this.waiting = [];
            this.working = [];
            this.finished = [];
            this.hasChildren = true;
            this.lastVisit = moment.duration(moment().diff(moment('2016-01-01 00:00:00'))).asSeconds();
            this.initialized = false;
            this.require = function () {
                if (!_this.initialized && _this.initialize) {
                    _this.initialize();
                    _this.initialized = true;
                }
                if (_this.hasChildren) {
                    _this.recycle();
                    var found_1 = null;
                    _this.working.some(function (child) {
                        if (child.hasChildren) {
                            var task = child.require();
                            if (task !== null) {
                                var nextLevel = task.require();
                                if (nextLevel !== null) {
                                    child.lastVisit = moment.duration(moment().diff(moment('2016-01-01 00:00:00'))).asSeconds();
                                    found_1 = nextLevel;
                                    return true;
                                }
                            }
                            return false;
                        }
                    });
                    if (found_1)
                        return found_1;
                    while (_this.waiting.length > 0) {
                        var child = _this.waiting.shift();
                        _this.working.push(child);
                        if (child.hasChildren) {
                            var nextLevel = child.require();
                            if (nextLevel !== null) {
                                child.lastVisit = moment.duration(moment().diff(moment('2016-01-01 00:00:00'))).asSeconds();
                                nextLevel.lastVisit = moment.duration(moment().diff(moment('2016-01-01 00:00:00'))).asSeconds();
                                return nextLevel;
                            }
                        }
                        else {
                            return child.require();
                        }
                    }
                    return null;
                }
                else {
                    return _this;
                }
            };
            this.recycle = function () {
                var working = [];
                var current = moment.duration(moment().diff(moment('2016-01-01 00:00:00'))).asSeconds();
                _this.working.forEach(function (child) {
                    if ((current - child.lastVisit) > 240) {
                        console.log('Recycled: ', child.path);
                        _this.waiting.push(child);
                    }
                    else {
                        working.push(child);
                    }
                });
                _this.working = working;
            };
            this.fetch = function (path) {
                var subpath = path.filter(function (value) { return true; });
                var thisID = subpath.shift();
                if (_this.id == thisID) {
                    if (_this.hasChildren) {
                        if (subpath.length > 0) {
                            var childID_1 = subpath[0];
                            var found = _this.working.filter(function (child) { return child.id == childID_1; });
                            if (found.length > 0)
                                return found[0].fetch(subpath);
                            found = _this.waiting.filter(function (child) { return child.id == childID_1; });
                            if (found.length > 0)
                                return found[0].fetch(subpath);
                        }
                        else {
                            return _this;
                        }
                    }
                    else {
                        return _this;
                    }
                }
                else {
                    return null;
                }
            };
            this.complete = function () {
                if (_this.parent) {
                    var waiting_1 = [];
                    var working_1 = [];
                    _this.parent.waiting.forEach(function (child) {
                        if (child.id != _this.id) {
                            waiting_1.push(child);
                        }
                        else {
                            _this.parent.finished.push(child);
                        }
                    });
                    _this.parent.working.forEach(function (child) {
                        if (child.id != _this.id) {
                            working_1.push(child);
                        }
                        else {
                            _this.parent.finished.push(child);
                        }
                    });
                    _this.parent.waiting = waiting_1;
                    _this.parent.working = working_1;
                    if (_this.parent.waiting.length == 0 && _this.parent.working.length == 0)
                        _this.parent.complete();
                }
                console.log('Completed: ', _this.path);
                if (_this.onComplete)
                    _this.onComplete();
            };
            this.parent = parent;
        }
        Object.defineProperty(HierarchicalTask.prototype, "path", {
            get: function () {
                if (this.parent) {
                    var parentPath = this.parent.path;
                    parentPath.push(this.id);
                    return parentPath;
                }
                else {
                    return [this.id];
                }
            },
            enumerable: true,
            configurable: true
        });
        return HierarchicalTask;
    }());
    var RootTask = (function (_super) {
        __extends(RootTask, _super);
        function RootTask() {
            var _this = this;
            _super.call(this);
            this.initialize = function () {
                _this.id = 'Root';
                var files = fs.readdirSync(folder);
                var IDs = files.filter(function (file) {
                    if (file.toLowerCase().lastIndexOf('.pdb') > -1) {
                        return true;
                    }
                }).map(function (file) {
                    return file.substr(0, 4);
                });
                IDs.forEach(function (file) {
                    //create a PDBTask;
                    var task = new FileTask(_this);
                    task.id = file;
                    _this.waiting.push(task);
                });
            };
        }
        return RootTask;
    }(HierarchicalTask));
    var FileTask = (function (_super) {
        __extends(FileTask, _super);
        function FileTask(parent) {
            var _this = this;
            _super.call(this, parent);
            this.initialize = function () {
                var structure = PDBParser.parsePDB(fs.readFileSync(folder + _this.id + '.pdb').toString());
                var chain = structure.chainDict['A'];
                //load each of the residue to the residue list;
                for (var residueKey in chain.residueDict) {
                    _this.residues.push(chain.residueDict[residueKey]);
                }
                //define a list of factors for test
                var factors = ['1.20', '1.40', '1.60', '1.80', '2.00'];
                factors.forEach(function (factor) {
                    var entry = folder + _this.id + '_' + factor + '.txt';
                    if (!fs.existsSync(entry)) {
                        var task = new FactorTask(_this);
                        task.id = factor;
                        _this.waiting.push(task);
                    }
                    ;
                });
            };
            this.residues = [];
            this.onComplete = function () {
                _this.residues = null;
                _this.finished = null;
                console.log('Clear File: ', _this.path);
            };
        }
        return FileTask;
    }(HierarchicalTask));
    var FactorTask = (function (_super) {
        __extends(FactorTask, _super);
        function FactorTask(parent) {
            var _this = this;
            _super.call(this, parent);
            this.initialize = function () {
                //generate branches for task;
                _this.parent.residues.forEach(function (residue) {
                    var task = new ResidueTask(_this);
                    task.id = residue.index.toString();
                    task.residue = residue;
                    _this.waiting.push(task);
                });
            };
            this.onComplete = function () {
                //write a file to disk;
                console.log('Finished: ', _this.id, _this.finished.length);
                _this.finished.sort(function (a, b) {
                    return (Number(a.id) > Number(b.id)) ? 1 : -1;
                });
                var builder = _this.finished.map(function (child) { return child.residue.name + child.residue.index + child.surface; });
                var filename = folder + _this.parent.id + '_' + _this.id + '.txt';
                console.log('Write File: ', filename);
                fs.writeFileSync(filename, builder.join('\n'));
            };
        }
        return FactorTask;
    }(HierarchicalTask));
    var ResidueTask = (function (_super) {
        __extends(ResidueTask, _super);
        function ResidueTask(parent) {
            _super.call(this, parent);
            this.hasChildren = false;
        }
        return ResidueTask;
    }(HierarchicalTask));
    var HttpService = (function () {
        function HttpService(port) {
            var _this = this;
            this.port = 48524;
            this.handler = function (request, response) {
                response.writeHead(200, {
                    "Content-Type": "application/json",
                    "access-control-allow-origin": "*",
                    "Access-Control-Allow-Headers": "*"
                });
                var that = _this;
                if (request.method.toUpperCase() == 'POST') {
                    var body_1 = "";
                    request.on('data', function (chunk) {
                        body_1 += chunk;
                    });
                    request.on('end', function () {
                        that.handlers.some(function (handler) {
                            if (handler.method == 'POST' && request.url.indexOf(handler.route) == 0) {
                                switch (handler.data) {
                                    case 'JSON':
                                        var jsonObj = JSON.parse(body_1);
                                        handler.action(request, response, jsonObj);
                                        break;
                                }
                                return true;
                            }
                            else {
                                return false;
                            }
                        });
                    });
                }
                if (request.method.toUpperCase() == 'GET') {
                    that.handlers.some(function (handler) {
                        if (handler.method == 'GET' && request.url.indexOf(handler.route) == 0) {
                            switch (handler.data) {
                                case 'TEXT':
                                    handler.action(request, response, null);
                                    break;
                                case 'JSON':
                                    handler.action(request, response, null);
                                    break;
                                case 'XML':
                                    handler.action(request, response, null);
                                    break;
                            }
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                }
            };
            this.handlers = [];
            this.addHandler = function (handler) {
                if (!handler.route) {
                    handler.route = '\/';
                }
                if (handler.route.indexOf('\/') != 0) {
                    handler.route = '\/' + handler.route;
                }
                if (!handler.method) {
                    handler.method = 'GET';
                }
                if (handler.action) {
                    _this.handlers.push(handler);
                }
            };
            this.start = function () {
                _this.server = http.createServer(_this.handler);
                _this.server.listen(_this.port);
            };
            if (port)
                if (typeof port == 'number')
                    this.port = port;
        }
        return HttpService;
    }());
    var JsonHandler = (function () {
        function JsonHandler() {
            this.data = 'JSON';
        }
        return JsonHandler;
    }());
    var TaskHandler = (function (_super) {
        __extends(TaskHandler, _super);
        function TaskHandler() {
            var _this = this;
            _super.apply(this, arguments);
            this.data = 'JSON';
            this.method = 'POST';
            this.root = new RootTask();
            this.action = function (req, res, json) {
                console.log('--------------------------------------------');
                if (json)
                    if (json.path && json.surface) {
                        //record a result;
                        var residueTask = (_this.root.fetch(json.path));
                        if (residueTask) {
                            residueTask.surface = json.surface;
                            residueTask.complete();
                        }
                    }
                var next = (_this.root.require());
                console.log('Next: ', next.path);
                if (next) {
                    var entry = {};
                    entry.path = next.path;
                    entry.factor = next.parent.id;
                    entry.residue = next.residue.index;
                    entry.residues = next.parent.parent.residues;
                    res.end(JSON.stringify(entry));
                }
                res.end('{}');
            };
        }
        return TaskHandler;
    }(JsonHandler));
    var server = new HttpService();
    server.addHandler(new TaskHandler());
    server.start();
})(MasterController || (MasterController = {}));
//# sourceMappingURL=master.js.map