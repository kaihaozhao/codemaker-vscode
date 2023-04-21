import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import * as AxiosLogger from 'axios-logger';
import { CreateProcessRequest, GetProcessOutputRequest, GetProcessStatusRequest } from './model/Model';
import AuthenticationError from './AuthenticationError'

class HttpClient {
    private axiosInstance: AxiosInstance;
    private static readonly API_ENDPOINT = 'https://api.codemaker.ai';

    constructor(private readonly token: string) {
        this.axiosInstance = axios.create({
            baseURL: HttpClient.API_ENDPOINT,
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Content-type': 'application/json',
                'User-Agent': 'CodeMakerSDKJavaScript/1.1.0'
            },
        });
        // this.axiosInstance.interceptors.request.use(AxiosLogger.requestLogger);
    }

    createProcess<CreateProcessResponse>(body: CreateProcessRequest): Promise<AxiosResponse<CreateProcessResponse>> {
        return this.doPost<CreateProcessResponse>('/process',  body);
    }

    getProcessStatus<GetProcessStatusResponse>(body: GetProcessStatusRequest): Promise<AxiosResponse<GetProcessStatusResponse>> {
        return this.doPost<GetProcessStatusResponse>('/process/status', body);
    }

    getProcessOutput<GetProcessOutputResponse>(body: GetProcessOutputRequest): Promise<AxiosResponse<GetProcessOutputResponse>> {
        return this.doPost<GetProcessOutputResponse>('/process/output', body);
    }

    async doPost<T>(url: string, body: any): Promise<AxiosResponse<T>> {
        try {
            return await this.axiosInstance.post<T>(url, body);
        } catch (err) {
            const error = err as AxiosError | Error;
            if (!axios.isAxiosError(error)) {
                // console.log('error is: ', error.message);
                throw new Error("failed" + error.message);
            } else {
                if (error.response && error.response.status === 401) {
                    // console.log('invalid token')
                    throw new AuthenticationError("Invalid token");
                } else {
                    throw new Error("Error " + error.message);
                }
            }
        }
    }
}

export default HttpClient;
