import { message } from "antd";
import { messageService } from "./configs/interface";
import AppRoute from "./routes/appRoute";




function App() {
  const [messageApi, contextHolder] = message.useMessage();
  const keyMessage = "message-custome"
  messageService.success = (content: string) => {
    messageApi.open({ 
      key: keyMessage,
      type: "success", 
      content: (
        <div onClick={() => {messageApi.destroy(keyMessage)}} style={{cursor: "pointer"}}>
          {content}
        </div>
      )
    });
  };
  messageService.error = (content: string) => {
    messageApi.open({ 
      key: keyMessage,
      type: "error", 
      content: (
        <div onClick={() => {messageApi.destroy(keyMessage)}} style={{cursor: "pointer"}}>
          {content}
        </div>
      )
    });
  };
  return (
    <>
      {contextHolder}
      <AppRoute />
    </>
  )
}

export default App
