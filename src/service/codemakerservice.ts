import * as fs from 'fs'
import * as path from 'path';
import HttpClient from '../HttpClient';
import { CreateProcessResponse, GetProcessOutputResponse, GetProcessStatusResponse, Language, Mode, Status } from '../model/Model';

class CodeMakerService {

    private readonly client;
    
    constructor(private readonly token: string) {
        this.client = new HttpClient(token);
    }

    /**
     * Generate documentation for given source files.
     * 
     * @param path file or directory path.
     */
    public async generateDocumentation(path: string) {
        return this.walkFiles(path, (filePath: string): Promise<void> => {
            const source = fs.readFileSync(filePath, 'utf8');
            const ext = this.langFromFileExtention(filePath);
            if (ext == null) {
                return Promise.resolve();
            }
            return this.process(Mode.DOCUMENT, ext, source)
                .then((output) => {
                    fs.writeFileSync(filePath, output)
                });
        });
    }

    private async walkFiles(root: string, processor: (filePath: string) => Promise<void>) {
        if (fs.statSync(root).isFile()) {
            return await processor(root);
        }
        for (const file of fs.readdirSync(root)) {
            const filePath = path.join(root, file); 
            const stats = fs.statSync(filePath);  
            if (fs.statSync(filePath).isFile()) {
                await processor(filePath);
            } else if (stats.isDirectory()) {
                await this.walkFiles(filePath, processor);  
            } 
        }
    }

    // TODO: add error handling
    private async process(mode: Mode, lang: Language, source: string) {
        let processResponse = await this.client.createProcess({
            'process': {
                'mode': mode,
                'language': lang,
                'input': {
                    'source': source
                }
            }
        });
        const id = (processResponse.data as CreateProcessResponse).id;
        let status = Status.IN_PROGRESS;
        let success = false;
        const timeout = Date.now() + 10 * 60 * 1000;
        while (status === Status.IN_PROGRESS && timeout > Date.now()) {
            let processStatusResponse = await this.client.getProcessStatus({
                'id': id
            });
            status = (processStatusResponse.data as GetProcessStatusResponse).status
            if (status === Status.COMPLETED) {
                success = true;
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        if (!success) {
            throw Error('Processing task had failed');
        }
        let outputResponse = await this.client.getProcessOutput({
            'id': id
        })
        const output = (outputResponse.data as GetProcessOutputResponse).output;
        return output.source;
    }

    // TODO move to config file
    private langFromFileExtention(fileName: string): Language | null {
        const ext = fileName.split('.').pop();
        if (ext === 'java') {
            return Language.JAVA;
        }
        console.info("unsupported language: " + ext);
        return null;
    }
}


export default CodeMakerService;