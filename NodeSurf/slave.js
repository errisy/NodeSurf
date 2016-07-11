"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var http = require("http");
//48524
var SlaveController;
(function (SlaveController) {
    var Client = (function () {
        function Client(protocol, host, path, port, data, method, mime, value) {
            var _this = this;
            this.content = '';
            this.data = 'TEXT';
            this.onBeginReceive = function (response) {
                response.on('data', _this.onData);
                response.on('end', _this.onEndReceive);
            };
            this.onEndReceive = function () {
                if (_this.onComplete) {
                    switch (_this.data) {
                        case 'JSON':
                            _this.onComplete(JSON.parse(_this.content));
                            break;
                        default:
                            _this.onComplete(_this.content);
                            break;
                    }
                }
            };
            this.onData = function (chunk) {
                _this.content += chunk;
            };
            var options = {};
            options.protocol = protocol;
            options.host = host;
            if (port)
                options.port = port;
            if (path)
                options.path = path;
            if (data)
                this.data = data;
            if (method) {
                options.method = method;
            }
            else {
                options.method = 'GET';
            }
            if (options.method == 'POST') {
                var length_1 = 0;
                if (typeof value == 'string') {
                    length_1 = Buffer.byteLength(value);
                }
                else {
                    length_1 = value.length;
                }
                if (!mime)
                    mime = 'text/plain';
                options.headers = {
                    'Content-Type': mime,
                    'Content-Length': length_1
                };
            }
            //console.log('begin request;');
            //console.log('Method: ', options.method); 
            var request = http.request(options, this.onBeginReceive);
            //console.log('begin write;');
            if (options.method == 'POST')
                request.write(value);
            //console.log('end;');
            request.end();
        }
        return Client;
    }());
    var SlaveClient = (function (_super) {
        __extends(SlaveClient, _super);
        function SlaveClient(data) {
            var _this = this;
            _super.call(this, 'http:', '192.168.137.3', '/', 48524, 'JSON', 'POST', 'application/json', JSON.stringify(data)); //'192.168.137.3' localhost
            this.onComplete = function (entry) {
                entry.residues = entry.residues.map(function (residue) { return SlaveClient.parseResidue(residue); });
                //console.log(entry.residue, entry.residues.length);
                _this.entry = entry;
                //deserialize entry;
                _this.finsh();
            };
            this.finsh = function () {
                var searchEntry = new SurfaceSearchEntry();
                searchEntry.residues = _this.entry.residues;
                searchEntry.residue = _this.entry.residues.filter(function (residue) { return residue.index == _this.entry.residue; })[0];
                var options = new SurfaceSearchOptions();
                options.hydrophobicFactor = 1.5; // Number(this.entry.factor);
                options.hydrophilicFactor = 0.75;
                var res = SurfaceSearch.Test(searchEntry, options);
                var result = {};
                result.path = _this.entry.path;
                result.surface = res ? '+' : '-';
                console.log(_this.entry.path, result.surface);
                var slave = new SlaveClient(result);
            };
        }
        SlaveClient.parseResidue = function (_residue) {
            var residue = new Residue();
            residue.index = _residue.index;
            residue.name = _residue.name;
            residue.atoms = _residue.atoms.map(function (atom) { return SlaveClient.parseAtom(atom); });
            return residue;
        };
        SlaveClient.parseAtom = function (_atom) {
            var atom = new Atom();
            /**
            ID: number;
            name: string;
            type: string;
            alternative: string;
            aminoAcid: string;
            chainName: string;
            residueIndex: number;
            insertion: string;
            position: Vector3D = new Vector3D();
            public Depth: number;
            **/
            atom.ID = _atom.ID;
            atom.name = _atom.name;
            atom.type = _atom.type;
            atom.position = SlaveClient.parseVector3D(_atom.position);
            return atom;
        };
        SlaveClient.parseVector3D = function (_vector) {
            return new Vector3D(_vector.x, _vector.y, _vector.z);
        };
        return SlaveClient;
    }(Client));
    var start = new SlaveClient({});
})(SlaveController || (SlaveController = {}));
//# sourceMappingURL=slave.js.map