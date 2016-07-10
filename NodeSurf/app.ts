import * as fs from "fs";
import * as http from "http";

module PDB {
    export function Download(id: string, callback?: (value: string) => void):File {
        return new File(id, callback);
    }
    class File {
        constructor(id: string, callback?: (value: string) => void) {
            this.onComplete = callback;
            let options: http.RequestOptions = {};
            options.protocol = 'http:';
            options.host = 'files.rcsb.org';
            options.path = '/view/' + id.toUpperCase() + '.pdb';
            http.request(options, this.onBeginReceive).end();
        }
        private data: string = '';
        private onComplete: (value: string) => void;
        private onBeginReceive = (response: http.IncomingMessage) => {
            response.on('data', this.onData);
            response.on('end', this.onEndReceive);
        }
        private onEndReceive = () => {
            if (this.onComplete) this.onComplete(this.data);
        }
        private onData = (chunk: string) => {
            this.data += chunk;
        }
    }
}

// need to test hydrophobicFactor from 1.2 to 2.0;
let Analyze = function (chain: string, hydrophobicFactor: number ) {
    return function (value: string) {
        let str = PDBParser.parsePDB(value);
        for (let keyChain in str.chainDict) {
            if (keyChain.toUpperCase() == chain.toUpperCase()) {
                let entry = new SurfaceSearchEntry();
                //entry.residues = str.;
                let options = new SurfaceSearchOptions();
                options.hydrophilicFactor = 0.75;
                options.hydrophobicFactor = hydrophobicFactor;
                //for (let keyResidue in entry.chain.residueDict) {
                //    entry.residue = entry.chain.residueDict[keyResidue];
                //    let res: boolean = SurfaceSearch.Test(entry, options);
                //    console.log(entry.residue.name + entry.residue.index, res);
                //}
            }
        }
    }
}

let files = fs.readdirSync('./');

files.filter(file => {
    if (file.toLowerCase().lastIndexOf('.pdb') > -1) {
        return true;
    }
})

//PDB.Download('1a2z', Analyze('A', 1.2));