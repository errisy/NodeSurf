var SectionDivider = (function () {
    function SectionDivider() {
    }
    SectionDivider.sectionsBeforeEachPattern = function (value, pattern, includePattern) {
        var sections = [];
        var lastPos = 0;
        var mc = pattern.Matches(value);
        for (var i = 0; i < mc.length; i++) {
            var m = mc[i];
            sections.push(value.substring(lastPos, includePattern ? m.lastIndex : m.index));
            lastPos = includePattern ? m.lastIndex : m.index;
        }
        return sections;
    };
    SectionDivider.sectionsAfterEachPattern = function (value, pattern, includePattern) {
        var sections = [];
        var nextPos = -1;
        var mc = pattern.Matches(value);
        //console.log('number of sections: '+  mc.length.toString());
        for (var i = 0; i < mc.length; i++) {
            var m = mc[i];
            if (i < mc.length - 1) {
                nextPos = mc[i + 1].index;
            }
            else {
                nextPos = value.length;
            }
            sections.push(value.substring(m.index, nextPos));
        }
        return sections;
    };
    SectionDivider.Divide = function (value, pattern) {
        var Sections = [];
        var lastPos = -1;
        pattern.Matches(value).forEach(function (match, index, array) {
            if (lastPos > -1) {
                if (lastPos == 0) {
                    //console.log(value.substr(lastPos, match.index - lastPos));
                    Sections.push(value.substr(lastPos, match.index - lastPos));
                }
                else {
                    //console.log(value.substr(lastPos + 1, match.index - lastPos));
                    Sections.push(value.substr(lastPos + 1, match.index - lastPos));
                }
            }
            lastPos = match.index;
        });
        if (lastPos == 0) {
            Sections.push(value.substr(lastPos));
        }
        else {
            Sections.push(value.substr(lastPos + 1));
        }
        return Sections;
    };
    SectionDivider.DivideWith = function (value, pattern, groupIndex) {
        var Sections = [];
        var lastPos = -1;
        pattern.Matches(value).forEach(function (match, index, array) {
            Sections.push(value.substr(lastPos, match.index - lastPos) + (match.groups[2] ? match.groups[2] : ''));
            lastPos = match.index + match.length;
        });
        if (lastPos == 0) {
            Sections.push(value.substr(lastPos));
        }
        else {
            Sections.push(value.substr(lastPos + 1));
        }
        return Sections;
    };
    SectionDivider.SelectSection = function (Sections, pattern) {
        return Sections.filter(function (value) { return pattern.IsMatch(value); });
    };
    SectionDivider.RemoveQuotation = function (Value) {
        return Value.replace(/^\s*"/g, '').replace(/"\s*$/g, '');
    };
    return SectionDivider;
}());
var RegularExpressionMatch = (function () {
    function RegularExpressionMatch() {
    }
    return RegularExpressionMatch;
}());
String.prototype.encodeXML = function () {
    var that = eval('this');
    return that.replace(/[<>&'"]/g, function (char) {
        switch (char) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
};
String.prototype.format = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var that = eval('this');
    return that.replace(/{\d+}/g, function (char) {
        var index = Number(char.substr(1, char.length - 2));
        return args[index].toString();
    });
};
String.prototype.apply = function (obj) {
    var that = eval('this');
    console.log('String.apply:', obj);
    return that.replace(/\{[\w+\.]+\}/g, function (char) {
        var fields = char.substr(1, char.length - 2).split('.').filter(function (field) { return field.length > 0; });
        console.log('String.apply:', char, obj, fields);
        var value = obj;
        while (fields.length > 0) {
            value = value[fields.shift()];
        }
        return value;
    });
};
RegExp.prototype.Matches = function (value) {
    var hit;
    var result = [];
    var that = eval('this');
    while (hit = that.exec(value)) {
        var match = new RegularExpressionMatch();
        match.index = hit.index;
        match.lastIndex = that.lastIndex;
        match.length = match.lastIndex - match.index;
        match.groups = hit;
        //console.log('from ' + match.index.toString() + ' to ' + match.lastIndex.toString());
        result.push(match);
    }
    that.lastIndex = 0;
    return result;
};
RegExp.prototype.Match = function (value) {
    var hit;
    var result = null;
    var that = eval('this');
    that.lastIndex = 0;
    if (hit = that.exec(value)) {
        result = new RegularExpressionMatch();
        result.index = hit.index;
        result.lastIndex = that.lastIndex;
        result.length = result.lastIndex - result.index;
        result.groups = hit;
    }
    return result;
};
RegExp.prototype.IsMatch = function (value) {
    var that = eval('this');
    that.lastIndex = 0;
    return that.test(value);
};
var Insertion = (function () {
    function Insertion() {
    }
    Insertion.Compare = function (a, b) {
        return (a.index > b.index) ? 1 : ((a.index < b.index) ? -1 : 0);
    };
    return Insertion;
}());
var PasswordUtil = (function () {
    function PasswordUtil() {
    }
    PasswordUtil.checkPasswordStrength = function (password) {
        var score = 0;
        if (password.length < 6)
            return 0;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/))
            score += 1;
        if (password.match(/\d+/))
            score += 1;
        if (password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/))
            score += 1;
        if (password.length > 12)
            score += 1;
        return score;
    };
    return PasswordUtil;
}());
var EmailUtil = (function () {
    function EmailUtil() {
    }
    EmailUtil.isValid = function (email) {
        return EmailUtil.pattern.IsMatch(email);
    };
    EmailUtil.pattern = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return EmailUtil;
}());
Array.prototype.add = function (item) {
    var that = eval('this');
    that.push(item);
    if (that.onInsert)
        that.onInsert(that, item, that.length);
};
Array.prototype.insert = function (item, index) {
    var that = eval('this');
    that.splice(index, 0, item);
    if (that.onInsert)
        that.onInsert(that, item, index);
};
Array.prototype.clear = function () {
    var that = eval('this');
    that.splice(0, that.length);
    if (that.onClear)
        that.onClear(that);
};
Array.prototype.removeAt = function (index) {
    var that = eval('this');
    var item = that[index];
    that.splice(index, 1);
    if (that.onRemoveAt)
        that.onRemoveAt(that, item, index);
};
Array.prototype.remove = function (item) {
    var that = eval('this');
    var index = that.indexOf(item);
    that.splice(index, 1);
    if (that.onRemoveAt)
        that.onRemoveAt(that, item, index);
};
Array.prototype.moveTo = function (from, to) {
    var that = eval('this');
    var item = that[from];
    that.splice(from, 1);
    that.splice(to, 0, item);
    if (that.onMoveTo)
        that.onMoveTo(that, item, from, to);
};
Array.prototype.addUnique = function (item) {
    var that = eval('this');
    if (that.uniqueComparer) {
        if (!that.some(function (value, index, array) { return that.uniqueComparer(value, item); })) {
            that.add(item);
            return true;
        }
        else {
            return false;
        }
    }
    else {
        if (!that.some(function (value, index, array) { return value === item; })) {
            that.add(item);
            return true;
        }
        else {
            return false;
        }
    }
};
Array.prototype.contains = function (item) {
    var that = eval('this');
    if (that.uniqueComparer) {
        return that.some(function (value, index, array) { return that.uniqueComparer(value, item); });
    }
    else {
        return that.some(function (value, index, array) { return value === item; });
    }
};
Array.prototype.intersectWith = function (arr) {
    var that = eval('this');
    var results = [];
    if (that.uniqueComparer) {
        results.uniqueComparer = that.uniqueComparer;
    }
    else {
        results.uniqueComparer = arr.uniqueComparer;
    }
    for (var i = 0; i < that.length; i++) {
        var item = that[i];
        if (that.contains(item) && arr.contains(item))
            results.addUnique(item);
    }
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        if (that.contains(item) && arr.contains(item))
            results.addUnique(item);
    }
    return results;
};
Array.prototype.unionWith = function (arr) {
    var that = eval('this');
    var results = [];
    if (that.uniqueComparer) {
        results.uniqueComparer = that.uniqueComparer;
    }
    else {
        results.uniqueComparer = arr.uniqueComparer;
    }
    for (var i = 0; i < that.length; i++) {
        results.addUnique(that[i]);
    }
    for (var i = 0; i < arr.length; i++) {
        results.addUnique(arr[i]);
    }
    return results;
};
Array.prototype.addRange = function (items) {
    var that = eval('this');
    items.forEach(function (item) {
        that.push(item);
        if (that.onInsert)
            that.onInsert(that, item, that.length);
    });
};
Array.prototype.combine = function (items) {
    var that = eval('this');
    var arr = [];
    that.forEach(function (item) {
        arr.push(item);
    });
    items.forEach(function (item) {
        arr.push(item);
    });
    return arr;
};
Array.prototype.count = function (filter) {
    var that = eval('this');
    if (filter) {
        var count = 0;
        for (var i = 0; i < that.length; i++) {
            var index = i;
            count += filter(that[index], index, that) ? 1 : 0;
        }
        return count;
    }
    else {
        return that.length;
    }
};
Array.prototype.sum = function (accumulator) {
    var that = eval('this');
    if (accumulator) {
        var sum = 0;
        for (var i = 0; i < that.length; i++) {
            var index = i;
            sum += accumulator(that[index], index, that);
        }
        return sum;
    }
    else {
        return that.length;
    }
};
Array.prototype.collect = function (callback) {
    var that = eval('this');
    var results = [];
    if (callback) {
        for (var i = 0; i < that.length; i++) {
            var index = i;
            callback(that[index], index, that).forEach(function (value) { return results.push(value); });
        }
    }
    return results;
};
Array.prototype.collectUnique = function (callback) {
    var that = eval('this');
    var results = [];
    if (callback) {
        for (var i = 0; i < that.length; i++) {
            var index = i;
            callback(that[index], index, that).forEach(function (value) { return results.addUnique(value); });
        }
    }
    return results;
};
function isValidNumber(value) {
    if (typeof value == 'number') {
        return !isNaN(value);
    }
    return false;
}
//# sourceMappingURL=stringutil.js.map
var ProteinUtil = (function () {
    function ProteinUtil() {
    }
    ProteinUtil.parseTriplet = function (code) {
        var triplet = code.toUpperCase();
        switch (triplet) {
            case 'PHE': return 'F';
            case 'LEU': return 'L';
            case 'SER': return 'S';
            case 'TYR': return 'Y';
            case 'CYS': return 'C';
            case 'TRP': return 'W';
            case 'PRO': return 'P';
            case 'HIS': return 'H';
            case 'GLN': return 'Q';
            case 'ARG': return 'R';
            case 'ILE': return 'I';
            case 'MET': return 'M';
            case 'THR': return 'T';
            case 'ASN': return 'N';
            case 'LYS': return 'K';
            case 'VAL': return 'V';
            case 'ALA': return 'A';
            case 'ASP': return 'D';
            case 'GLU': return 'E';
            case 'GLY': return 'G';
        }
    };
    ProteinUtil.AnalyzeFASTA = function (value) {
        var mc = ProteinUtil.ptnFASTA.Matches(value);
        var title;
        var body;
        var end;
        var sequences = [];
        for (var i = 0; i < mc.length; i++) {
            title = mc[i].groups[0];
            if (i < mc.length - 1) {
                end = mc[i + 1].index;
                body = value.substring(mc[i].lastIndex, end);
            }
            else {
                end = value.length;
                body = value.substring(mc[i].lastIndex, end);
            }
            var protein = new Solubility.ProteinSequence();
            if (ProteinUtil.ptnUniProtTitle.IsMatch(title)) {
                var m = ProteinUtil.ptnUniProtTitle.Match(title);
                protein.ID = m.groups[2];
                protein.link = 'http://www.uniprot.org/uniprot/' + protein.ID;
                var mx = ProteinUtil.ptnUniProtKey.Matches(m.groups[3]);
                var key;
                var sec;
                var secEnd;
                for (var j = 0; j < mx.length; j++) {
                    key = mx[j].groups[0];
                    if (j < mx.length - 1) {
                        secEnd = mx[j + 1].index;
                        sec = m.groups[3].substring(mx[j].lastIndex, secEnd);
                    }
                    else {
                        secEnd = m.groups[3].length;
                        sec = m.groups[3].substring(mx[j].lastIndex, secEnd);
                    }
                    //console.log('key:' + key + ':' + sec);
                    if (key == ' OS=') {
                        protein.source = sec;
                    }
                }
            }
            else {
                protein.ID = title.substr(1);
            }
            protein.sequence = ProteinUtil.AminoAcidFilter(body);
            sequences.push(protein);
        }
        return sequences;
    };
    ProteinUtil.AminoAcidFilter = function (value) {
        var mc = ProteinUtil.AminoAcidPattern.Matches(value);
        var code = [];
        for (var j = 0; j < mc.length; j++) {
            code.push(mc[j].groups[0].toUpperCase());
        }
        return code.join('');
    };
    ProteinUtil.GetResidueHydrophobicity = function (code) {
        switch (code) {
            //Case "ala", "a"
            //    Return 1.8#
            case 'A': return 1.8;
            //Case "arg", "r"
            //    Return -4.5#
            case 'R': return -4.5;
            //Case "asn", "n"
            //    Return -3.5#
            case 'N': return -3.5;
            //Case "asp", "d"
            //    Return -3.5#
            case 'D': return -3.5;
            //Case "cys", "c"
            //    Return 2.5#
            case 'C': return 2.5;
            //Case "glu", "e"
            //    Return -3.5#
            case 'E': return -3.5;
            //Case "gln", "q"
            //    Return -3.5#
            case 'Q': return -3.5;
            //Case "gly", "g"
            //    Return -0.4#
            case 'G': return -0.4;
            //Case "his", "h"
            //    Return -3.2#
            case 'H': return -3.2;
            //Case "ile", "i"
            //    Return 4.5#
            case 'I': return 4.5;
            //Case "leu", "l"
            //    Return 3.8#
            case 'L': return 3.8;
            //Case "lys", "k"
            //    Return -3.9#
            case 'K': return -3.9;
            //Case "met", "m"
            //    Return 1.9#
            case 'M': return 1.9;
            //Case "phe", "f"
            //    Return 2.8#
            case 'F': return 2.8;
            //Case "pro", "p"
            //    Return -1.6#
            case 'P': return 1.6;
            //Case "ser", "s"
            //    Return -0.8#
            case 'S': return -0.8;
            //Case "thr", "t"
            //    Return -0.7#
            case 'T': return -0.7;
            //Case "trp", "w"
            //    Return -0.9#
            case 'W': return -0.9;
            //Case "tyr", "y"
            //    Return -1.3#
            case 'Y': return -1.3;
            //Case "val", "v"
            //    Return 4.2#
            case 'V': return 4.2;
            //Case Else
            //    Return 0.0#
            default: return 0;
        }
    };
    ProteinUtil.IsCharge = function (code) {
        switch (code) {
            case 'R': return 1;
            case 'K': return 1;
            case 'D': return 1;
            case 'E': return 1;
            default: return 0;
        }
    };
    ProteinUtil.GetAliphaticIndex = function (code) {
        switch (code) {
            case 'A':
                return 1.0;
            case 'V':
                return 2.9;
            case 'L':
                return 3.9;
            case 'I':
                return 3.9;
            default:
                return 0;
        }
    };
    ProteinUtil.CalculateMaxContigousHydrophobic = function (sequence) {
        return ProteinUtil.ptnHydrophobic.Matches(sequence)
            .map(function (mHydro) { return mHydro.length; })
            .reduce(function (accumulated, value) { return accumulated > value ? accumulated : value; }, 0);
    };
    ProteinUtil.CalculateProteinParameters = function (protein) {
        var count = 0;
        var hydro = 0;
        var charge = 0;
        var pro = 0;
        var cys = 0;
        var ali = 0;
        var turn = 0;
        for (var i = 0; i < protein.sequence.length; i++) {
            count += 1;
            var chr = protein.sequence.charAt(i);
            hydro += ProteinUtil.GetResidueHydrophobicity(chr);
            charge += ProteinUtil.IsCharge(chr);
            if (chr == 'P')
                pro += 1;
            if (chr == 'C')
                cys += 1;
            if (ProteinUtil.ptnTurnForming.IsMatch(chr))
                turn += 1;
            ali += ProteinUtil.GetAliphaticIndex(chr);
        }
        protein.hydrophobicityAverage = hydro / count;
        protein.numberOfCharge = charge;
        protein.percentageOfCharge = charge / count * 100;
        protein.aliphaticIndex = ali / count * 100;
        protein.numberOfProline = pro;
        protein.percentageOfProline = pro / count * 100;
        protein.numberOfCysteine = cys;
        protein.percentageOfCysteine = cys / count * 100;
        protein.turnFormingRate = turn / count * 100;
        protein.maxContigousHydrophobic = ProteinUtil.CalculateMaxContigousHydrophobic(protein.sequence);
        //protein.created = PHPDate.now();
        return protein;
    };
    ProteinUtil.AminoAcidPattern = /[acdefghiklmnpqrstvwy]+/ig;
    ProteinUtil.ptnFASTA = />[^\n]+/g;
    ProteinUtil.ptnUniProtTitle = />(\w+)\|(\w+)\|([^\n]+)/g;
    ProteinUtil.ptnUniProtKey = /\s[\w]{2}=/g;
    ProteinUtil.ptnTurnForming = /[NDGSP]/ig;
    ProteinUtil.ptnHydrophobic = /[AFILVW]+/ig;
    return ProteinUtil;
}());
var FASTA = (function () {
    function FASTA() {
    }
    return FASTA;
}());
var Solubility;
(function (Solubility) {
    var ChainData = (function () {
        function ChainData() {
            this['@@Schema'] = 'Solubility';
            this['@@Table'] = 'ChainData';
        }
        return ChainData;
    }());
    Solubility.ChainData = ChainData;
    var ProteinProject = (function () {
        function ProteinProject() {
            var _this = this;
            this.proteins = [];
            this.chains = {};
            this.buildChains = function () {
                _this.proteins.collectUnique(function (pro) { return pro.models.map(function (model) { return model.ID; }); }).forEach(function (id) {
                    var key = id.toUpperCase();
                    if (!_this.chains[key]) {
                        _this.chains[key] = new StructureChain();
                        _this.chains[key].ID = key;
                    }
                });
            };
            this.getMissingChains = function () {
                var missing = [];
                for (var id in _this.chains) {
                    if (!_this.chains[id].surface)
                        missing.push(id);
                }
                return missing;
            };
            this['@@Schema'] = 'Solubility';
            this['@@Table'] = 'ProteinProject';
        }
        return ProteinProject;
    }());
    Solubility.ProteinProject = ProteinProject;
    var StructureChain = (function () {
        function StructureChain() {
            this['@@Schema'] = 'Solubility';
            this['@@Table'] = 'StructureChain';
        }
        return StructureChain;
    }());
    Solubility.StructureChain = StructureChain;
    var ProteinSequence = (function () {
        function ProteinSequence() {
            this.models = [];
            this['@@Schema'] = 'Solubility';
            this['@@Table'] = 'ProteinSequence';
        }
        Object.defineProperty(ProteinSequence.prototype, "model", {
            //get the first model of the models array;
            get: function () {
                if (!this.models)
                    return undefined;
                if (!this.models[0])
                    return undefined;
                return this.models[0];
            },
            enumerable: true,
            configurable: true
        });
        return ProteinSequence;
    }());
    Solubility.ProteinSequence = ProteinSequence;
    var StructureModel = (function () {
        function StructureModel() {
            this.hitHsps = [];
            this['@@Schema'] = 'Solubility';
            this['@@Table'] = 'StructureModel';
        }
        return StructureModel;
    }());
    Solubility.StructureModel = StructureModel;
    var HitHsp = (function () {
        function HitHsp() {
            this['@@Schema'] = 'Solubility';
            this['@@Table'] = 'HitHsp';
        }
        return HitHsp;
    }());
    Solubility.HitHsp = HitHsp;
    var ProjectCache = (function () {
        function ProjectCache() {
            this.proteins = [];
            this['@@Schema'] = 'Solubility';
            this['@@Table'] = 'ProjectCache';
        }
        return ProjectCache;
    }());
    Solubility.ProjectCache = ProjectCache;
})(Solubility || (Solubility = {}));
var ConditionNodeOptions = (function () {
    function ConditionNodeOptions() {
        this.methods = ['And', 'Or'];
        this.modes = ['value', 'tree'];
        this.operators = ['@', '!'];
    }
    return ConditionNodeOptions;
}());
var FieldCondition = (function () {
    function FieldCondition(name, conditions) {
        this.name = name;
        this.conditions = conditions;
    }
    FieldCondition.numberConditions = ['=', '>', '<', '>=', '<=', '!='];
    FieldCondition.stringConditions = ['Equals', 'Contains', 'BeginWith', 'EndWith', 'RegularExpressionMatch'];
    return FieldCondition;
}());
var ConditionNode = (function () {
    function ConditionNode(options, parent) {
        var _this = this;
        this.items = [];
        this.initialize = function () {
            _this.method = _this.options.methods[0];
            _this.mode = _this.options.modes[0];
            _this.operator = _this.options.operators[0];
        };
        this.switchMethod = function () {
            if (!_this.method) {
                _this.method = _this.options.methods[0];
            }
            else {
                var index = _this.options.methods.indexOf(_this.method);
                index += 1;
                if (index >= _this.options.methods.length)
                    index = 0;
                _this.method = _this.options.methods[index];
            }
        };
        this.addEntry = function () {
            _this.items.add(new ConditionNode(_this.options, _this));
        };
        this.switchNot = function () {
            if (!_this.operator) {
                _this.operator = _this.options.operators[0];
            }
            else {
                var index = _this.options.operators.indexOf(_this.operator);
                index += 1;
                if (index >= _this.options.operators.length)
                    index = 0;
                _this.operator = _this.options.operators[index];
            }
        };
        this.switchMode = function () {
            if (!_this.mode) {
                _this.mode = _this.options.modes[0];
            }
            else {
                var index = _this.options.modes.indexOf(_this.mode);
                index += 1;
                if (index >= _this.options.modes.length)
                    index = 0;
                _this.mode = _this.options.modes[index];
            }
            if (_this.onModeChanged)
                _this.onModeChanged();
        };
        this.remove = function () {
            if (_this.parent)
                _this.parent.items.remove(_this);
        };
        this.options = options;
        this.parent = parent;
        this.initialize();
    }
    return ConditionNode;
}());
//# sourceMappingURL=proteinutil.js.map
var Bounds3D = (function () {
    function Bounds3D() {
        var _this = this;
        this.Includes = function (point) {
            if (typeof point.x == 'number' && !isNaN(point.x)) {
                if (typeof _this.xMin == 'number' && !isNaN(_this.xMin)) {
                    _this.xMin = _this.xMin < point.x ? _this.xMin : point.x;
                }
                else {
                    _this.xMin = point.x;
                }
                if (typeof _this.xMax == 'number' && !isNaN(_this.xMax)) {
                    _this.xMax = _this.xMax > point.x ? _this.xMax : point.x;
                }
                else {
                    _this.xMax = point.x;
                }
            }
            if (typeof point.y == 'number' && !isNaN(point.y)) {
                if (typeof _this.yMin == 'number' && !isNaN(_this.yMin)) {
                    _this.yMin = _this.yMin < point.y ? _this.yMin : point.y;
                }
                else {
                    _this.yMin = point.y;
                }
                if (typeof _this.yMax == 'number' && !isNaN(_this.yMax)) {
                    _this.yMax = _this.yMax > point.y ? _this.yMax : point.y;
                }
                else {
                    _this.yMax = point.y;
                }
            }
            if (typeof point.z == 'number' && !isNaN(point.z)) {
                if (typeof _this.zMin == 'number' && !isNaN(_this.zMin)) {
                    _this.zMin = _this.zMin < point.z ? _this.zMin : point.z;
                }
                else {
                    _this.zMin = point.z;
                }
                if (typeof _this.zMax == 'number' && !isNaN(_this.zMax)) {
                    _this.zMax = _this.zMax > point.z ? _this.zMax : point.z;
                }
                else {
                    _this.zMax = point.z;
                }
            }
        };
        this.Expand = function (vXMin, vXMax, vYMin, vYMax, vZMin, vZMax) {
            _this.xMin += vXMin;
            _this.xMax += vXMax;
            _this.yMin += vYMin;
            _this.yMax += vYMax;
            _this.zMin += vZMin;
            _this.zMax += vZMax;
        };
        this.Contains = function (position) {
            if (!(_this.xMin && _this.xMax && _this.yMin && _this.yMin && _this.zMin && _this.zMax))
                return false;
            return _this.xMin <= position.x && _this.xMax >= position.x && _this.yMin <= position.y && _this.yMax >= position.y && _this.zMin <= position.z && _this.zMax >= position.z;
        };
    }
    Bounds3D.prototype.toString = function () {
        return 'Bounds3D{xMin: ' + this.xMin + ', xMax: ' + this.xMax + ', yMin: ' + this.yMin + ', yMax: ' + this.yMax + ', zMin: ' + this.zMin + ', zMax: ' + this.zMax + '}';
    };
    return Bounds3D;
}());
var Vector3D = (function () {
    function Vector3D(x, y, z) {
        var _this = this;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.divide = function (divider) {
            _this.x /= divider;
            _this.y /= divider;
            _this.z /= divider;
        };
        this.divideBy = function (divider) {
            return new Vector3D(_this.x / divider, _this.y / divider, _this.z / divider);
        };
        this.multiplyBy = function (multiplier) {
            return new Vector3D(_this.x * multiplier, _this.y * multiplier, _this.z * multiplier);
        };
        this.add = function (value) {
            return new Vector3D(_this.x + value.x, _this.y + value.y, _this.z + value.z);
        };
        this.subtract = function (value) {
            return new Vector3D(_this.x - value.x, _this.y - value.y, _this.z - value.z);
        };
        this.orthogonalWith = function (that) {
            //if (this.x == 0 && this.y == 0 && this.z == 0) throw 'host vector is 0';
            //var tLength = target.length;
            //if (tLength == 0) throw 'target vector is 0';
            //var K = -(this.x * target.x + this.y * target.y + this.z * target.z) / this.lengthSquared;
            //var orth = target.add(this.multiplyBy(K));
            //var both = new Vector3D(this.y * orth.z - orth.y * this.z, this.z * orth.x - orth.z * this.x, this.x * orth.y - orth.x * this.y);
            //var bLength = both.length;
            //if (bLength == 0) throw 'host and target vectors are in the same direction.';
            // this.x this.y this.z
            // that.x that.y that.z
            var both = new Vector3D(_this.y * that.z - _this.z * that.y, _this.z * that.x - _this.x * that.z, _this.x * that.y - _this.y * that.x);
            var bLength = both.length;
            if (bLength == 0)
                throw 'host and target vectors are in the same direction.';
            both.divide(bLength);
            return both;
        };
        this.equals = function (value) {
            return _this.x == value.x && _this.y == value.y && _this.z == value.z;
        };
        if (typeof x == 'number' && !isNaN(x))
            this.x = x;
        if (typeof y == 'number' && !isNaN(y))
            this.y = y;
        if (typeof z == 'number' && !isNaN(z))
            this.z = z;
    }
    Object.defineProperty(Vector3D.prototype, "clone", {
        get: function () {
            return new Vector3D(this.x, this.y, this.z);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector3D.prototype, "length", {
        get: function () {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vector3D.prototype, "lengthSquared", {
        get: function () {
            return this.x * this.x + this.y * this.y + this.z * this.z;
        },
        enumerable: true,
        configurable: true
    });
    Vector3D.sum = function () {
        var vectors = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            vectors[_i - 0] = arguments[_i];
        }
        var result = new Vector3D();
        for (var i = 0; i < arguments.length; i++) {
            var item = arguments[i];
            result.x += item.x;
            result.y += item.y;
            result.z += item.z;
        }
        return result;
    };
    Vector3D.prototype.toString = function () {
        return this.x + ',' + this.y + ',' + this.z;
    };
    return Vector3D;
}());
var PolyhedronBuilder = (function () {
    function PolyhedronBuilder(center, radius) {
        var _this = this;
        this.Surfaces = [];
        this.TrySubtract = function (vPoint, vRadius) {
            var sur = DirectionalSurface3D.TryGetDirectionalSurface(_this.Center, _this.Radius, vPoint, vRadius);
            if (sur)
                _this.Surfaces.push(sur);
        };
        this.IsEmpty = function (isDebugging) {
            var Vertices = [];
            var count = 0;
            //var debugLines: string[] = [];
            _this.Surfaces.eachCombination(3, function (com) {
                var p = Vertex.TryGetVertex(com[0], com[1], com[2]);
                //console.log('vertex:');
                //console.log(p);
                if (p) {
                    //if (isDebugging && count < 1000) {
                    //    debugLines.push(p.toString() + '\r\n');
                    //    count += 1;
                    //}
                    var dis = p.subtract(_this.Center);
                    if (isDebugging && (count == 3185 || count == 3201))
                        console.log(count + ',' + dis.toString() + ',' + dis.length.toString() + ',' + _this.Radius);
                    if ((Math.abs(dis.x) <= _this.Radius + 0.0001) && (Math.abs(dis.y) <= _this.Radius + 0.0001) && (Math.abs(dis.z) <= _this.Radius + 0.0001) && (dis.length >= _this.Radius - 0.0001)) {
                        if (_this.Surfaces.every(function (surf) { return surf.IsPositive(p); })) {
                            Vertices.push(p);
                        }
                    }
                }
                count += 1;
            });
            return Vertices.length == 0;
        };
        this.Center = center;
        this.Radius = radius;
        this.Surfaces.push(set(new DirectionalSurface3D(), function (ds) {
            ds.X = 1.0;
            ds.Y = 0.0;
            ds.Z = 0.0;
            ds.C = center.x + radius;
            ds.Origin = new Vector3D(center.x + radius, 0.0, 0.0);
            ds.Direction = new Vector3D(-1.0, 0.0, 0.0);
        }), set(new DirectionalSurface3D(), function (ds) {
            ds.X = 1.0;
            ds.Y = 0.0;
            ds.Z = 0.0;
            ds.C = center.x - radius;
            ds.Origin = new Vector3D(center.x - radius, 0.0, 0.0);
            ds.Direction = new Vector3D(1.0, 0.0, 0.0);
        }), set(new DirectionalSurface3D(), function (ds) {
            ds.X = 0.0;
            ds.Y = 1.0;
            ds.Z = 0.0;
            ds.C = center.y + radius;
            ds.Origin = new Vector3D(0.0, center.y + radius, 0.0);
            ds.Direction = new Vector3D(0.0, -1.0, 0.0);
        }), set(new DirectionalSurface3D(), function (ds) {
            ds.X = 0.0;
            ds.Y = 1.0;
            ds.Z = 0.0;
            ds.C = center.y - radius;
            ds.Origin = new Vector3D(0.0, center.y - radius, 0.0);
            ds.Direction = new Vector3D(0.0, 1.0, 0.0);
        }), set(new DirectionalSurface3D(), function (ds) {
            ds.X = 0.0;
            ds.Y = 0.0;
            ds.Z = 1.0;
            ds.C = center.z + radius;
            ds.Origin = new Vector3D(0.0, 0.0, center.z + radius);
            ds.Direction = new Vector3D(0.0, 0.0, -1.0);
        }), set(new DirectionalSurface3D(), function (ds) {
            ds.X = 0.0;
            ds.Y = 0.0;
            ds.Z = 1.0;
            ds.C = center.z - radius;
            ds.Origin = new Vector3D(0.0, 0.0, center.z - radius);
            ds.Direction = new Vector3D(0.0, 0.0, 1.0);
        }));
    }
    PolyhedronBuilder.prototype.toString = function () {
        var lines = [];
        lines.push('PolyhedronBuilder Start:\r\n');
        lines.push('Center,' + this.Center.toString() + '\r\n');
        lines.push('Radius,' + this.Radius + '\r\n');
        this.Surfaces.forEach(function (surface) { return lines.push(surface.toString() + '\r\n'); });
        lines.push('End PolyhedronBuilder\r\n');
        return lines.join('');
    };
    return PolyhedronBuilder;
}());
function set(obj, func) {
    func(obj);
    return obj;
}
var DirectionalSurface3D = (function () {
    function DirectionalSurface3D() {
    }
    /**
     * Determine if the point is a convex vectex.
     * @param TestPoint
     */
    DirectionalSurface3D.prototype.IsPositive = function (TestPoint) {
        return this.Direction.x * TestPoint.x + this.Direction.y * TestPoint.y + this.Direction.z * TestPoint.z >=
            this.Direction.x * this.Origin.x + this.Direction.y * this.Origin.y + this.Direction.z * this.Origin.z;
        //return this.Direction.x * (TestPoint.x - this.Origin.x) + this.Direction.y * (TestPoint.y - this.Origin.y) + this.Direction.z * (TestPoint.z - this.Origin.z) >= 0.0;
    };
    DirectionalSurface3D.TryGetDirectionalSurface = function (HostCenter, HostRadius, SubtractCenter, SubtractRadius) {
        var dis = HostCenter.subtract(SubtractCenter);
        if (dis.length > HostRadius + SubtractRadius)
            return null;
        var X = 2.0 * dis.x;
        var Y = 2.0 * dis.y;
        var Z = 2.0 * dis.z;
        var C = HostCenter.lengthSquared - SubtractCenter.lengthSquared + SubtractRadius * SubtractRadius - HostRadius * HostRadius;
        var D = X * dis.x + Y * dis.y + Z * dis.z;
        var DK = X * HostCenter.x + Y * HostCenter.y + Z * HostCenter.z - C;
        var K = DK / D;
        var ds3D = new DirectionalSurface3D();
        ds3D.X = X;
        ds3D.Y = Y;
        ds3D.Z = Z;
        ds3D.C = C;
        //console.log('ds3D.C: ' + ds3D.C.toString());
        ds3D.Origin = new Vector3D(HostCenter.x - dis.x * K, HostCenter.y - dis.y * K, HostCenter.z - dis.z * K);
        ds3D.Direction = dis;
        //var verifyL = ds3D.X * ds3D.Origin.x + ds3D.Y * ds3D.Origin.y + ds3D.Z * ds3D.Origin.z;
        //var verifyC = ds3D.C;
        return ds3D;
    };
    DirectionalSurface3D.prototype.isInSurface = function (point) {
        return Math.abs(point.x * this.X + point.y * this.Y + point.z * this.Z - this.C) < 1e-10;
    };
    DirectionalSurface3D.prototype.toString = function () {
        return this.X + ',' + this.Y + ',' + this.Z + ',' + this.C + ',' + this.Origin.toString() + ',' + this.Direction.toString();
    };
    return DirectionalSurface3D;
}());
var Edge = (function () {
    function Edge() {
    }
    Edge.isOutOfBox = function (fe1, fe2, radius) {
        //var direction = fe1.orthogonalWith(fe2);
        var sqrBase = fe2.Y * fe1.Z - fe1.Y * fe2.Z;
        var sqr2 = sqrBase * sqrBase;
        var rp1 = fe1.Y * fe1.Y + fe1.Z * fe1.Z;
        var rp2 = fe1.Y * fe2.Y + fe1.Z * fe2.Z;
        var rp3 = fe2.Y * fe2.Y + fe2.Z * fe2.Z;
        var canGetLine = -sqr2 *
            (fe2.C * fe2.C * (fe1.X * fe1.X + rp1) -
                2 * fe1.C * fe2.C * (fe1.X * fe2.X + rp2) +
                fe1.C * fe1.C * (fe2.X * fe2.X + rp3) -
                3 * radius * radius * (fe2.X * fe2.X * rp1 + sqr2 - 2 * fe1.X * fe2.X * rp2 + fe1.X * fe1.X * rp3));
        return canGetLine < -0.0001;
    };
    return Edge;
}());
var Vertex = (function () {
    function Vertex() {
    }
    /**
     * Solve the surface equation to obtain the point
     * @param fe1
     * @param fe2
     * @param fe3
     */
    Vertex.TryGetVertex = function (fe1, fe2, fe3) {
        //console.log(fe1, fe2, fe3);
        var D = Vertex.Determinant(fe1.X, fe1.Y, fe1.Z, fe2.X, fe2.Y, fe2.Z, fe3.X, fe3.Y, fe3.Z);
        var DX = Vertex.Determinant(fe1.C, fe1.Y, fe1.Z, fe2.C, fe2.Y, fe2.Z, fe3.C, fe3.Y, fe3.Z);
        var DY = Vertex.Determinant(fe1.X, fe1.C, fe1.Z, fe2.X, fe2.C, fe2.Z, fe3.X, fe3.C, fe3.Z);
        var DZ = Vertex.Determinant(fe1.X, fe1.Y, fe1.C, fe2.X, fe2.Y, fe2.C, fe3.X, fe3.Y, fe3.C);
        //console.log(D, DX, DY, DZ);
        if (D == 0.0) {
            return null;
        }
        else {
            var point = new Vector3D(DX / D, DY / D, DZ / D);
            //if (!fe1.isInSurface(point)) console.log(point.toString() + ' not in ' + fe1.toString());
            //if (!fe2.isInSurface(point)) console.log(point.toString() + ' not in ' + fe2.toString());
            //if (!fe3.isInSurface(point)) console.log(point.toString() + ' not in ' + fe3.toString());
            return point;
        }
    };
    Vertex.Determinant = function (a1, b1, c1, a2, b2, c2, a3, b3, c3) {
        return a1 * b2 * c3 + b1 * c2 * a3 + c1 * a2 * b3 - c1 * b2 * a3 - b1 * a2 * c3 - a1 * c2 * b3;
    };
    return Vertex;
}());
Array.prototype.eachCombination = function (size, action) {
    var that = eval('this');
    var length = that.length;
    if (size > length)
        return;
    var iterator = (function () {
        function iterator(from, level, indices) {
            if (level > size) {
                action(indices.map(function (index) { return that[index]; }));
            }
            else {
                for (var i = from; i < length - size + level; i++) {
                    indices[level] = i;
                    var next = indices.filter(function (value) { return true; });
                    new iterator(i + 1, level + 1, next);
                }
            }
        }
        return iterator;
    }());
    new iterator(0, 1, []);
};
Array.prototype.eachCombinationCheck2 = function (size, check2, action) {
    var that = eval('this');
    var length = that.length;
    if (size > length)
        return;
    var iterator = (function () {
        function iterator(from, level, indices) {
            if (level == 3) {
                //console.log(indices);
                if (check2(that[indices[0]], that[indices[1]]))
                    return;
            }
            if (level > size) {
                action(indices.map(function (index) { return that[index]; }));
            }
            else {
                for (var i = from; i < length - size + level; i++) {
                    indices[level - 1] = i;
                    var next = indices.filter(function (value) { return true; });
                    new iterator(i + 1, level + 1, next);
                }
            }
        }
        return iterator;
    }());
    new iterator(0, 1, []);
};
Array.prototype.someCombinationCheck2 = function (size, check2, action) {
    var that = eval('this');
    var length = that.length;
    if (size > length)
        return false;
    var result = false;
    var iterator = (function () {
        function iterator(from, level, indices) {
            if (level == 3) {
                //console.log(indices);
                if (check2(that[indices[0]], that[indices[1]]))
                    return;
            }
            if (level > size) {
                result = action(indices.map(function (index) { return that[index]; }));
                if (result)
                    return;
            }
            else {
                for (var i = from; i < length - size + level; i++) {
                    indices[level - 1] = i;
                    var next = indices.filter(function (value) { return true; });
                    new iterator(i + 1, level + 1, next);
                    if (result)
                        return;
                }
            }
        }
        return iterator;
    }());
    new iterator(0, 1, []);
    //console.log('result:', result);
    return result;
};
module.exports.Vector3D = Vector3D;
module.exports.Bounds3D = Bounds3D;
module.exports.PolyhedronBuilder = PolyhedronBuilder;
//# sourceMappingURL=geometry.js.map
var PolyhedronBuilder2 = (function () {
    function PolyhedronBuilder2(center, atomRadius, waterRadius, options) {
        var _this = this;
        this.Surfaces = [];
        this.TrySubtract = function (subtractAtomPosition, subtractAtomRadius) {
            var sur = DirectionalSurface3D2.TryGetDirectionalSurface(_this.AtomRadius, subtractAtomPosition.subtract(_this.Center), subtractAtomRadius, _this.WaterRadius, _this.options);
            if (sur)
                _this.Surfaces.push(sur);
        };
        this.IsEmpty = function (isDebugging) {
            //var Vertices: Vector3D[] = [];
            //var count = 0;
            var point = _this.Surfaces.someCombinationCheck2(3, function (item1, item2) { return Edge.isOutOfBox(item1, item2, _this.boxUnit); }, function (com) {
                var p = Vertex.TryGetVertex(com[0], com[1], com[2]);
                if (p) {
                    if ((Math.abs(p.x) <= (_this.boxUnit)) && (Math.abs(p.y) <= (_this.boxUnit)) && (Math.abs(p.z) <= (_this.boxUnit)) && (p.length >= _this.boxUnit)) {
                        if (_this.Surfaces.every(function (surf) {
                            if (com.indexOf(surf) > -1)
                                return true;
                            return surf.IsPositive(p);
                        }))
                            return p;
                    }
                }
                return false;
            });
            //theoreticall we should be able to make a 'water molecule' at the position of the point;
            //here we check if that's correct:
            if (point)
                _this.FoundPoint = point;
            //if (isDebugging && point) {
            //    console.log('point: ', point);
            //    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>Point to Center > Radius: ', point.length > this.Radius, point.length, this.Radius);
            //    this.Surfaces.every((surface) => {
            //        if (!surface.AtomCenter) return true;
            //        var dis = point.subtract(surface.AtomCenter);
            //        var result = dis.length >= surface.AtomRadius;
            //        //console.log('Point to Atom > Radius: ', result, dis.length, surface.AtomRadius, surface.AtomCenter);
            //        //console.log(dis);
            //        return result;
            //    });
            //}
            return !point;
            //return count == 0;
        };
        this.Center = center;
        this.AtomRadius = atomRadius;
        this.WaterRadius = waterRadius;
        this.boxUnit = atomRadius * options.centerAtomFactor + waterRadius;
        var boxUnit = this.boxUnit;
        this.options = options;
        this.Surfaces.push(set(new DirectionalSurface3D2(), function (ds) {
            ds.X = 1.0;
            ds.Y = 0.0;
            ds.Z = 0.0;
            ds.C = boxUnit;
            ds.Origin = ds.multiplyAsVector3D(boxUnit);
            ds.Direction = ds.multiplyAsVector3D(-1);
        }), set(new DirectionalSurface3D2(), function (ds) {
            ds.X = -1.0;
            ds.Y = 0.0;
            ds.Z = 0.0;
            ds.C = boxUnit;
            ds.Origin = ds.multiplyAsVector3D(boxUnit);
            ds.Direction = ds.multiplyAsVector3D(-1);
        }), set(new DirectionalSurface3D2(), function (ds) {
            ds.X = 0.0;
            ds.Y = 1.0;
            ds.Z = 0.0;
            ds.C = boxUnit;
            ds.Origin = ds.multiplyAsVector3D(boxUnit);
            ds.Direction = ds.multiplyAsVector3D(-1);
        }), set(new DirectionalSurface3D2(), function (ds) {
            ds.X = 0.0;
            ds.Y = -1.0;
            ds.Z = 0.0;
            ds.C = boxUnit;
            ds.Origin = ds.multiplyAsVector3D(boxUnit);
            ds.Direction = ds.multiplyAsVector3D(-1);
        }), set(new DirectionalSurface3D2(), function (ds) {
            ds.X = 0.0;
            ds.Y = 0.0;
            ds.Z = 1.0;
            ds.C = boxUnit;
            ds.Origin = ds.multiplyAsVector3D(boxUnit);
            ds.Direction = ds.multiplyAsVector3D(-1);
        }), set(new DirectionalSurface3D2(), function (ds) {
            ds.X = 0.0;
            ds.Y = 0.0;
            ds.Z = -1.0;
            ds.C = boxUnit;
            ds.Origin = ds.multiplyAsVector3D(boxUnit);
            ds.Direction = ds.multiplyAsVector3D(-1);
        }));
    }
    PolyhedronBuilder2.prototype.toString = function () {
        var lines = [];
        lines.push('PolyhedronBuilder Start:\r\n');
        lines.push('Center,' + this.Center.toString() + '\r\n');
        lines.push('Radius,' + this.AtomRadius + '\r\n');
        this.Surfaces.forEach(function (surface) { return lines.push(surface.toString() + '\r\n'); });
        lines.push('End PolyhedronBuilder\r\n');
        return lines.join('');
    };
    PolyhedronBuilder2.Zero = new Vector3D();
    return PolyhedronBuilder2;
}());
var DirectionalSurface3D2 = (function () {
    function DirectionalSurface3D2() {
        var _this = this;
        /*
         * This calculates the direct of the shared edge
         */
        this.orthogonalWith = function (that) {
            var both = new Vector3D(_this.Y * that.Z - _this.Z * that.Y, _this.Z * that.X - _this.X * that.Z, _this.X * that.Y - _this.Y * that.X);
            var bLength = both.length;
            if (bLength == 0)
                throw 'host and target vectors are in the same direction.';
            both.divide(bLength);
            return both;
        };
    }
    /**
     * Determine if the point is a convex vectex.
     * @param TestPoint
     */
    DirectionalSurface3D2.prototype.IsPositive = function (TestPoint) {
        var left = this.Direction.x * TestPoint.x + this.Direction.y * TestPoint.y + this.Direction.z * TestPoint.z;
        var right = this.Direction.x * this.Origin.x + this.Direction.y * this.Origin.y + this.Direction.z * this.Origin.z;
        var result = left >= right;
        //console.log('IsPositive:', result, left, right, this);
        return result;
        //return this.Direction.x * TestPoint.x + this.Direction.y * TestPoint.y + this.Direction.z * TestPoint.z >=
        //    this.Direction.x * this.Origin.x + this.Direction.y * this.Origin.y + this.Direction.z * this.Origin.z;
        //return this.Direction.x * (TestPoint.x - this.Origin.x) + this.Direction.y * (TestPoint.y - this.Origin.y) + this.Direction.z * (TestPoint.z - this.Origin.z) >= 0.0;
    };
    DirectionalSurface3D2.TryGetDirectionalSurface = function (CenterAtomRadius, DisplacementToCenterAtom, SubtractAtomRadius, WaterRadius, options) {
        //console.log('TryGetDirectionalSurface', SubtractCenter, SubtractRadius);
        //we assume the origin is zero;
        //from (x^2 + y^2 + z^2 == r^2 and (x-px)^2 + (y-py)^2 + (z-pz)^2 ==R^2) 
        //we can get 2*px*x + 2*py*y + 2*pz*z == px^2 + py^2 + pz^2 + r^2 - R^2
        //therefore 
        var CenterRadius = CenterAtomRadius * options.subtractAtomFactor + WaterRadius;
        var SubtractRadius = SubtractAtomRadius * options.subtractAtomFactor + WaterRadius;
        var pXYZsquare = DisplacementToCenterAtom.lengthSquared;
        if (pXYZsquare == 0)
            throw 'overlapping atom';
        //var dis = SubtractCenter.multiplyBy(-1);;
        if (DisplacementToCenterAtom.length > CenterRadius + SubtractRadius)
            return null;
        var ds3D = new DirectionalSurface3D2();
        ds3D.X = 2.0 * DisplacementToCenterAtom.x;
        ds3D.Y = 2.0 * DisplacementToCenterAtom.y;
        ds3D.Z = 2.0 * DisplacementToCenterAtom.z;
        ds3D.C = pXYZsquare + CenterRadius * CenterRadius - SubtractRadius * SubtractRadius;
        ds3D.AtomCenter = DisplacementToCenterAtom;
        ds3D.AtomRadius = SubtractAtomRadius;
        // then the center of the surface (crossed by the line from Zero to the Subtract point has a common factor:
        // (px^2 + py^2 + pz^2 + r^2 - R^2)/(2 * (px^2 + py^2 + pz^2))
        var CrossPointFactor = ds3D.C / 2 / pXYZsquare;
        ds3D.Factor = CrossPointFactor;
        // {px, py, pz} * CrossPointFactor is the CrossPoint
        ds3D.Origin = DisplacementToCenterAtom.multiplyBy(CrossPointFactor);
        //Make the direction facing to the Origin (Zero);
        ds3D.Direction = DisplacementToCenterAtom.multiplyBy(-1);
        return ds3D;
    };
    DirectionalSurface3D2.prototype.isInSurface = function (point) {
        return Math.abs(point.x * this.X + point.y * this.Y + point.z * this.Z - this.C) < 1e-10;
    };
    DirectionalSurface3D2.prototype.toString = function () {
        return this.X + ',' + this.Y + ',' + this.Z + ',' + this.C + ',' + this.Origin.toString() + ',' + this.Direction.toString();
    };
    DirectionalSurface3D2.prototype.multiplyAsVector3D = function (multiplier) {
        return new Vector3D(this.X * multiplier, this.Y * multiplier, this.Z * multiplier);
    };
    return DirectionalSurface3D2;
}());
//# sourceMappingURL=geometry2.js.map
//1. is an amino residue truely buried?
//2. is 
var PDBParser = (function () {
    function PDBParser() {
    }
    PDBParser.parsePDB = function (value) {
        console.log('start parsing');
        var lines = value.split('\n');
        var ptnHeader = /^ATOM/ig;
        var titles = lines.filter(function (line) { return /^TITLE/ig.IsMatch(line); }).map(function (line) { return line.replace(/^TITLE\s{5}/ig, '').replace(/^TITLE\s{4}\d{1}\s/ig, '').replace(/^TITLE\s{3}\d{2}\s/ig, ''); });
        var sources = lines.filter(function (line) { return /^SOURCE/ig.IsMatch(line); }).map(function (line) { return line.replace(/^SOURCE\s{4}/ig, '').replace(/^SOURCE\s{3}\d{1}\s/ig, '').replace(/^SOURCE\s{2}\d{2}\s/ig, ''); });
        var title = titles.join('');
        var groups = /ORGANISM_SCIENTIFIC\: ([^;]+)/ig.exec(sources.join(''));
        var source;
        if (groups)
            if (groups[1])
                source = groups[1];
        //var ptnAtom = /ATOM  \s*(\d+)\s*(\w+)\s*(\w+)\s*(\w+)\s*(\d+)\s+(\-?[\d\.]+)\s+(\-?[\d\.]+)\s+(\-?[\d\.]+)\s+(\-?[\d\.]+)\s+(\-?[\d\.]+)\s+(\w+)/ig;
        var atoms = lines.filter(function (line) { return ptnHeader.IsMatch(line); });
        var protein = new Structure();
        protein.title = title;
        protein.source = source;
        protein.pdbID = /\s+(\w+)\s*$/ig.Match(lines[0]).groups[1];
        atoms.forEach(function (a) {
            a = a.toUpperCase();
            var type = a.substr(12, 4).replace(/\s+/ig, '');
            var name;
            if (a.length >= 77) {
                name = a.substr(77, 1);
            }
            else {
                name = at.type.substr(0, 1);
            }
            if (name == 'H')
                return; //stop here, no hydrogens!
            var at = new Atom();
            //at.AtomName = a.Substring(12, 4).Replace(" ", "")
            at.type = type;
            at.name = name;
            //If Not Integer.TryParse(a.Substring(6, 5).Replace(" ", ""), at.ID) Then Stop
            at.ID = Number(a.substr(6, 5).replace(' ', ''));
            //at.Alternative = a.Substring(16, 1)
            at.alternative = a.substr(16, 1);
            //at.AminoAcid = AminoAcids.ParseTripletName(a.Substring(17, 3))
            at.aminoAcid = ProteinUtil.parseTriplet(a.substr(17, 3));
            //at.ChainName = a.Substring(21, 1)
            at.chainName = a.substr(21, 1);
            //If Not Integer.TryParse(a.Substring(22, 4).Replace(" ", ""), at.ResidueIndex) Then Stop
            at.residueIndex = Number(a.substr(22, 4).replace(' ', ''));
            //at.Insertion = a.Substring(26, 1)
            at.insertion = a.substr(26, 1);
            //If Not Double.TryParse(a.Substring(30, 8).Replace(" ", ""), posX) Then Stop
            at.position.x = Number(a.substr(30, 8).replace(' ', '')) / 10.0;
            //If Not Double.TryParse(a.Substring(38, 8).Replace(" ", ""), posY) Then Stop
            at.position.y = Number(a.substr(38, 8).replace(' ', '')) / 10.0;
            //If Not Double.TryParse(a.Substring(46, 8).Replace(" ", ""), posZ) Then Stop
            at.position.z = Number(a.substr(46, 8).replace(' ', '')) / 10.0;
            //at.Position = New Media3D.Point3D(posX / 10.0#, posY / 10.0#, posZ / 10.0#)
            //If a.Length >= 77 Then
            //at.Name = a.Substring(77, 1)
            //Else
            //at.Name = at.AtomName.Substring(0, 1)
            //End If
            //don't load 
            if (at.name != 'H')
                protein.allocate(at);
        });
        return protein;
    };
    return PDBParser;
}());
var Structure = (function () {
    function Structure() {
        var _this = this;
        this.chainDict = {};
        this.allocate = function (atom) {
            var chain = _this.chainDict[atom.chainName];
            if (!chain) {
                chain = new Chain();
                chain.parent = _this;
                chain.chainID = atom.chainName;
                chain.fullID = _this.pdbID + '_' + chain.chainID;
                _this.chainDict[atom.chainName] = chain;
            }
            chain.allocate(atom);
        };
    }
    return Structure;
}());
var Chain = (function () {
    function Chain() {
        var _this = this;
        this.residueDict = {};
        this.atoms = [];
        this.allocate = function (atom) {
            var residue = _this.residueDict[atom.residueIndex];
            if (!residue) {
                residue = new Residue();
                residue.index = atom.residueIndex;
                residue.name = atom.aminoAcid;
                _this.residueDict[atom.residueIndex] = residue;
            }
            _this.atoms.push(atom);
            residue.atoms.push(atom);
        };
    }
    Object.defineProperty(Chain.prototype, "center", {
        get: function () {
            var count = this.atoms.length;
            if (count <= 0)
                return new Vector3D();
            var x = 0;
            var y = 0;
            var z = 0;
            this.atoms.forEach(function (atom) {
                x += atom.position.x;
                y += atom.position.y;
                z += atom.position.z;
            });
            return new Vector3D(x / count, y / count, z / count);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Chain.prototype, "data", {
        get: function () {
            var data = new Solubility.ChainData();
            data.name = this.fullID;
            var residues = [];
            for (var key in this.residueDict) {
                var rs = this.residueDict[key];
                residues.push({
                    name: rs.name,
                    index: rs.index,
                    isSurface: rs.IsSurface
                });
            }
            residues.sort(function (a, b) {
                return (a.index > b.index) ? 1 : -1;
            });
            data.value = residues.map(function (rs) { return rs.name + rs.index + (rs.isSurface ? '+' : '-'); }).join('');
            data.title = this.parent.title;
            data.source = this.parent.source;
            return data;
        },
        enumerable: true,
        configurable: true
    });
    return Chain;
}());
var ResidueStatus = (function () {
    function ResidueStatus() {
    }
    return ResidueStatus;
}());
var Residue = (function () {
    function Residue() {
        var _this = this;
        this.atoms = [];
        this.GetPseudoBetaCarbonPosition = function () {
            var CA = _this.AtomByName('CA');
            var C = _this.AtomByName('C');
            var CB = _this.AtomByName('N');
            if (CA && C && CB) {
                var disA = CA.position.subtract(C.position);
                var disB = CB.position.subtract(C.position);
                var disC = disA.divideBy(disA.length).add(disB.divideBy(disB.length));
                disC.divide(disC.length);
                var BaseZ = disA.orthogonalWith(disB);
                return Vector3D.sum(disC.multiplyBy(Residue.CCBondLength * Residue.WidthProjection / disC.length), BaseZ.multiplyBy(Residue.CCBondLength * Residue.HeightProjection), CA.position);
            }
            else {
                return null;
            }
        };
        this.AtomByName = function (type) {
            var result;
            var atoms = _this.atoms.some(function (atom) {
                return (atom.type == type) ? ((result = atom), true) : false;
            });
            return result;
        };
        this.SearchDepth = function () {
            if (_this.name == 'G') {
                _this.Depth = _this.PseudoBetaDepth;
            }
            else {
                _this.Depth = 0;
                _this.atoms.forEach(function (at) {
                    switch (at.type) {
                        case 'C': break;
                        case 'O': break;
                        case 'N': break;
                        case 'CA': break;
                        default:
                            if (_this.Depth < at.Depth)
                                _this.Depth = at.Depth;
                    }
                });
            }
        };
        this.AverageDepth = function () {
            var types = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                types[_i - 0] = arguments[_i];
            }
            var sum = 0.0;
            var count = 0;
            types.forEach(function (type) {
                var at = _this.AtomByName(type);
                if (at) {
                    sum += at.Depth;
                    count += 1;
                }
            });
            if (count > 0) {
                return sum / count;
            }
            else {
                return 0.0;
            }
        };
        this.MaxDepth = function () {
            var types = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                types[_i - 0] = arguments[_i];
            }
            var max = 0;
            types.forEach(function (type) {
                var at = _this.AtomByName(type);
                if (at && max < at.Depth)
                    max = at.Depth;
            });
            return max;
        };
    }
    Residue.prototype.GetBounds3d = function () {
        var bounds = new Bounds3D();
        this.atoms.forEach(function (atom) { return bounds.Includes(atom.position); });
        return bounds;
    };
    Object.defineProperty(Residue.prototype, "center", {
        get: function () {
            var count = this.atoms.length;
            if (count <= 0)
                return new Vector3D();
            var x = 0;
            var y = 0;
            var z = 0;
            this.atoms.forEach(function (atom) {
                x += atom.position.x;
                y += atom.position.y;
                z += atom.position.z;
            });
            return new Vector3D(x / count, y / count, z / count);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Residue.prototype, "IsSurfaceByAtom", {
        get: function () {
            switch (this.name) {
                case 'A':
                    //N, CA, CB, C, O
                    return this.AverageDepth("CB") >= 0.165;
                case 'R':
                    //N, CA, CB, CG, CD, NE, CZ, NH1, NH2, C, O
                    return this.MaxDepth("NE", "NH1", "NH2") >= 0.165;
                case 'N':
                    //N, CA, CB, CG, OD1, ND2, C, O
                    return this.MaxDepth("OD1", "ND2") >= 0.165;
                case 'D':
                    //N, CA, CB, CG, OD1, OD2, C, O
                    return this.MaxDepth("OD1", "OD2") >= 0.165;
                case 'C':
                    //N, CA, CB, SG, C, O
                    return this.AverageDepth("CB", "SG") >= 0.165;
                case 'E':
                    //N, CA, CB, CG, CD, OE1, OE2, C, O
                    return this.MaxDepth("OE1", "OE2") >= 0.165;
                case 'Q':
                    //N, CA, CB, CG, CD, OE1, NE2, C, O
                    return this.MaxDepth("OE1", "NE2") >= 0.165;
                case 'G':
                    //N, CA, C, O
                    return this.PseudoBetaDepth >= 0.165;
                case 'H':
                    //N, CA, ND1, CG, CB, NE2, CD2, CE1, C, O
                    //N, CA, NE2, CD2, ND1, CG, CE1, CB, C, O
                    //N, CA, ND1, NE2, CE1, CD2, CG, CB, C, O
                    return this.MaxDepth("ND1", "NE2") >= 0.165;
                case 'I':
                    //N, CA, CB, CG2, CG1, CD, C, O
                    return this.AverageDepth("CB", "CG1", "CG2", "CD1") >= 0.165;
                case 'L':
                    //N, CA, CB, CG, CD1, CD2, C, O
                    return this.AverageDepth("CB", "CG", "CD1", "CD2") >= 0.165;
                case 'K':
                    //N, CA, CB, CG, CD, CE, NZ, C, O
                    return this.MaxDepth("NZ") >= 0.165;
                case 'M':
                    //N, CA, CB, CG, SD, CE, C, O
                    return this.AverageDepth("CB", "CG", "SD", "CE") >= 0.165;
                case 'F':
                    //N, CA, CB, CG, CD1, CD2, CE1, CE2, CZ, C, O
                    return this.AverageDepth("CB", "CG", "CD1", "CD2", "CE1", "CE2", "CZ") >= 0.165;
                case 'P':
                    //N, CA, CD, CB, CG, C, O
                    return this.AverageDepth("CB", "CG", "CD") >= 0.165;
                case 'S':
                    //N, CA, CB, OG, C, O
                    return this.MaxDepth("OG") >= 0.165;
                case 'T':
                    //N, CA, CB, OG1, CG2, C, O
                    return this.MaxDepth("OG1") >= 0.165;
                case 'W':
                    //N, CA, CB, CG, CD2, CD1, NE1, CE2, CE3, CZ2, CZ3, CH2, C, O
                    return this.AverageDepth("CD1", "NE1", "CE3", "CZ2", "CZ3", "CH2") >= 0.165;
                case 'Y':
                    //N, CA, CB, CG, CD1, CD2, CE1, CE2, CZ, OH, C, O
                    return (this.MaxDepth("OH") >= 0.165) || (this.AverageDepth("CD1", "CD2", "CE1", "CE2") >= 0.165);
                case 'V':
                    //N, CA, CB, CG1, CG2, C, O
                    return this.AverageDepth("CB", "CG1", "CG2") >= 0.165;
                default:
                    return false;
            }
        },
        enumerable: true,
        configurable: true
    });
    //for display
    Residue.prototype.BuildBonds = function () {
        var _this = this;
        var Bonds = [];
        var AddBond = function (AtomNameA, AtomNameB, bondNumber) {
            var A = _this.AtomByName(AtomNameA);
            var B = _this.AtomByName(AtomNameB);
            if (A != null && B != null) {
                //A.EngagedInBond = true;
                //B.EngagedInBond = true;
                Bonds.push({
                    Position1: A.position,
                    Position2: B.position,
                    BondNumber: bondNumber
                });
                return true;
            }
        };
        switch (this.name) {
            case 'A':
                //N, CA, CB, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                break;
            case 'R':
                //N, CA, CB, CG, CD, NE, CZ, NH1, NH2, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG");
                AddBond("CG", "CD");
                AddBond("CD", "NE");
                AddBond("NE", "CZ");
                AddBond("CZ", "NH1");
                AddBond("CZ", "NH2");
                break;
            case 'N':
                //N, CA, CB, CG, OD1, ND2, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG");
                AddBond("CG", "OD1");
                AddBond("CG", "ND2");
                break;
            case 'D':
                //N, CA, CB, CG, OD1, OD2, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG");
                AddBond("CG", "OD1");
                AddBond("CG", "OD2");
                break;
            case 'C':
                //N, CA, CB, SG, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "SG");
                break;
            case 'E':
                //N, CA, CB, CG, CD, OE1, OE2, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG");
                AddBond("CG", "CD");
                AddBond("CD", "OE1");
                AddBond("CD", "OE2");
                break;
            case 'Q':
                //N, CA, CB, CG, CD, OE1, NE2, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG");
                AddBond("CG", "CD");
                AddBond("CD", "OE1");
                AddBond("CD", "NE2");
                break;
            case 'G':
                //N, CA, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                break;
            case 'H':
                //N, CA, ND1, CG, CB, NE2, CD2, CE1, C, O
                //N, CA, NE2, CD2, ND1, CG, CE1, CB, C, O
                //N, CA, ND1, NE2, CE1, CD2, CG, CB, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG");
                AddBond("CG", "ND1");
                AddBond("CG", "CD2");
                AddBond("ND1", "CE1");
                AddBond("CD2", "NE2");
                AddBond("NE2", "CE1");
                break;
            case 'I':
                //N, CA, CB, CG2, CG1, CD, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG1");
                AddBond("CB", "CG2");
                AddBond("CG1", "CD1");
                break;
            case 'L':
                //N, CA, CB, CG, CD1, CD2, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG");
                AddBond("CG", "CD1");
                AddBond("CG", "CD2");
                break;
            case 'K':
                //N, CA, CB, CG, CD, CE, NZ, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG");
                AddBond("CG", "CD");
                AddBond("CD", "CE");
                AddBond("CE", "NZ");
                break;
            case 'M':
                //N, CA, CB, CG, SD, CE, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG");
                AddBond("CG", "SD");
                AddBond("SD", "CE");
                break;
            case 'F':
                //N, CA, CB, CG, CD1, CD2, CE1, CE2, CZ, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG");
                AddBond("CG", "CD1");
                AddBond("CG", "CD2");
                AddBond("CD1", "CE1");
                AddBond("CD2", "CE2");
                AddBond("CE1", "CZ");
                AddBond("CE2", "CZ");
                break;
            case 'P':
                //N, CA, CD, CB, CG, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG");
                AddBond("CG", "CD");
                break;
            case 'S':
                //N, CA, CB, OG, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "OG");
                break;
            case 'T':
                //N, CA, CB, OG1, CG2, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "OG1");
                AddBond("CB", "CG2");
                break;
            case 'W':
                //N, CA, CB, CG, CD2, CD1, NE1, CE2, CE3, CZ2, CZ3, CH2, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG");
                AddBond("CG", "CD1");
                AddBond("CG", "CD2");
                AddBond("CD1", "NE1");
                AddBond("CD2", "CE2");
                AddBond("CD2", "CE3");
                AddBond("NE1", "CE2");
                AddBond("CE2", "CZ2");
                AddBond("CE3", "CZ3");
                AddBond("CZ2", "CH2");
                AddBond("CZ3", "CH2");
                break;
            case 'Y':
                //N, CA, CB, CG, CD1, CD2, CE1, CE2, CZ, OH, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG");
                AddBond("CG", "CD1");
                AddBond("CG", "CD2");
                AddBond("CD1", "CE1");
                AddBond("CD2", "CE2");
                AddBond("CE1", "CZ");
                AddBond("CE2", "CZ");
                AddBond("CZ", "OH");
                break;
            case 'V':
                //N, CA, CB, CG1, CG2, C, O
                AddBond("N", "CA");
                AddBond("CA", "C");
                AddBond("C", "O", 2);
                AddBond("CA", "CB");
                AddBond("CB", "CG1");
                AddBond("CB", "CG2");
                break;
            default:
                break;
        }
        return Bonds;
    };
    Residue.CCBondLength = 0.153;
    Residue.CHBondLength = 0.109;
    Residue.OHBondLength = 0.096;
    Residue.NHBondLength = 0.1;
    Residue.SHBondLength = 0.1348;
    Residue.HeightProjection = 0.816496580927726; //sqrt(6)/3
    Residue.WidthProjection = 0.57735026918962573; //sqrt(3)/3
    Residue.CenterProjection = 0.33333333333333331;
    Residue.TopZProjection = 0.94280904158206336;
    Residue.BottomZProject = 0.47140452079103168;
    Residue.LeftYProjection = 0.816496580927726;
    Residue.TriangleHeightProjection = 0.8660254037844386;
    Residue.TriangleHalfProjection = 0.5;
    return Residue;
}());
var Atom = (function () {
    function Atom() {
        this.position = new Vector3D();
    }
    Object.defineProperty(Atom.prototype, "GetRadiusLiMinimumSet", {
        get: function () {
            return SurfaceSearch.RadiusLiMinimumSet(this.name, this.type);
        },
        enumerable: true,
        configurable: true
    });
    return Atom;
}());
function LogCallback(value) {
}
var SurfaceSearchEntry = (function () {
    function SurfaceSearchEntry() {
    }
    return SurfaceSearchEntry;
}());
var SurfaceSearchOptions = (function () {
    function SurfaceSearchOptions(hydrophilicFactor, hydrophobicFactor, testRadius, defaultRadius) {
        this.centerAtomFactor = 1.2;
        this.subtractAtomFactor = 1.2;
        this.testRadius = 0.168;
        this.defaultRadius = 0.13;
        if (typeof hydrophilicFactor == 'number' && !isNaN(hydrophilicFactor))
            this.centerAtomFactor = hydrophilicFactor;
        if (typeof hydrophobicFactor == 'number' && !isNaN(hydrophobicFactor))
            this.subtractAtomFactor = hydrophobicFactor;
        if (typeof testRadius == 'number' && !isNaN(testRadius))
            this.testRadius = testRadius;
        if (typeof defaultRadius == 'number' && !isNaN(defaultRadius))
            this.defaultRadius = defaultRadius;
    }
    return SurfaceSearchOptions;
}());
var SurfaceSearch = (function () {
    function SurfaceSearch() {
    }
    // N-H*O hydrogen bond can be as short as 1.717+1.002 (2.719) or 1.104+1.489 (2.593)
    SurfaceSearch.RadiusLiMinimumSet = function (name, type) {
        switch (name) {
            case 'C':
                switch (type) {
                    case 'C':
                        return 0.176;
                    default:
                        return 0.192;
                }
            case 'S':
                return 0.192;
            case 'N':
                return 0.166;
            case "O":
                return 0.151;
            default:
                console.log('error in radius');
                throw 'error in radius';
        }
    };
    SurfaceSearch.AtomFactor = function (name, type) {
        var HydrophobicFactor = 1.6;
        switch (name) {
            case 'C':
                return HydrophobicFactor;
            case 'S':
                return HydrophobicFactor;
            case 'N':
                return 1;
            case "O":
                return 1;
        }
    };
    SurfaceSearch.Search = function (entry, options) {
        var PolyhedronBuilers = [];
        var rs = entry.residue;
        var pc = entry.chain;
        var reach = (SurfaceSearch.RadiusLiMinimumSet('S', 'CG') + 0.33) * 2.0;
        var rsBounds = rs.GetBounds3d();
        rsBounds.Expand(-reach, reach, -reach, reach, -reach, reach);
        var includeList = entry.chain.atoms.filter(function (atom) { return (atom.name == 'C' || atom.type == 'N' || atom.type == 'O') && rsBounds.Contains(atom.position); });
        if (rs.name == 'G') {
            rs.PseudoBetaDepth = 0.00;
            var atp = rs.GetPseudoBetaCarbonPosition();
            if (atp) {
                for (var WaterRadius = 0.01; WaterRadius <= 0.332; WaterRadius += 0.005) {
                    var SpecificList = [];
                    var RadiusPseudoG = SurfaceSearch.RadiusLiMinimumSet('C', 'CG') + WaterRadius;
                    var ph = new PolyhedronBuilder2(atp, RadiusPseudoG, WaterRadius, options); // the builder will create a box at the unit of RadiusAtom * Factor + WaterRadius
                    var AtomReach = RadiusPseudoG * options.centerAtomFactor + WaterRadius + WaterRadius; // the atom can approach AtomRadius * Factor + Diameter of Water
                    var NoRoom = false;
                    includeList.some(function (pat) {
                        var TotalReach = pat.GetRadiusLiMinimumSet * options.subtractAtomFactor + AtomReach;
                        if (pat.position.subtract(atp).lengthSquared <= TotalReach * TotalReach)
                            SpecificList.push(pat);
                        NoRoom = (pat.position.equals(atp));
                        return NoRoom;
                    });
                    //console.log('NoRoom: ' + NoRoom);
                    if (NoRoom) {
                        //rs.PseudoBetaDepth = WaterRadius - 0.005;
                        //console.log(rs.name + rs.index + '-%B' + ' is empty has no room');
                        break;
                    }
                    else {
                        //console.log(rs.name + rs.index + '-' + '%B' + ' test with : ' + SpecificList.length);
                        SpecificList.forEach(function (pat) {
                            ph.TrySubtract(pat.position, pat.GetRadiusLiMinimumSet);
                        });
                        if (ph.IsEmpty()) {
                            //rs.PseudoBetaDepth = WaterRadius - 0.005;
                            //console.log(rs.name + rs.index + '-%B' + ' is empty at ' + rs.PseudoBetaDepth.toString());
                            break;
                        }
                        else {
                            rs.PseudoBetaDepth = WaterRadius;
                            PolyhedronBuilers.push(ph);
                        }
                    }
                }
            }
            if (rs.PseudoBetaDepth < 0.0)
                rs.PseudoBetaDepth = 0.33;
        }
        else {
            rs.atoms.forEach(function (at) {
                var phLast;
                switch (at.type) {
                    case 'C': break;
                    case 'O': break;
                    case 'N': break;
                    case 'CA': break;
                    //ignore the backbone atoms
                    default:
                        at.Depth = 0.00;
                        for (var WaterRadius = 0.01; WaterRadius <= 0.33; WaterRadius += 0.005) {
                            var SpecificList = [];
                            var atp = at.position;
                            var CenterAtomRadius = at.GetRadiusLiMinimumSet; // this is the radius of the atom
                            var ph = new PolyhedronBuilder2(atp, CenterAtomRadius, WaterRadius, options); // the builder will create a box at the unit of RadiusAtom * Factor + WaterRadius
                            var AtomReach = CenterAtomRadius * options.centerAtomFactor + WaterRadius + WaterRadius; // the atom can approach AtomRadius * Factor + Diameter of Water
                            includeList.forEach(function (pat) {
                                var TotalReach = pat.GetRadiusLiMinimumSet * options.subtractAtomFactor + AtomReach;
                                if (pat !== at && pat.position.subtract(atp).lengthSquared < TotalReach * TotalReach)
                                    SpecificList.push(pat);
                            });
                            SpecificList.forEach(function (pat) {
                                ph.TrySubtract(pat.position, pat.GetRadiusLiMinimumSet);
                            });
                            if (ph.IsEmpty()) {
                                //at.Depth = WaterRadius - 0.005;
                                break;
                            }
                            else {
                                at.Depth = WaterRadius;
                                phLast = ph;
                            }
                        }
                        //if (at.Depth < 0.0) at.Depth = 0.33;
                        break;
                }
                if (phLast)
                    PolyhedronBuilers.push(phLast);
            });
        }
        rs.SearchDepth();
        rs.IsSurface = rs.IsSurfaceByAtom;
        //console.log(rs.name + rs.index + ' depth: ' + rs.Depth);
        return PolyhedronBuilers;
    };
    SurfaceSearch.Test = function (entry, options) {
        var rs = entry.residue;
        var pc = entry.chain;
        var reach = (SurfaceSearch.RadiusLiMinimumSet('S', 'CG') + 0.33) * 2.0;
        var rsBounds = rs.GetBounds3d();
        rsBounds.Expand(-reach, reach, -reach, reach, -reach, reach);
        var includeList = entry.chain.atoms.filter(function (atom) { return (atom.name == 'C' || atom.type == 'N' || atom.type == 'O') && rsBounds.Contains(atom.position); });
        if (rs.name == 'G') {
            //rs.PseudoBetaDepth = 0.00;
            var atp = rs.GetPseudoBetaCarbonPosition();
            if (atp) {
                var WaterRadius = options.testRadius;
                var SpecificList = [];
                var RadiusPseudoG = SurfaceSearch.RadiusLiMinimumSet('C', 'CG') + WaterRadius;
                var ph = new PolyhedronBuilder2(atp, RadiusPseudoG, WaterRadius, options); // the builder will create a box at the unit of RadiusAtom * Factor + WaterRadius
                var AtomReach = RadiusPseudoG * options.centerAtomFactor + WaterRadius + WaterRadius; // the atom can approach AtomRadius * Factor + Diameter of Water
                var NoRoom = false;
                includeList.some(function (pat) {
                    var TotalReach = pat.GetRadiusLiMinimumSet * options.subtractAtomFactor + AtomReach;
                    if (pat.position.subtract(atp).lengthSquared <= TotalReach * TotalReach)
                        SpecificList.push(pat);
                    NoRoom = (pat.position.equals(atp));
                    return false;
                });
                //console.log('NoRoom: ' + NoRoom);
                if (NoRoom) {
                    rs.IsSurface = false;
                    return false;
                }
                else {
                    //console.log(rs.name + rs.index + '-' + '%B' + ' test with : ' + SpecificList.length);
                    SpecificList.forEach(function (pat) {
                        ph.TrySubtract(pat.position, pat.GetRadiusLiMinimumSet);
                    });
                    if (ph.IsEmpty()) {
                        rs.IsSurface = false;
                        return false;
                    }
                    else {
                        //rs.PseudoBetaDepth = WaterRadius;
                        rs.IsSurface = true;
                        return true;
                    }
                }
            }
        }
        else {
            rs.atoms.forEach(function (at) {
                switch (at.type) {
                    case 'C': break;
                    case 'O': break;
                    case 'N': break;
                    case 'CA': break;
                    //ignore the backbone atoms
                    default:
                        at.Depth = options.defaultRadius;
                        var WaterRadius = options.testRadius;
                        var SpecificList = [];
                        var atp = at.position;
                        var CenterAtomRadius = at.GetRadiusLiMinimumSet; // this is the radius of the atom
                        var ph = new PolyhedronBuilder2(atp, CenterAtomRadius, WaterRadius, options); // the builder will create a box at the unit of RadiusAtom * Factor + WaterRadius
                        var AtomReach = CenterAtomRadius * options.centerAtomFactor + WaterRadius + WaterRadius; // the atom can approach AtomRadius * Factor + Diameter of Water
                        includeList.forEach(function (pat) {
                            var TotalReach = pat.GetRadiusLiMinimumSet * options.subtractAtomFactor + AtomReach;
                            if (pat !== at && pat.position.subtract(atp).lengthSquared < TotalReach * TotalReach)
                                SpecificList.push(pat);
                        });
                        SpecificList.forEach(function (pat) {
                            ph.TrySubtract(pat.position, pat.GetRadiusLiMinimumSet);
                        });
                        if (ph.IsEmpty()) {
                            break;
                        }
                        else {
                            at.Depth = WaterRadius;
                        }
                        break;
                }
            });
            rs.IsSurface = rs.IsSurfaceByAtom;
            return rs.IsSurface;
        }
    };
    return SurfaceSearch;
}());
var dichotomize = (function () {
    function dichotomize() {
    }
    dichotomize.divide = function (from, to, level, action, false2true) {
        var rFrom = action(from);
        var rTo = action(to);
        if (rFrom && rTo) {
            return false2true ? from : to;
        }
        if ((!rFrom) && (!rTo)) {
            return false2true ? to : from;
        }
        if (rFrom && !rTo) {
            return dichotomize.subDivideLeft(from, (from + to) / 2, to, level - 1, action);
        }
        if (rTo && !rFrom) {
            return dichotomize.subDivideRight(from, (from + to) / 2, to, level - 1, action);
        }
    };
    dichotomize.subDivideLeft = function (from, middle, to, level, action) {
        if (level < 0)
            return middle;
        if (action(middle)) {
            return dichotomize.subDivideLeft(middle, (middle + to) / 2, to, level - 1, action);
        }
        else {
            return dichotomize.subDivideLeft(from, (from + middle) / 2, middle, level - 1, action);
        }
    };
    dichotomize.subDivideRight = function (from, middle, to, level, action) {
        if (level < 0)
            return middle;
        if (action(middle)) {
            return dichotomize.subDivideRight(from, (from + middle) / 2, middle, level - 1, action);
        }
        else {
            return dichotomize.subDivideRight(middle, (middle + to) / 2, to, level - 1, action);
        }
    };
    return dichotomize;
}());
//# sourceMappingURL=surface.js.map
"use strict";
var http = require("http");
//import {Vector3D} from "./geometry";
//require('./stringutil');
//require('./proteinutil');
//require('./geometry');
//require('./geometry2');
//require('./surface');
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
            options.path = '/view/' + id + '.pdb';
            http.request(options, this.onBeginReceive).end();
        }
        return File;
    }());
})(PDB || (PDB = {}));
//PDB.Download('5I4O', PDBParser.parsePDB);
var K = new Vector3D(0, 1, 2);
console.log(K.toString());
//# sourceMappingURL=app.js.map