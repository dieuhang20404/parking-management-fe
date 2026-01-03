import { Grid } from "antd";
import type { Dayjs } from "dayjs";
import type dayjs from "dayjs";

export interface BackendResponse {
  message: string,
  data: any,
  code: number
}

type MessageFuncs = {
  success: (content: string) => void;
  error: (content: string) => void;
};

export const messageService: MessageFuncs = {
  success: () => {},
  error: () => {},
};

export const breakpoint = {
  xs: 576,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600
}

export const {useBreakpoint} = Grid; 
export const useScreens = () => {
  return useBreakpoint();
};

export interface TicketTable {
  id: number,
  plateNumber: string,
  timeIn: Dayjs,
  timeOut: Dayjs | null,
  qrCode: string,
  parkingLotId: number
}

export interface TicketType {
  id: number,
  plateNumber: string,
  timeIn: Dayjs,
  timeOut: Dayjs | null,
  uuid: string,
  qrCode: string,
  parkingLotId: number
}

export interface LoadingModalProps {
  message: string,
  open: boolean
}

export interface HistoryType {
  id: number,
  plateNumber: string,
  timeIn: Dayjs,
  timeOut: Dayjs | null,
  parkingLotId: number,
  imageIn: string,
  imageOut: string | null
}