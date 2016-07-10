"use strict";
var fs = require("fs");
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
// need to test hydrophobicFactor from 1.2 to 2.0;
var Analyze = function (chain, hydrophobicFactor) {
    return function (value) {
        var str = PDBParser.parsePDB(value);
        for (var keyChain in str.chainDict) {
            if (keyChain.toUpperCase() == chain.toUpperCase()) {
                var entry = new SurfaceSearchEntry();
                //entry.residues = str.;
                var options = new SurfaceSearchOptions();
                options.hydrophilicFactor = 0.75;
                options.hydrophobicFactor = hydrophobicFactor;
            }
        }
    };
};
var files = fs.readdirSync('./');
files.filter(function (file) {
    if (file.toLowerCase().lastIndexOf('.pdb') > -1) {
        return true;
    }
});
//PDB.Download('1a2z', Analyze('A', 1.2)); 
//# sourceMappingURL=app.js.map