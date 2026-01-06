import { Button, Col, Modal, Row } from "antd";
import { useContext, useEffect, useRef, useState, type JSX } from "react";
import { messageService, useScreens } from "../configs/interface";
import { createTicketApi, getPlateNumberApi } from "../services/appService";
import LoadingModal from "./LoadingModal";
import { UserContext } from "../configs/globalVariable";
import dayjs from "dayjs";
import type { PathData } from "./ParkingMap";
import ParkingMap from "./ParkingMap";

const HeaderOfCustomer = (): JSX.Element => {
    const wsRef = useRef<WebSocket | null>(null);
    const {setTicketList, irData, setIrData} = useContext(UserContext);
    const [loading, setLoading] = useState<boolean>(false);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [plateNumber, setPlateNumber] = useState<string>("");
    const [imageIn, setImageIn] = useState<string>("");

    const [pathData, setPathData] = useState<PathData | null>(null);
    const [showMap, setShowMap] = useState<boolean>(false);
    const [irDataTmp, setIrDataTmp] = useState<number[]>([]);

    useEffect(() => {
        const ws = new WebSocket(`ws://${import.meta.env.VITE_ESP32_IP}:${import.meta.env.VITE_ESP32_PORT}`);
        ws.binaryType = "arraybuffer";
        wsRef.current = ws;

        ws.onopen = () => console.log("Connected to ESP32");

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === "ir") {
                    setIrData(msg.data[0].ir);
                    console.log(msg.data[0].ir)
                }
            } catch (e) {
                console.log("Non-JSON message:", event.data);
            }
        };

        ws.onclose = () => console.log("ESP32 disconnected");
        ws.onerror = (err) => console.error(err);

        return () => ws.close();
    }, []);

    const getPlateNumber = async () => {
        setLoading(true)
        try {
            const tmp = irData;
            setIrDataTmp(tmp);
            console.log("abcd: ", tmp)
            const result = await getPlateNumberApi(tmp);
            if (result.code == 0) {
                setPlateNumber(result.data.plateNumber);
                setImageIn(result.data.imageUrl);
                setShowConfirm(true);
            } else {
                messageService.error(result.message)
            }
        } catch(e) {
            console.log(e);
            messageService.error("Xảy ra lỗi ở server");
        } finally {
            setLoading(false)
        }   
    }

    const createTicket = async () => {
        setShowConfirm(false);
        setLoading(true)
        try {
            const result = await createTicketApi(plateNumber, imageIn, irDataTmp);
            if (result.code == 0) {
                const ticket = result.data.ticket;
                // Thêm vé vào bảng danh sách vé
                setTicketList((prev) => (
                    [
                        {
                            id: ticket.id,
                            plateNumber: ticket.plateNumber,
                            timeIn: dayjs(ticket.timeIn),
                            timeOut: ticket.timeOut ? dayjs(ticket.timeOut) : null,
                            uuid: ticket.uuid,
                            qrCode: ticket.qrCode,
                            parkingLotId: ticket.parkingLotId
                        },
                        ...prev
                    ]
                ))
                // Hiện map
                const findPath = result.data.findPath;
                setPathData(findPath);
                setShowMap(true)
            } else {
                messageService.error(result.message)
            }
        } catch(e) {
            console.log(e);
            messageService.error("Xảy ra lỗi ở server");
        } finally {
            setLoading(false)
        }   
    }
    return(
        <>
            <Row
                style={{
                    // backgroundColor: `${useScreens().sm ? "pink" : "yellow"}`, 
                    backgroundColor: "white",
                    padding: "15px 0px", 
                    boxShadow: "0 0 20px 2px rgba(0, 0, 0, 0.3)", 
                    position: "sticky",
                    top: "0px",
                    left: "0px",
                    width: "100%",
                    height: "60px",
                    zIndex: 100
                }}
            >
                <Col span={12} style={{backgroundColor: "white", paddingLeft: "15px", display: "flex", alignItems: "center", height: "100%"}}>
                    <div style={{fontSize: "25px", fontFamily: "Playfair Display"}}>PARKING</div>
                </Col>
                <Col span={12} style={{backgroundColor: "white", paddingRight: "15px", display: "flex", justifyContent: "end", alignItems: "center", height: "100%"}}>
                    <Button
                        variant="solid"
                        color="primary"
                        size="large"
                        onClick={() => {
                            getPlateNumber();
                        }}
                    >
                        Lấy vé xe
                    </Button>
                </Col>
            </Row>
            <LoadingModal 
                open={loading}
                message="Đang xử lý"
            />
            <Modal
                title={<span style={{fontFamily: "Quicksand", fontSize: "18px"}}>Xác nhận biển số xe</span>}
                open={showConfirm}
                centered={true}
                maskClosable={false}
                onOk={() => {createTicket()}}
                onCancel={() => {setShowConfirm(false)}}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{size: "large"}}
                cancelButtonProps={{size: "large"}}
            >
                <Row className="py-1">
                    <Col span={24}>
                        <div>{`Biển số xe của bạn là: ${plateNumber}`}</div>
                    </Col>
                </Row>
            </Modal>
            <Modal
                title={<span style={{fontFamily: "Quicksand", fontSize: "18px"}}>Hướng dẫn đến điểm đỗ xe</span>}
                open={showMap}
                centered={true}
                maskClosable={false}
                onOk={() => {setShowMap(false)}}
                onCancel={() => {setShowMap(false)}}
                okText="OK"
                cancelText="Hủy"
                okButtonProps={{size: "large"}}
                cancelButtonProps={{size: "large"}}
            >
                <ParkingMap 
                    pathData={pathData}
                    setPathData={setPathData}
                    irDataTmp={irDataTmp}
                />
            </Modal>
        </>
    )
}

export default HeaderOfCustomer;