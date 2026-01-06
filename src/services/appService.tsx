import axios from "../configs/axios";
import type { BackendResponse } from "../configs/interface";

export const reloadPageApi = (): Promise<BackendResponse> => {
    return axios.get("/reload-page");
}

export const getAllTicketApi = (): Promise<BackendResponse> => {
    return axios.get("/get-all-ticket");
}

export const getPlateNumberApi = (irData: number[]): Promise<BackendResponse> => {
    return axios.post("/get-plate-number", {
        irData
    });
}

export const createTicketApi = (plateNumber: string, imageIn: string, irData: number[]): Promise<BackendResponse> => {
    return axios.post("/create-ticket", {
        plateNumber, imageIn, irData
    });
}

export const sendOtpApi = (): Promise<BackendResponse> => {
    return axios.get("/send-otp");
}

export const checkOtpApi = (valueConfirm: string): Promise<BackendResponse> => {
    return axios.post("/check-otp", {
        valueConfirm
    })
}

export const getEmptyPositionApi = (): Promise<BackendResponse> => {
    return axios.get("/get-empty-position");
}

export const getFindPathApi = (irData: number[], position?: [number, number]): Promise<BackendResponse> => {
    const [x, y] = position || [0, 0];
    return axios.post("/get-find-path", {
        irData, x, y
    });
}
export const checkoutApi = (id: number): Promise<BackendResponse> => {
    return axios.post("/checkout", {
        id
    })
}

export const getHistoryApi = (): Promise<BackendResponse> => {
    return axios.get("/get-history");
}

export const createTicketTestApi = (): Promise<BackendResponse> => {
    return axios.get("/create-ticket-test");
}