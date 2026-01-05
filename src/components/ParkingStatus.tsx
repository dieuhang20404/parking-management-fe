import { Col, Row } from "antd";
import { useContext, useEffect, useState, type JSX } from "react";
import { messageService } from "../configs/interface";
import LoadingModal from "./LoadingModal";
import { getEmptyPositionApi } from "../services/appService";
import { CarFront } from "lucide-react";
import { UserContext } from "../configs/globalVariable";

const ParkingStatus = (): JSX.Element => {
    const {irData} = useContext(UserContext);
    const [emptyPosition, setEmptyPosition] = useState<{pos: number, status: number}[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        getEmptyPosition();
    }, [])
    
    const getEmptyPosition = async () => {
        setLoading(true);
        try {   
            const result = await getEmptyPositionApi();
            if (result.code == 0) {
                setEmptyPosition(result.data.map((item: any) => ({
                    pos: item,
                    status: 0
                })));
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

    useEffect(() => {
        setEmptyPosition((prev) => (
            prev.map((item, index) => ({...item, status: irData[index]}))
        ))
    }, [irData]);

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
                                status: emptyPosition.find((item) => (item.pos == index + 1)) ? emptyPosition.find((item) => (item.pos == index + 1))?.status : 1
                            })).map((item) => (
                                <div style={{width: "20%", display: "flex", flexDirection: "column", alignItems: "center"}}>
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