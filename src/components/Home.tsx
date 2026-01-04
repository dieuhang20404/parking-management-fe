import { Button, Col, Modal, Row, Table, type TableProps } from "antd";
import { useEffect, useState, type JSX } from "react";
import { messageService, type TicketTable, type TicketType } from "../configs/interface";
import dayjs from "dayjs";
import { checkoutApi, createTicketTestApi, getAllTicketApi } from "../services/appService";
import LoadingModal from "./LoadingModal";
import { socket } from "../configs/socket";

const Home = (): JSX.Element => {
    const [ticketList, setTicketList] = useState<TicketType[]>([]);
    const [getTicketLoading, setGetTicketLoading] = useState<boolean>(false);
    const [imgUrl, setImgUrl] = useState<string>("");
    const [showTicket, setShowTicket] = useState<boolean>(false);
    const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);

    const columns: TableProps<TicketTable>["columns"] = [
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
            title: "QR Code",
            key: "ticket",
            dataIndex: "qrCode",
            align: "center",
            render: (_, record, __) => (
                <div 
                    className="text-link" 
                    onClick={() => {
                        setShowTicket(true);
                        setImgUrl(record.qrCode);
                    }}
                >
                    Xem
                </div>
            )
        }
    ]
    
    useEffect(() => {
        getAllTicket();
    }, [])

    const getAllTicket = async () => {
        setGetTicketLoading(true);
        try {
            const result = await getAllTicketApi();
            if (result.code == 0) {
                const tickets: TicketType[] = result.data.map((item: any) => (
                    {
                        id: item.id,
                        plateNumber: item.plateNumber,
                        timeIn: dayjs(item.timeIn),
                        timeOut: item.timeOut ? dayjs(item.timeOut) : null,
                        uuid: item.uuid,
                        qrCode: item.qrCode,
                        parkingLotId: item.parkingLotId
                    }
                ))
                setTicketList(tickets);
            } else {
                messageService.error(result.message);
            }
        } catch(e) {
            console.log(e);
            messageService.error("Xảy ra lỗi ở server");
        } finally {
            setGetTicketLoading(false);
        }
    }

    const checkout = async () => {
        setCheckoutLoading(true)
        try {
            const result = await checkoutApi(imgUrl);
            // Xử lý lấy xe (từ qr code tìm ra biển số xe rồi so với biển số xe camera đang quét)
            if (result.code == 0) {

            } else {
                messageService.error(result.message)
            }
        } catch(e) {
            console.log(e);
            messageService.error("Xảy ra lỗi ở server");
        } finally {
            setCheckoutLoading(false);
        }
    }

    useEffect(() => {
        const handleNewTicket = (ticket: any) => {
            console.log(ticket);
            setTicketList((prev) => (
                [
                    {
                        id: ticket.id,
                        plateNumber: ticket.plateNumber,
                        timeIn: dayjs(ticket.timeIn),
                        timeOut: null,
                        uuid: ticket.uuid,
                        qrCode: ticket.qrCode,
                        parkingLotId: ticket.parkingLotId
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

    const createTicketTest = async () => {
        try {
            const result = await createTicketTestApi();
            if (result.code == 0) {
                messageService.success(result.message);
            } else {
                messageService.error(result.message);
            }
        } catch(e) {
            console.log(e);
            messageService.error("Xảy ra lỗi ở server");
        }
    }

    return(
        <>
            <Row gutter={[0, 20]} style={{width: "100%", padding: "0px 10px"}}>
                <Col span={24} style={{display: "flex", justifyContent: "center", paddingTop: "10px"}}>
                    <div style={{fontSize: "20px"}}>Danh Sách Vé Xe</div>
                </Col>
                <Col span={24}>
                    <Table<TicketTable>
                        columns={columns}
                        dataSource={ticketList}
                        rowKey={"id"}
                        pagination={false}
                        scroll={{x: "max-content"}}
                        loading={getTicketLoading}
                    />
                </Col>
                <Col span={24} style={{display: "flex", justifyContent: "center"}}>
                    <Button
                        variant="solid"
                        color="primary"
                        size="large"
                        onClick={() => {
                            createTicketTest();
                        }}
                    >
                        Test
                    </Button>
                </Col>
            </Row>
            <Modal
                title={null}
                open={showTicket}
                centered={true}
                maskClosable={false}
                onCancel={() => {setShowTicket(false)}}
                onOk={() => {checkout()}}
                okText="Lấy xe"
                cancelText="Hủy"
                okButtonProps={{size: "large"}}
                cancelButtonProps={{size: "large"}}
            >
                <Row className="py-1" style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <Col span={24} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                        <img style={{width: "100%", height: "auto", aspectRatio: "1/1"}} src={imgUrl} />
                    </Col>
                </Row>
            </Modal>
            <LoadingModal 
                open={checkoutLoading}
                message="Đang xử lý"
            />
        </>
    )
}

export default Home;