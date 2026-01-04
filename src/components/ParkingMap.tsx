import { useEffect, useMemo, useState } from "react";
import { buildBaseMap, type Cell } from "../util/buildBaseMap";

export default function ParkingMap() {
    const baseMap = useMemo(() => buildBaseMap(), []);
    const [map, setMap] = useState<Cell[][]>(baseMap);

    const fetchAndUpdate = async () => {
        const res = await fetch("http://localhost:4000/pathFindUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                sensorId: 1,
            }),
        });

        const data = await res.json();

        const statusMap: Record<number, number> = data.statusMap;

        setMap(prev =>
            prev.map(row =>
                row.map(cell => {
                    if (cell.type !== "slot" || cell.id == null) return cell;

                    const status = statusMap[cell.id];
                    return status !== undefined
                        ? { ...cell, status }
                        : cell;
                })
            )
        );
    };


    useEffect(() => {
        fetchAndUpdate();

        // socket.on("parking:update", fetchAndUpdate);
        // return () => socket.off("parking:update");
    }, []);

    return (
        <div className="parking-wrapper">
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
                            }`}
                        />
                    ))
                )}
            </div>
        </div>
    );
}