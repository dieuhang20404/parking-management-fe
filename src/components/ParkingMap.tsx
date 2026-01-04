import { useEffect, useMemo, useState } from "react";

type Cell = { x: number; y: number };
type Slot = { rep: Cell; group?: Cell[] };

export default function ParkingMapSensorsOnly() {
    const [matrix, setMatrix] = useState<number[][]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [isDataReady, setIsDataReady] = useState(false);

    // Fetch matrix + sensors từ BE
    useEffect(() => {
        setIsDataReady(false);
        fetch("http://localhost:4000/sensors")
            .then(res => res.json())
            .then(json => {
                if (json.code === 0 && json.data) {
                    const newMatrix = json.data.matrix || [];
                    const newSlots: Slot[] = Array.isArray(json.data.sensors) ? json.data.sensors : [];
                    console.log("Matrix:", newMatrix);
                    console.log("Slots:", newSlots);
                    // Lọc sensor hợp lệ
                    const validSlots = newSlots.filter(
                        s => s && s.rep && typeof s.rep.x === "number" && typeof s.rep.y === "number"
                    );

                    setMatrix(newMatrix);
                    setSlots(validSlots);
                } else {
                    setMatrix([]);
                    setSlots([]);
                }
                setIsDataReady(true);
            })
            .catch(err => {
                console.error("Fetch error:", err);
                setMatrix([]);
                setSlots([]);
                setIsDataReady(true);
            });
    }, []);

    const rows = matrix?.length ?? 0;
    const cols = matrix?.[0]?.length ?? 0;

    // Tạo Set lookup sensor nhanh (sensor chiếm 2 ô ngang)
    const sensorSet = useMemo(() => {
        const set = new Set<string>();
        slots.forEach(slot => {
            if (slot.rep) {
                const r = slot.rep.y; // row
                const c = slot.rep.x; // col
                set.add(`${r}-${c}`);       // ô chính
                set.add(`${r}-${c + 1}`);   // ô liền phải
            }
            if (slot.group) {
                slot.group.forEach(c => {
                    if (c?.x !== undefined && c?.y !== undefined) set.add(`${c.y}-${c.x}`);
                });
            }
        });
        return set;
    }, [slots]);

    const isSensor = (r: number, c: number) => sensorSet.has(`${r}-${c}`);

    const renderCell = (r: number, c: number) => {
        const key = `${r}-${c}`;
        const val = matrix[r][c] ?? 0;
        let style: React.CSSProperties = {};
        const classes = ["map-cell"];

        // Ô có xe đậu
        if (val === -1) {
            style.backgroundColor = "#000"; // tô đen
        }

        // Sensor viền nổi bật
        if (isSensor(r, c)) {
            style.border = "3px solid #10b981"; // xanh nổi bật
            style.backgroundColor = "#34d399"; // màu xanh nhạt
        } else {
            style.border = "0.2px solid rgba(0,0,0,0.1)";
        }

        // Ô góc
        if ([4, 5, 6, 7].includes(val)) {
            const cornerMap: Record<number, string> = {
                4: "linear-gradient(to top, #cfcfcf 50%, transparent 50%), linear-gradient(to right, #cfcfcf 50%, transparent 50%)",
                5: "linear-gradient(to top, #cfcfcf 50%, transparent 50%), linear-gradient(to left, #cfcfcf 50%, transparent 50%)",
                6: "linear-gradient(to bottom, #cfcfcf 50%, transparent 50%), linear-gradient(to right, #cfcfcf 50%, transparent 50%)",
                7: "linear-gradient(to bottom, #cfcfcf 50%, transparent 50%), linear-gradient(to left, #cfcfcf 50%, transparent 50%)",
            };
            style.background = cornerMap[val];
        }

        // Viền
        else if (val === 9) {
            const top = matrix[r - 1]?.[c] ?? 0;
            const bottom = matrix[r + 1]?.[c] ?? 0;
            const left = matrix[r]?.[c - 1] ?? 0;
            const right = matrix[r]?.[c + 1] ?? 0;
            let background = "#cfcfcf";
            if ((top === 6 && bottom === 4) || (top === 4 && bottom === 6)) background = "linear-gradient(to right, #cfcfcf 50%, transparent 50%)";
            else if ((left === 6 && right === 7) || (left === 7 && right === 6)) background = "linear-gradient(to bottom, #cfcfcf 50%, transparent 50%)";
            else if ((left === 4 && right === 5) || (left === 5 && right === 4)) background = "linear-gradient(to top, #cfcfcf 50%, transparent 50%)";
            else if ((top === 5 && bottom === 7) || (top === 7 && bottom === 5)) background = "linear-gradient(to left, #cfcfcf 50%, transparent 50%)";
            else if ((top === 6 && bottom === 7) || (top === 7 && bottom === 6)) background = "linear-gradient(to left, #cfcfcf 50%, transparent 50%)";
            else if ((top === 4 && bottom === 5) || (top === 5 && bottom === 4)) background = "linear-gradient(to right, #cfcfcf 50%, transparent 50%)";
            style.background = background;
        }
        // Các ô bình thường
        else if (val >= 0) {
            classes.push(`cell-${val}`);
        }

        return <div key={key} className={classes.join(" ")} style={{ ...style, position: 'relative' }} />;
    };

    if (!isDataReady) return <div style={{ padding: 20, textAlign: "center" }}>Đang tải bản đồ...</div>;
    if (rows === 0 || cols === 0) return <div style={{ padding: 20, textAlign: "center" }}>Không có dữ liệu bản đồ</div>;

    return (
        <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: 20 }}>Bản đồ bãi đỗ xe (chỉ sensor)</h2>

            <div style={{
                display: "grid",
                gridTemplateRows: `repeat(${rows}, 1fr)`,
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: 0,
                aspectRatio: `${cols} / ${rows}`,
                width: "min(90vw, 800px)",
                margin: "0 auto",
                border: "2px solid #333",
            }}>
                {matrix.map((row, r) => row.map((_, c) => renderCell(r, c)))}
            </div>

            <style>{`
        .map-cell { width: 100%; height: 100%; box-sizing: border-box; }
        .cell-0 { background-color: #cfcfcf; } /* Lối đi */
        .cell-1 { background-color: #8bc34a; } /* Vị trí đỗ */
        .cell-2, .cell-3, .cell-8 { background-color: #1f2937; } /* Tường/cột */
      `}</style>
        </div>
    );
}
