import { promises as fs } from 'fs';
import HttpClient from '../HttpClient';
import { CreateProcessResponse, GetProcessOutputResponse, GetProcessStatusResponse, Language, Mode, Status } from '../model/Model';

class CodeMakerService {

    private readonly client;
    
    constructor(private readonly token: string) {
        this.client = new HttpClient(token);
    }

    public async generateDocumentation(path: string) {
        // TODO: add batch file processing
        const source = await this.readFileAsync(path);
        const output = await this.process(Mode.DOCUMENT, this.langFromFileExtention(path), source);
        this.processFile(path, output);
    }

    private async processFile(file: string, output: string) {
        fs.writeFile(file, output);
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

    private async readFileAsync(filePath: string): Promise<string> {
        return await fs.readFile(filePath, 'utf8');
    }

    private langFromFileExtention(fileName: string): Language {
        const ext = fileName.split('.').pop();
        if (ext === 'java') {
            return Language.JAVA;
        }
        throw Error("unsupported language: " + ext);
    }
}


export default CodeMakerService;