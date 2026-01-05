import axios from "../configs/axios";
import type { BackendResponse } from "../configs/interface";

export const reloadPageApi = (): Promise<BackendResponse> => {
    return axios.get("/reload-page");
}

export const getAllTicketApi = (): Promise<BackendResponse> => {
    return axios.get("/get-all-ticket");
}

export const getPlateNumberApi = (): Promise<BackendResponse> => {
    return axios.get("/get-plate-number");
}

export const createTicketApi = (plateNumber: string, imageIn: string): Promise<BackendResponse> => {
    return axios.post("/create-ticket", {
        plateNumber, imageIn
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

export const checkoutApi = (qrCode: string): Promise<BackendResponse> => {
    return axios.post("/checkout", {
        qrCode
    })
}

export const getHistoryApi = (): Promise<BackendResponse> => {
    return axios.get("/get-history");
}

export const createTicketTestApi = (): Promise<BackendResponse> => {
    return axios.get("/create-ticket-test");
}