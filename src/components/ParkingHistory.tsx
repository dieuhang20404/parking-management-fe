import { Col, Modal, Row, Table, type TableProps } from "antd";
import { useEffect, useState, type JSX } from "react";
import { messageService, type HistoryType } from "../configs/interface";
import { getHistoryApi } from "../services/appService";
import dayjs from "dayjs";
import { socket } from "../configs/socket";

const ParkingHistory = (): JSX.Element => {
    const [history, setHistory] = useState<HistoryType[]>([]);
    const [getHistoryLoading, setGetHistoryLoading] = useState<boolean>(false);
    const [showImage, setShowImage] = useState<boolean>(false);
    const [imageInUrl, setImageInUrl] = useState<string>("");
    const [imageOutUrl, setImageOutUrl] = useState<string | null>(null);

    const columns: TableProps<HistoryType>["columns"] = [
        {
            title: "STT",
            key: "stt",
            render: (_, __, index) => (
                <div>{index + 1}</div>
            ),
            align: "center"
        },
        {
            title: "Biển số",
            key: "plateNumber",
            dataIndex: "plateNumber",
            align: "center"
        },
        {
            title: "Giờ vào",
            key: "timeIn",
            dataIndex: "timeIn",
            align: "center",
            render: (value) => (
                <div>{value.format("HH:mm:ss DD/MM/YYYY")}</div>
            )
        },
        {
            title: "Giờ ra",
            key: "timeOut",
            dataIndex: "timeOut",
            align: "center",
            render: (value) => (
                <div>{value ? value.format("HH:mm:ss DD/MM/YYYY") : "-"}</div>
            )
        },
        {
            title: "Vị trí đỗ",
            key: "parkingLotId",
            dataIndex: "parkingLotId",
            align: "center"
        },
        {
            title: "Hình ảnh",
            key: "imageInOut",
            align: "center",
            render: (_, record, __) => (
                <div 
                    className="text-link" 
                    onClick={() => {
                        setShowImage(true);
                        setImageInUrl(record.imageIn);
                        setImageOutUrl(record.imageOut);
                    }}
                >
                    Xem
                </div>
            )
        }
    ]

    useEffect(() => {
        const handleNewTicket = (ticket: any) => {
            console.log(ticket);
            setHistory((prev) => (
                [
                    {
                        id: ticket.id,
                        plateNumber: ticket.plateNumber,
                        timeIn: dayjs(ticket.timeIn),
                        timeOut: ticket.timeOut ? dayjs(ticket.timeOut) : null,
                        parkingLotId: ticket.parkingLotId,
                        imageIn: ticket.imageIn,
                        imageOut: ticket.imageOut ?? null
                    }, 
                    ...prev
                ]
            ))
        }
        socket.on("ticket:create", handleNewTicket);

        return () => {
            socket.off("ticket:create", handleNewTicket);
        }
    }, [])

    useEffect(() => {
        getHistory()
    }, [])

    const getHistory = async () => {
        setGetHistoryLoading(true);
        try {
            const result = await getHistoryApi();
            if (result.code == 0) {
                const rawData: any = result.data;
                setHistory(rawData.map((item: any) => (
                    {
                        id: item.id,
                        plateNumber: item.plateNumber,
                        timeIn: dayjs(item.timeIn),
                        timeOut: item.timeOut ? dayjs(item.timeOut) : null,
                        parkingLotId: item.parkingLotId,
                        imageIn: item.imageIn,
                        imageOut: item.imageOut ?? null
                    }
                )))
            } else {
                messageService.error(result.message);
            }
        } catch(e) {
            console.log(e);
            messageService.error("Xảy ra lỗi ở server");
        } finally {
            setGetHistoryLoading(false);
        }
    }

    return(
        <>
            <Row>
                <Col span={24} style={{paddingBottom: "20px"}}>
                    <div style={{fontSize: "23px", textAlign: "center", fontWeight: 600}}>Lịch Sử Hoạt Động</div>
                </Col>
                <Col span={24}>
                    <Table<HistoryType>
                        columns={columns}
                        dataSource={history}
                        rowKey={"id"}
                        pagination={false}
                        scroll={{x: "max-content"}}
                        loading={getHistoryLoading}
                    />
                </Col>
            </Row>
            <Modal
                title={null}
                open={showImage}
                footer={null}
                centered={true}
                maskClosable={false}
                onCancel={() => {setShowImage(false)}}
            >
                <Row className="pb-1 pt-3" style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Col span={24}>
                        <Row gutter={[20, 0]}>
                            <Col span={12} style={{display: "flex", justifyContent: "center"}}>
                                <div style={{fontSize: "20px"}}>Ảnh xe vào</div>
                            </Col>
                            <Col span={12} style={{display: "flex", justifyContent: "center"}}>
                                <div style={{fontSize: "20px"}}>Ảnh xe ra</div>
                            </Col>
                        </Row>
                        <Row gutter={[20, 0]}>
                            <Col span={12} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                <img style={{width: "100%", height: "auto", aspectRatio: "1/1"}} src={imageInUrl} />
                            </Col>
                            <Col span={12} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                                {
                                    imageOutUrl ? (
                                        <img style={{width: "100%", height: "auto", aspectRatio: "1/1"}} src={imageOutUrl} />
                                    ) : (
                                        <div style={{fontSize: "20px", color: "rgba(0, 0, 0, 0.3)"}}>Chưa có</div>
                                    )
                                }
                            </Col>
                        </Row>
                    
                    </Col>
                </Row>
            </Modal>
        </>
    )
}

export default ParkingHistory;