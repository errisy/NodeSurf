//NodeJS does not work for multiple js files, so we have to combine multiple js files into one and run them together.
//This script combines multiple js files into one and run them in vm.

import * as fs from "fs";
import * as vm from "vm";

class builder {
    private data: string[] = [];
    public append = (filename: string) => {
        let content = fs.readFileSync(filename).toString();
        this.data.push(content);
    }
    public runAsFile = () => {
        fs.writeFileSync('./compiled.js', this.data.join('\n'));
        require('./compiled.js');
    }
    public runInMemory = () =>{
        let context = vm.createContext({
            console: console,
            require: require,
            process: process,
            module: module,
            Buffer: Buffer
        });
        let _script = vm.createScript(this.data.join('\n'));
        let fn: Function = _script.runInContext(context);
    }
}

let app = new builder();

app.append('stringutil.js');
app.append('proteinutil.js');
app.append('geometry.js');
app.append('geometry2.js');
app.append('surface.js');
app.append('slave.js');

app.runInMemory();