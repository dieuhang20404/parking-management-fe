import { Col, Row, Table, type TableProps } from "antd";
import { useState, type JSX } from "react";
import type { HistoryType } from "../configs/interface";

const ParkingHistory = (): JSX.Element => {
    const [history, setHistory] = useState<HistoryType[]>([]);
    const [getHistoryLoading, setGetHistoryLoading] = useState<boolean>(false);

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

                    }}
                >
                    Xem
                </div>
            )
        }
    ]

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
        </>
    )
}

export default ParkingHistory;