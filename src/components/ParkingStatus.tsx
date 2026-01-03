import { Col, Row } from "antd";
import { useEffect, useState, type JSX } from "react";
import { messageService } from "../configs/interface";
import LoadingModal from "./LoadingModal";
import { getEmptyPositionApi } from "../services/appService";
import { CarFront } from "lucide-react";

const ParkingStatus = (): JSX.Element => {
    const [emptyPosition, setEmptyPosition] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        getEmptyPosition();
    }, [])
    
    const getEmptyPosition = async () => {
        setLoading(true);
        try {   
            const result = await getEmptyPositionApi();
            if (result.code == 0) {
                setEmptyPosition(result.data);
            } else {
                messageService.error(result.message);
            }
        } catch(e) {
            console.log(e);
            messageService.error("Xảy ra lỗi ở server");
        } finally {
            setLoading(false);
        }
    }
    return(
        <>
            <Row>
                <Col span={24} style={{paddingBottom: "20px"}}>
                    <div>{`Số vị trí trống: ${emptyPosition.length}`}</div>
                </Col>
                <Col span={24}>
                    <div style={{width: "100%", display: "flex", flexWrap: "wrap", rowGap: "20px"}}>
                        {
                            Array.from({length: 100}, (_, index) => ({
                                id: index + 1,
                                status: emptyPosition.includes(index + 1) ? 0 : 1
                            })).map((item) => (
                                <div style={{width: "20%", display: "flex", flexFlow: "column", alignItems: "center"}}>
                                    <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                                        <CarFront strokeWidth={1} size={24} color={`${item.status == 0 ? "#dc3545" : "black"}`} />
                                        <div style={{color: `${item.status == 0 ? "#dc3545" : "black"}`}}>{item.id}</div>
                                    </div>
                                    <div style={{color: `${item.status == 0 ? "#dc3545" : "black"}`}}>{`${item.status == 0 ? "Còn trống" : "Có xe"}`}</div>
                                </div>
                            ))
                        }
                    </div>
                </Col>
            </Row>
            <LoadingModal 
                open={loading}
                message="Đang lấy dữ liệu"
            />
        </>
    )
}

export default ParkingStatus;