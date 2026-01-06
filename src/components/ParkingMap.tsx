import { Col, Row, Button, message } from "antd";
import { useEffect, useState, type Dispatch, type JSX, type SetStateAction } from "react";
import { messageService } from "../configs/interface";
import LoadingModal from "./LoadingModal";
import { getEmptyPositionApi, getFindPathApi } from "../services/appService";
import { CarFront, Navigation } from "lucide-react";
import React from "react";

export interface PathData {
    path: [number, number][];
    targetSlot: number;
    sensorId: number | string;
    distance: number;
}

export interface ParkingMapProps {
    pathData: PathData | null,
    setPathData: Dispatch<SetStateAction<PathData | null>>,
    irDataTmp: number[]
}

const ParkingMap = ({irDataTmp}: ParkingMapProps): JSX.Element => {
    const [loading, setLoading] = useState<boolean>(false);
    const [emptyPosition, setEmptyPosition] = useState<number[]>([]);
    const [pathData, setPathData] = useState<PathData | null>(null);
    const [pathSlotIds, setPathSlotIds] = useState<number[]>([]);

    useEffect(() => {
        getEmptyPosition().then();
    }, [])

    const getEmptyPosition = async () => {
        setLoading(true);
        try {
            const result = await getEmptyPositionApi();
            if (result.code == 0) {
                const sensorId = result.data;
                const empty = [];
                for (let i = 0; i < sensorId.length; i++) {
                    if (irDataTmp[i] == 1) {
                        empty.push(sensorId[i]);
                    }
                }
                setEmptyPosition(empty);
                console.log(empty)
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

    const getFindPath = async () => {
        setLoading(true);
        try {
            const response = await getFindPathApi(irDataTmp);

            console.log("=================================");
            console.log("📦 Response:", response);

            // Response structure: { code, data, message }
            if (response.code === 0 && response.data) {
                console.log("🎉 Path found!");
                console.log("   Target slot:", response.data.targetSlot);
                console.log("   Sensor:", response.data.sensorId);
                console.log("   Distance:", response.data.distance);
                console.log("   Path:", response.data.path);

                setPathData(response.data);

                // Convert positions to slot IDs
                if (Array.isArray(response.data.path)) {
                    const slotIds = response.data.path
                        .map((pos: [number, number]) => {
                            const [row, col] = pos;
                            const id = calculateSlotId([row, col]);
                            console.log(`   Position [${row}, ${col}] → Slot ${id}`);
                            return id;
                        })
                        .filter((id: number) => id > 0 && id <= 100);

                    console.log("✅ Path slots:", slotIds);
                    setPathSlotIds(slotIds);

                    messageService.success(
                        `Tìm thấy đường đi đến slot ${response.data.targetSlot} (${slotIds.length} bước)`
                    );
                } else {
                    console.warn("⚠️ Path is not an array");
                }
            } else {
                console.log("❌ No path:", response.message);
                messageService.error(response.message || "Không tìm thấy đường đi");
            }

            console.log("=================================");

        } catch(e: any) {
            console.error("❌ Exception:", e);
            messageService.error("Lỗi khi tìm đường");
        } finally {
            setLoading(false);
        }
    }

    const calculateSlotId = (position: [number, number]): number => {
        const [row, col] = position;
        const cols = 10;
        return row * cols + col + 1;
    }

    const clearPath = () => {
        setPathData(null);
        setPathSlotIds([]);
        message.info("Đã xóa đường đi").then();
    }

    const getSlotStyle = (slotId: number, status: number): React.CSSProperties => {
        if (pathData && slotId === pathData.targetSlot) {
            return {
                backgroundColor: "#28a745",
                color: "white",
                fontWeight: "bold",
                padding: "8px",
                borderRadius: "8px",
                border: "3px solid #155724",
                boxShadow: "0 0 15px rgba(40, 167, 69, 0.6)",
                transform: "scale(1.1)"
            };
        }

        if (pathSlotIds.includes(slotId)) {
            return {
                backgroundColor: "#ffc107",
                color: "#000",
                fontWeight: "600",
                padding: "8px",
                borderRadius: "8px",
                border: "2px solid #ff9800",
                boxShadow: "0 0 10px rgba(255, 193, 7, 0.4)"
            };
        }

        return {
            color: status === 0 ? "#dc3545" : "black",
            transition: "all 0.3s ease",
            padding: "8px"
        };
    }

    const getCarIconColor = (slotId: number, status: number): string => {
        if (pathData && slotId === pathData.targetSlot) return "white";
        if (pathSlotIds.includes(slotId)) return "#000";
        return status === 0 ? "#dc3545" : "black";
    }

    return(
        <>
            <Row>
                <Col span={24} style={{paddingBottom: "20px"}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px"}}>
                        <div style={{fontSize: "16px", fontWeight: "500"}}>
                            {`Số vị trí trống: ${emptyPosition.length}/100`}
                        </div>

                        <div style={{display: "flex", gap: "10px"}}>
                            <Button
                                type="primary"
                                icon={<Navigation size={16} />}
                                onClick={getFindPath}
                                loading={loading}
                                size="middle"
                            >
                                Tìm đường
                            </Button>

                            {pathData && (
                                <Button
                                    onClick={clearPath}
                                    size="middle"
                                >
                                    Xóa đường đi
                                </Button>
                            )}
                        </div>
                    </div>

                    {pathData && (
                        <div style={{
                            marginTop: "15px",
                            padding: "15px",
                            backgroundColor: "#e8f5e9",
                            borderRadius: "8px",
                            fontSize: "14px",
                            border: "2px solid #4caf50"
                        }}>
                            <div style={{marginBottom: "5px"}}>
                                <strong>🎯 Slot đích:</strong> {pathData.targetSlot}
                            </div>
                            <div style={{marginBottom: "5px"}}>
                                <strong>📡 Sensor ID:</strong> {pathData.sensorId}
                            </div>
                            <div style={{marginBottom: "5px"}}>
                                <strong>📏 Khoảng cách:</strong> {pathData.distance} bước
                            </div>
                            <div>
                                <strong>🗺️ Lộ trình:</strong> {pathSlotIds.length > 0 ? pathSlotIds.join(' → ') : 'N/A'}
                            </div>
                        </div>
                    )}
                </Col>

                <Col span={24}>
                    {/* Legend */}
                    <div style={{
                        display: "flex",
                        gap: "15px",
                        marginBottom: "15px",
                        padding: "10px",
                        backgroundColor: "#f5f5f5",
                        borderRadius: "6px",
                        flexWrap: "wrap"
                    }}>
                        <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
                            <div style={{width: "16px", height: "16px", backgroundColor: "#dc3545", borderRadius: "3px"}}></div>
                            <span style={{fontSize: "13px"}}>Trống</span>
                        </div>
                        <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
                            <div style={{width: "16px", height: "16px", backgroundColor: "black", borderRadius: "3px"}}></div>
                            <span style={{fontSize: "13px"}}>Có xe</span>
                        </div>
                        <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
                            <div style={{width: "16px", height: "16px", backgroundColor: "#ffc107", border: "2px solid #ff9800", borderRadius: "3px"}}></div>
                            <span style={{fontSize: "13px"}}>Đường đi</span>
                        </div>
                        <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
                            <div style={{width: "16px", height: "16px", backgroundColor: "#28a745", border: "2px solid #155724", borderRadius: "3px"}}></div>
                            <span style={{fontSize: "13px"}}>Đích đến</span>
                        </div>
                    </div>

                    {/* Grid */}
                    <div style={{
                        width: "100%",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        border: "2px solid #ddd",
                        padding: "20px",
                        borderRadius: "8px",
                        backgroundColor: "white"
                    }}>
                        {
                            Array.from({length: 100}, (_, index) => ({
                                id: index + 1,
                                status: emptyPosition.includes(index + 1) ? 0 : 1
                            })).map((item) => {
                                const baseStyle: React.CSSProperties = {
                                    width: "calc(20% - 6.4px)",
                                    minWidth: "70px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    cursor: "pointer",
                                    userSelect: "none"
                                };

                                const slotStyle = getSlotStyle(item.id, item.status);
                                const combinedStyle = { ...baseStyle, ...slotStyle };

                                return (
                                    <div key={item.id} style={combinedStyle}>
                                        <div style={{display: "flex", alignItems: "center", gap: "6px"}}>
                                            <CarFront
                                                strokeWidth={1.5}
                                                size={18}
                                                color={getCarIconColor(item.id, item.status)}
                                            />
                                            <div style={{fontSize: "15px"}}>
                                                {item.id}
                                            </div>
                                        </div>
                                        <div style={{fontSize: "10px", marginTop: "3px"}}>
                                            {pathData && item.id === pathData.targetSlot
                                                ? "🎯"
                                                : pathSlotIds.includes(item.id)
                                                    ? "→"
                                                    : item.status === 0 ? "Trống" : "Xe"}
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                </Col>
            </Row>
            <LoadingModal
                open={loading}
                message="Đang xử lý..."
            />
        </>
    )
}

export default ParkingMap;