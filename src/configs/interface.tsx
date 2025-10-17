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