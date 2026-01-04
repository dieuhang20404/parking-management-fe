import { useEffect, useMemo, useState } from "react";
import { buildBaseMap, type Cell } from "../util/buildBaseMap";
import { messageService } from "../configs/interface";
import LoadingModal from "./LoadingModal";
import { getFindPathApi } from "../services/appService";

export default function ParkingMap() {
    const baseMap = useMemo(() => buildBaseMap(), []);
    const [map, setMap] = useState<Cell[][]>(baseMap);
    const [findPath, setFindPath] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        getFindPath();
    }, [])

    const getFindPath = async () => {
        setLoading(true);
        try {
            const result = await getFindPathApi();
            if (result.code == 0) {
                setFindPath(result.data);

                // Highlight đường đi trên map
                setMap(prev =>
                    prev.map(row =>
                        row.map(cell => {
                            // Nếu cell.id nằm trong findPath, đánh dấu là đường đi
                            if (cell.type === "slot" && cell.id && result.data.includes(cell.id)) {
                                return { ...cell, isPath: true };
                            }
                            // Hoặc nếu findPath chứa tọa độ [row, col]
                            // if (result.data.some(([r, c]) => r === row && c === col)) {
                            //     return { ...cell, isPath: true };
                            // }
                            return cell;
                        })
                    )
                );
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

    return (
        <>
            <div className="parking-wrapper">
                <div style={{paddingBottom: "20px"}}>
                    {`Đường đi đến vị trí đỗ xe: ${findPath.length} bước`}
                </div>
                <div className="grid">
                    {map.map((row, r) =>
                        row.map((cell, c) => (
                            <div
                                key={`${r}-${c}`}
                                className={`cell ${cell.type} ${
                                    cell.type === "slot" && cell.status === 1
                                        ? "occupied"
                                        : cell.status === 2
                                            ? "locked"
                                            : ""
                                } ${cell.isPath ? "path" : ""}`}
                            />
                        ))
                    )}
                </div>
            </div>
            <LoadingModal
                open={loading}
                message="Đang tìm đường..."
            />
        </>
    );
}