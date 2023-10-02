import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
const program = new Command();
program.name('fos').description('fos repl').version('0.0.0');
program.argument('[file]').action((file) => {
    if (file) {
        const data = fs.readFileSync(path.join(process.cwd(), file), 'utf-8');
        console.log(data);
    }
    else {
        console.log('no file provided');
    }
});
program.parse();
