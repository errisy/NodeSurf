import * as http from "http";

//48524

module SlaveController {
    type ContentType = 'text/plain' | 'application/json';
    class Client {
        constructor(protocol: string, host: string, path?: string, port?: number, data?: 'TEXT' | 'JSON' | 'XML', method?: 'GET' | 'POST' | 'PUT', mime?: ContentType, value?: string | Buffer) {
            let options: http.RequestOptions = {};
            options.protocol = protocol;
            options.host = host;
            if (port) options.port = port;
            if (path) options.path = path;
            if (data) this.data = data;
                        if (method) {
                options.method = method;
            }
            else {
                options.method = 'GET';
            }
            if (options.method == 'POST') {
                let length: number = 0;
                if (typeof value == 'string') {
                    length = Buffer.byteLength(<string>value);
                }
                else {
                    length = (<Buffer>value).length;
                }
                if (!mime) mime = 'text/plain';
                options.headers = {
                    'Content-Type': mime,
                    'Content-Length': length
                }
            }
            //console.log('begin request;');
            //console.log('Method: ', options.method); 

            let request = http.request(options, this.onBeginReceive);
            //console.log('begin write;');
            if (options.method == 'POST') request.write(value);
            //console.log('end;');
            request.end();
        }
        public content: string = '';
        public data: 'TEXT' | 'JSON' | 'XML' = 'TEXT';
        public onComplete: (value: any) => void;
        private onBeginReceive = (response: http.IncomingMessage) => {
            response.on('data', this.onData);
            response.on('end', this.onEndReceive);
        }
        private onEndReceive = () => {
            if (this.onComplete) {
                switch (this.data) {
                    case 'JSON':
                        this.onComplete(JSON.parse(this.content));
                        break;
                    default:
                        this.onComplete(this.content);
                        break;
                }
                
            }
        }
        private onData = (chunk: string) => {
            this.content += chunk;
        }
    }

    interface IPathResult {
        path: string[];
        surface: string;
    }
    interface IPathEntry {
        path: string[];
        factor: string;
        residue: number;
        residues: Residue[];
    }
    class SlaveClient extends Client {
        constructor(data: IPathResult) {
            super('http:', '192.168.137.3', '/', 48524, 'JSON', 'POST', 'application/json', JSON.stringify(data));
        }
        static parseResidue = (_residue: Residue): Residue => {
            let residue = new Residue();
            residue.index = _residue.index;
            residue.name = _residue.name;
            residue.atoms = _residue.atoms.map(atom => SlaveClient.parseAtom(atom));
            return residue;
        }
        static parseAtom = (_atom: Atom): Atom => {
            let atom = new Atom();
            
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
        }
        static parseVector3D = (_vector: Vector3D): Vector3D  => {
            return new Vector3D(_vector.x, _vector.y, _vector.z);
        }
        public onComplete = (entry: IPathEntry) => {

            
            entry.residues = entry.residues.map(residue => SlaveClient.parseResidue(residue));
            //console.log(entry.residue, entry.residues.length);
            this.entry = entry;
            //deserialize entry;
            
            

            this.finsh()
        }
        public entry: IPathEntry;
        public finsh = () => {
            let searchEntry = new SurfaceSearchEntry();
            
            searchEntry.residues = this.entry.residues;
            searchEntry.residue = this.entry.residues.filter(residue => residue.index == this.entry.residue)[0];
            let options = new SurfaceSearchOptions();
            options.hydrophobicFactor = 1.5;// Number(this.entry.factor);
            options.hydrophilicFactor = 0.75;

            let res: boolean = SurfaceSearch.Test(searchEntry, options);

            let result: IPathResult = <any>{};
            result.path = this.entry.path;
            result.surface = res ? '+' : '-';
            console.log(this.entry.path, result.surface);
            let slave = new SlaveClient(result);
        }
    }

    let start = new SlaveClient(<any>{});
}