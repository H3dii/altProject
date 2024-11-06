import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import serverConfig from "./config";

type HttpMethod = "get" | "post" | "put" | "delete";

interface RequestOptions {
    url: string;
    method: HttpMethod;
    data?: any;
    token?: string | null;
}

const createApiRequest = async ({ url, method, data, token }: RequestOptions): Promise<any> => {
    const headers: Record<string, string> = {};
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config: AxiosRequestConfig = {
        url: `${serverConfig.APIHOST}${url}`,
        method,
        headers,
        ...(data && { data }),
    };

    try {
        const response: AxiosResponse = await axios(config);
        return response;
    } catch (error: any) {
        throw error;
    }
};

export const GetRequest = (url: string, token?: string | null) => createApiRequest({ url, method: "get", token });

export const PostRequest = (url: string, data: any, token?: string | null) => createApiRequest({ url, method: "post", data, token });

export const PutRequest = (url: string, data: any, token?: string | null) => createApiRequest({ url, method: "put", data, token });

export const DeleteRequest = (url: string, token?: string | null) => createApiRequest({ url, method: "delete", token });

export const IsError = (err: any): any => {
    if (err.response && err.response.data && err.response.data) {
        if (err.response.data.error) {
            return err.response.data.error;
        }
        return err.response.data;
    }
    return true;
};
