import axios from "../configs/axios";
import type { BackendResponse } from "../configs/interface";

export const testApi = (): Promise<BackendResponse> => {
    return axios.get("/test-api")
}