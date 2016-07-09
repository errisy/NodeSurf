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

let Analyze = function (chain: string) {

    return function (value: string) {
        let str = PDBParser.parsePDB(value);
        for (let keyChain in str.chainDict) {
            if (keyChain.toUpperCase() == chain.toUpperCase()) {
                let entry = new SurfaceSearchEntry();
                entry.chain = str.chainDict[keyChain];
                let options = new SurfaceSearchOptions();
                options.hydrophilicFactor = 0.75;
                options.hydrophobicFactor = 1.5;
                for (let keyResidue in entry.chain.residueDict) {
                    entry.residue = entry.chain.residueDict[keyResidue];
                    let res: boolean = SurfaceSearch.Test(entry, options);
                    console.log(keyResidue, res);
                }
            }
        }
    }
}



PDB.Download('1a2z', Analyze('A'));