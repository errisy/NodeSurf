import * as http from "http";
import * as fs from "fs";
import * as moment from "moment";

module MasterController {
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
    let folder = 'C:\\Users\\Jack\\Documents\\Visual Studio 2015\\Projects\\PDBCasper\\PDBCasper\\pdbSelected\\';

    class HierarchicalTask {
        public waiting: HierarchicalTask[] = [];
        public working: HierarchicalTask[] = [];
        public finished: HierarchicalTask[] = [];
        public parent: HierarchicalTask;
        public hasChildren: boolean = true;
        public id: string;
        public lastVisit: number = moment.duration(moment().diff(moment('2016-01-01 00:00:00'))).asSeconds();
        public initialized: boolean = false;
        constructor(parent?: HierarchicalTask) {
            this.parent = parent;
        }
        public require = (): HierarchicalTask => {
            if (!this.initialized && this.initialize) {
                this.initialize();
                this.initialized = true;
            }
            if (this.hasChildren) {
                this.recycle();
                let found: HierarchicalTask = null;
                this.working.some(child => {
                    if (child.hasChildren) {
                        let task = child.require();
                        if (task !== null) {
                            let nextLevel = task.require();
                            if (nextLevel !== null) {
                                child.lastVisit = moment.duration(moment().diff(moment('2016-01-01 00:00:00'))).asSeconds();
                                found = nextLevel;
                                return true;
                            }
                        }
                        return false;
                    }
                });
                if (found) return found;

                while (this.waiting.length > 0) {
                    let child = this.waiting.shift();
                    this.working.push(child);
                    if (child.hasChildren) {
                        let nextLevel = child.require();
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
                return this;
            }
        }
        public recycle = () => {
            let working: HierarchicalTask[] = [];
            let current = moment.duration(moment().diff(moment('2016-01-01 00:00:00'))).asSeconds();
            this.working.forEach(child => {
                if ((current - child.lastVisit) > 10) {
                    console.log('Recycled: ', child.path);
                    this.waiting.push(child);
                }
                else {
                    working.push(child);
                }
            });
            this.working = working;
        }
        public fetch = (path: string[]): HierarchicalTask => {
            let subpath = path.filter(value => true);
            let thisID = subpath.shift();
            if (this.id == thisID) {
                if (this.hasChildren) {
                    if (subpath.length > 0) {
                        let childID = subpath[0];
                        let found = this.working.filter(child => child.id == childID);
                        if (found.length > 0) return found[0].fetch(subpath);
                        found = this.waiting.filter(child => child.id == childID);
                        if (found.length > 0) return found[0].fetch(subpath);
                    }
                    else {
                        return this;
                    }
                }
                else {
                    return this;
                }
            }
            else {
                return null;
            }

        }
        public complete = () => {
            
            if (this.parent) {

                let waiting: HierarchicalTask[] = [];
                let working: HierarchicalTask[] = [];

                this.parent.waiting.forEach(child => {
                    if (child.id != this.id) {
                        waiting.push(child);
                    }
                    else {
                        this.parent.finished.push(child);
                    }
                });
                this.parent.working.forEach(child => {
                    if (child.id != this.id) {
                        working.push(child);
                    }
                    else {
                        this.parent.finished.push(child);
                    }
                });

                this.parent.waiting = waiting;
                this.parent.working = working;

                if (this.parent.waiting.length == 0 && this.parent.working.length == 0) this.parent.complete();
            }
            console.log('Completed: ', this.path);
            if (this.onComplete) this.onComplete();
        }
        public onComplete: () => void;
        get path(): string[] {
            if (this.parent) {
                let parentPath = this.parent.path;
                parentPath.push(this.id);
                return parentPath;
            }
            else {
                return [this.id];
            }
        }
        public initialize: () => void;
    }

    class RootTask extends HierarchicalTask{
        constructor() {
            super();
        }
        public initialize = () => {
            this.id = 'Root';
            let files = fs.readdirSync(folder);

            let IDs = files.filter(file => {
                if (file.toLowerCase().lastIndexOf('.pdb') > -1) {
                    return true;
                }
            }).map(file => {
                return file.substr(0, 4);
            });

            IDs.forEach(file => {
                //create a PDBTask;
                let task = new FileTask(this);
                task.id = file;
                this.waiting.push(task);
            });
        }
    }
    class FileTask extends HierarchicalTask {
        constructor(parent: RootTask) {
            super(parent);
        }
        public initialize = () => {
            
            let structure = PDBParser.parsePDB(fs.readFileSync(folder + this.id + '.pdb').toString());
            let chain = structure.chainDict['A'];
            //load each of the residue to the residue list;
            for (let residueKey in chain.residueDict) {
                this.residues.push(chain.residueDict[residueKey]);
            }

            //define a list of factors for test
            let factors: string[] = ['1.20', '1.40', '1.60', '1.80', '2.00'];
            factors.forEach(factor => {
                let entry = folder + this.id + '_' + factor + '.txt';
                if (!fs.existsSync(entry)) {
                    let task = new FactorTask(this);
                    task.id = factor;
                    this.waiting.push(task);
                };
            });
        }
        public residues: Residue[] = [];
        public parent: RootTask;
        public onComplete = () => {
            this.residues = null;
            this.finished = null;
            console.log('Clear File: ', this.path);
        }
    }
    class FactorTask extends HierarchicalTask {
        constructor(parent: FileTask) {
            super(parent);
        }
        public initialize = () => {
            //generate branches for task;
            this.parent.residues.forEach(residue => {
                let task = new ResidueTask(this);
                task.id = residue.index.toString();
                task.residue = residue;
                this.waiting.push(task);
            });
        }
        public parent: FileTask;
        public onComplete = () => {
            //write a file to disk;
            console.log('Finished: ', this.id, this.finished.length);
            this.finished.sort((a: ResidueTask, b: ResidueTask) => {
                return (Number(a.id) > Number(b.id)) ? 1 : -1;
            });
            let builder: string[] = this.finished.map((child: ResidueTask) => child.residue.name + child.residue.index + child.surface);
            let filename = folder + this.parent.id + '_' + this.id + '.txt';
            console.log('Write File: ', filename);
            fs.writeFileSync(filename, builder.join('\n'));
        }
    }
    class ResidueTask extends HierarchicalTask {
        constructor(parent: FactorTask) {
            super(parent);
            this.hasChildren = false;
        }
        public residue: Residue;
        public surface: string;
        public parent: FactorTask;
    }


    class HttpService {
        public port: number = 48524;
        public server: http.Server;
        constructor(port?: number) {
            if (port) if (typeof port == 'number') this.port = port;
        }
        private handler = (request: http.IncomingMessage, response: http.ServerResponse) => {

            response.writeHead(200, {
                "Content-Type": "application/json",
                "access-control-allow-origin": "*",
                "Access-Control-Allow-Headers": "*"
            });
            let that = this;
            if (request.method.toUpperCase() == 'POST') {
                let body = "";
                request.on('data', function (chunk) {
                    body += chunk;
                });
                request.on('end', function () {
                    that.handlers.some(handler => {
                        if (handler.method == 'POST' && request.url.indexOf(handler.route) == 0) {
                            switch (handler.data) {
                                case 'JSON':
                                    let jsonObj = JSON.parse(body);
                                    handler.action(request, response, jsonObj);
                                    break;
                            }
                            return true;
                        }
                        else {
                            return false;
                        }
                    });
                })
            }
            if (request.method.toUpperCase() == 'GET') {
                that.handlers.some(handler => {
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
        private handlers: HttpHandler[] = [];
        public addHandler = (handler: HttpHandler) => {
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
                this.handlers.push(handler);
            }
        }
        public start = () => {
            this.server = http.createServer(this.handler);
            this.server.listen(this.port);
        }
    }
    interface HttpHandler {
        route?: string;
        method?: 'GET' | 'POST' | 'PUT';
        data: 'TEXT' | 'JSON' | 'XML';
        action: (req: http.IncomingMessage, res: http.ServerResponse, ...args: any[]) => void;
    }
    class JsonHandler<T> implements HttpHandler {
        public data: 'TEXT' | 'JSON' | 'XML' = 'JSON';
        action: (req: http.IncomingMessage, res: http.ServerResponse, json:T)=>void;
    }

    class TaskHandler extends JsonHandler<IPathResult>{
        public data: 'TEXT' | 'JSON' | 'XML' = 'JSON';
        public method: 'GET' | 'POST' | 'PUT' = 'POST';
        public root = new RootTask();
        
        public action = (req: http.IncomingMessage, res: http.ServerResponse, json: IPathResult): void => {
            console.log('--------------------------------------------');
            if (json) if (json.path && json.surface) {
                //record a result;
                let residueTask: ResidueTask = <any>(this.root.fetch(json.path));
                if (residueTask) {
                    residueTask.surface = json.surface;
                    residueTask.complete();
                }
            }
            let next: ResidueTask = <any>(this.root.require());
            console.log('Next: ', next.path);
            if (next) {
                let entry: IPathEntry = <any>{};
                entry.path = next.path;
                entry.factor = next.parent.id;
                entry.residue = next.residue.index;
                entry.residues = next.parent.parent.residues;
                res.end(JSON.stringify(entry));
            }
            res.end('{}');
        }
    }

    let server = new HttpService();
    server.addHandler(new TaskHandler());
    server.start();
}