"use strict";
var http = require("http");
var PDB;
(function (PDB) {
    function Download(id, callback) {
        return new File(id, callback);
    }
    PDB.Download = Download;
    var File = (function () {
        function File(id, callback) {
            var _this = this;
            this.data = '';
            this.onBeginReceive = function (response) {
                response.on('data', _this.onData);
                response.on('end', _this.onEndReceive);
            };
            this.onEndReceive = function () {
                if (_this.onComplete)
                    _this.onComplete(_this.data);
            };
            this.onData = function (chunk) {
                _this.data += chunk;
            };
            this.onComplete = callback;
            var options = {};
            options.protocol = 'http:';
            options.host = 'files.rcsb.org';
            options.path = '/view/' + id.toUpperCase() + '.pdb';
            http.request(options, this.onBeginReceive).end();
        }
        return File;
    }());
})(PDB || (PDB = {}));
var Analyze = function (chain) {
    return function (value) {
        var str = PDBParser.parsePDB(value);
        for (var keyChain in str.chainDict) {
            if (keyChain.toUpperCase() == chain.toUpperCase()) {
                var entry = new SurfaceSearchEntry();
                entry.chain = str.chainDict[keyChain];
                var options = new SurfaceSearchOptions();
                options.hydrophilicFactor = 0.75;
                options.hydrophobicFactor = 1.5;
                for (var keyResidue in entry.chain.residueDict) {
                    entry.residue = entry.chain.residueDict[keyResidue];
                    var res = SurfaceSearch.Test(entry, options);
                    console.log(keyResidue, res);
                }
            }
        }
    };
};
PDB.Download('1a2z', Analyze('A'));
//# sourceMappingURL=app.js.map