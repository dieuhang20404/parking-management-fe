import { Button, Col, Modal, Row } from "antd";
import { useContext, useEffect, useState, type JSX } from "react";
import { messageService, useScreens } from "../configs/interface";
import { createTicketApi, getPlateNumberApi } from "../services/appService";
import LoadingModal from "./LoadingModal";
import { UserContext } from "../configs/globalVariable";
import dayjs from "dayjs";

const HeaderOfCustomer = (): JSX.Element => {
    const {ticketList, setTicketList} = useContext(UserContext);
    const [loading, setLoading] = useState<boolean>(false);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [plateNumber, setPlateNumber] = useState<string>("");
    const [imageIn, setImageIn] = useState<string>("");

    const getPlateNumber = async () => {
        setLoading(true)
        try {
            const result = await getPlateNumberApi();
            if (result.code == 0) {
                setPlateNumber(result.data.plateNumber);
                setImageIn(result.data.detectResult);
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
            const result = await createTicketApi(plateNumber, imageIn);
            if (result.code == 0) {
                // Thêm vé vào bảng danh sách vé
                setTicketList((prev) => (
                    [
                        {
                            id: result.data.id,
                            plateNumber: result.data.plateNumber,
                            timeIn: dayjs(result.data.timeIn),
                            timeOut: result.data.timeOut ? dayjs(result.data.timeOut) : null,
                            uuid: result.data.uuid,
                            qrCode: result.data.qrCode,
                            parkingLotId: result.data.parkingLotId
                        },
                        ...prev
                    ]
                ))
                // Hiện map
                
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
                    <Col>
                        <div>{`Biển số xe của bạn là: ${plateNumber}`}</div>
                    </Col>
                </Row>
            </Modal>
        </>
    )
}

export default HeaderOfCustomer;