import { useEffect, type JSX } from "react";
import * as service from "../services/appService";
import { messageService } from "../configs/interface";
import { socket } from "../configs/socket";

const Home = (): JSX.Element => {
    const testExpress = async () => {
        try {
            const result = await service.testApi();
            console.log(result);
        } catch(e) {
            console.log(e);
            messageService.error("Xảy ra lỗi ở server");
        }
    }
    useEffect(() => {
        socket.on("testResponse", (data) => console.log("FE nhận:", data));
        socket.on("connect_error", (e) => console.log("Socket connect error:", e));

        return () => {
            socket.off("testResponse");
            socket.off("connect_error");
        };
    }, []);

    const testSocket = () => {
        if (socket.connected) {
            socket.emit("testRequest", {message: "mmmm"})
        } else {
            messageService.error("Kết nối chưa hoàn tất, hãy thử lại");
        }
    }
    return(
        <>
            <div className="p-5">
                <button className="btn btn-primary" onClick={() => {testExpress()}}>express</button>
            </div>
            <div className="p-5">
                <button className="btn btn-primary" onClick={() => {testSocket()}}>socket</button>
            </div>
        </>
    )
}

export default Home;