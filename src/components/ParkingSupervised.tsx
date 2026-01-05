import { Col, Row } from "antd";
import { useContext, useEffect, useRef, useState, type JSX } from "react";
import { UserContext } from "../configs/globalVariable";

const ParkingSupervised = (): JSX.Element => {
    const wsRef = useRef<WebSocket | null>(null);
    const {irData, setIrData} = useContext(UserContext);
    const [videoUrl, setVideoUrl] = useState<string>("");

    useEffect(() => {
        const ws = new WebSocket(`ws://${import.meta.env.VITE_ESP32_IP}:${import.meta.env.VITE_ESP32_PORT}`);
        ws.binaryType = "arraybuffer";
        wsRef.current = ws;

        ws.onopen = () => console.log("Connected to ESP32");

        ws.onmessage = (event) => {
            if (event.data instanceof ArrayBuffer) {
                const blob = new Blob([event.data], { type: "image/jpeg" });
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                return;
            }

            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "ir") {
                    setIrData(msg.data[0].ir);
                }
            } catch (e) {
                console.log("Non-JSON message:", event.data);
            }
        };

        ws.onclose = () => console.log("ESP32 disconnected");
        ws.onerror = (err) => console.error(err);

        return () => ws.close();
    }, []);

    return(
        <>
            <Row>
                <Col span={24} style={{height: "calc(100vh - 120px)", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "20px"}}>
                    <div style={{fontSize: "25px", fontWeight: 600}}>Video giám sát bãi giữ xe</div>
                    <div>
                        <img src={videoUrl} />
                    </div>
                </Col>
            </Row>
        </>
    )
}

export default ParkingSupervised;