import { useEffect, useMemo, useState } from "react";

type Cell = { x: number; y: number };
type Slot = { rep: Cell; group: Cell[] };

export default function ParkingMapWithPath() {
    const [matrix, setMatrix] = useState<number[][]>([]);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [path, setPath] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(false);
    const [isDataReady, setIsDataReady] = useState(false);

    // Fetch matrix + sensors từ BE
    useEffect(() => {
        setIsDataReady(false);
        fetch("http://localhost:4000/sensors")
            .then(res => res.json())
            .then(json => {
                console.log("API Response:", json);
                if (json.code === 0 && json.data) {
                    const newMatrix = json.data.matrix || [];
                    const newSlots = json.data.sensors || [];

                    console.log("Matrix:", newMatrix);
                    console.log("Slots:", newSlots);

                    // Validate slots trước khi set
                    const validSlots = Array.isArray(newSlots)
                        ? newSlots.filter(s => s && s.rep && typeof s.rep.x === 'number' && typeof s.rep.y === 'number')
                        : [];

                    setMatrix(newMatrix);
                    setSlots(validSlots);
                    setIsDataReady(true);
                } else {
                    console.error("Invalid API response:", json);
                    setMatrix([]);
                    setSlots([]);
                    setIsDataReady(true);
                }
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

    // Lookup nhanh sensor
    const repsSet = useMemo(() => {
        if (!slots || slots.length === 0) return new Set<string>();
        return new Set(slots.filter(s => s?.rep).map(s => `${s.rep.x}-${s.rep.y}`));
    }, [slots]);

    const groupLookup = useMemo(() => {
        const map = new Map<string, number>();
        if (!slots || slots.length === 0) return map;
        slots.forEach((slot, i) => {
            if (slot?.group) {
                slot.group.forEach(c => {
                    if (c?.x !== undefined && c?.y !== undefined) {
                        map.set(`${c.x}-${c.y}`, i);
                    }
                });
            }
        });
        return map;
    }, [slots]);

    console.log("matrix:", matrix, "rows:", rows, "cols:", cols);

    // Kiểm tra nếu chưa có dữ liệu
    if (!isDataReady) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <h2> Đang tải bản đồ...</h2>
            </div>
        );
    }

    if (rows === 0 || cols === 0) {
        return (
            <div style={{ padding: "20px", textAlign: "center" }}>
                <h2>Không có dữ liệu bản đồ</h2>
                <p>Vui lòng kiểm tra API server</p>
            </div>
        );
    }

    const isSensorMain = (r: number, c: number) => repsSet.has(`${r}-${c}`);
    const isSensorCell = (r: number, c: number) => groupLookup.has(`${r}-${c}`);

    // Kiểm tra cell có nằm trên path không
    const isOnPath = (r: number, c: number) => {
        return path.some(p => p[0] === c && p[1] === r);
    };

    const getPathIndex = (r: number, c: number) => {
        return path.findIndex(p => p[0] === c && p[1] === r);
    };

    // Tìm đường đi
    const findPath = async () => {
        setLoading(true);
        const STORAGE_KEY = "parking_sensor_slots";
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            console.error("Storage rỗng");
            setLoading(false);
            return;
        }

        const savedArray = JSON.parse(saved);
        if (!Array.isArray(savedArray) || savedArray.length === 0) {
            console.error("Target không hợp lệ trong storage");
            setLoading(false);
            return;
        }

        const targets = savedArray.map(slot => ({
            x: Number(slot.rep?.x),
            y: Number(slot.rep?.y),
        })).filter(t => !isNaN(t.x) && !isNaN(t.y));

        try {
            const res = await fetch("http://localhost:4000/find-path", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targets }),
            });
            const json = await res.json();

            if (json.code === 0 && json.data?.path) {
                setPath(json.data.path);
            } else {
                console.error("Lỗi từ BE:", json.message);
                setPath([]);
            }
        } catch (err) {
            console.error(err);
            setPath([]);
        } finally {
            setLoading(false);
        }
    };

    // Render từng cell
    const renderCell = (r: number, c: number) => {
        const key = `${r}-${c}`;
        const classes = ["map-cell"];
        let style: React.CSSProperties = {};

        const val = matrix[r][c] ?? 0;
        const onPath = isOnPath(r, c);
        const pathIdx = getPathIndex(r, c);
        const isStart = pathIdx === 0;
        const isGoal = pathIdx === path.length - 1;

        // Chỉ highlight nếu là start/goal, không tô toàn bộ path
        if (isStart) {
            classes.push("cell-start");
        } else if (isGoal) {
            classes.push("cell-goal");
        }
        // Nếu là sensor
        else if (isSensorCell(r, c)) {
            classes.push("cell-sensor");
            if (isSensorMain(r, c)) classes.push("cell-sensor-main");
        }
        // Nếu là ô góc (4,5,6,7)
        else if ([4, 5, 6, 7].includes(val)) {
            const cornerMap: Record<number, string> = {
                4: "linear-gradient(to top, #cfcfcf 50%, transparent 50%), linear-gradient(to right, #cfcfcf 50%, transparent 50%)",
                5: "linear-gradient(to top, #cfcfcf 50%, transparent 50%), linear-gradient(to left, #cfcfcf 50%, transparent 50%)",
                6: "linear-gradient(to bottom, #cfcfcf 50%, transparent 50%), linear-gradient(to right, #cfcfcf 50%, transparent 50%)",
                7: "linear-gradient(to bottom, #cfcfcf 50%, transparent 50%), linear-gradient(to left, #cfcfcf 50%, transparent 50%)",
            };
            style.background = cornerMap[val];
        }
        // Nếu là viền (9)
        else if (val === 9) {
            const top = matrix[r - 1]?.[c] ?? 0;
            const bottom = matrix[r + 1]?.[c] ?? 0;
            const left = matrix[r]?.[c - 1] ?? 0;
            const right = matrix[r]?.[c + 1] ?? 0;

            let background = "#cfcfcf";
            // Dọc: giữa 6-4 hoặc 4-6
            if ((top === 6 && bottom === 4) || (top === 4 && bottom === 6)) {
                background = "linear-gradient(to right, #cfcfcf 50%, transparent 50%)";
            }
            // Ngang: giữa 6-7 hoặc 7-6
            else if ((left === 6 && right === 7) || (left === 7 && right === 6)) {
                background = "linear-gradient(to bottom, #cfcfcf 50%, transparent 50%)";
            }
            // Ngang: giữa 4-5 hoặc 5-4
            else if ((left === 4 && right === 5) || (left === 5 && right === 4)) {
                background = "linear-gradient(to top, #cfcfcf 50%, transparent 50%)";
            }
            // Dọc: giữa 5-7 hoặc 7-5
            else if ((top === 5 && bottom === 7) || (top === 7 && bottom === 5)) {
                background = "linear-gradient(to left, #cfcfcf 50%, transparent 50%)";
            }
            // Thêm: Dọc giữa 6-7 (top-bottom)
            else if ((top === 6 && bottom === 7) || (top === 7 && bottom === 6)) {
                background = "linear-gradient(to left, #cfcfcf 50%, transparent 50%)";
            }
            // Thêm: Dọc giữa 4-5 (top-bottom)
            else if ((top === 4 && bottom === 5) || (top === 5 && bottom === 4)) {
                background = "linear-gradient(to right, #cfcfcf 50%, transparent 50%)";
            }
            style.background = background;
        }
        // Các ô bình thường
        else {
            classes.push(`cell-${val}`);
        }

        return (
            <div key={key} className={classes.join(" ")} style={{ ...style, position: 'relative' }}>
                {/* Vẽ path lines trên TẤT CẢ các ô nằm trên đường đi */}
                {onPath && renderPathLine(r, c)}
            </div>
        );
    };

    const renderPathLine = (r: number, c: number) => {
        const pathIdx = getPathIndex(r, c);
        if (pathIdx === -1) return null;

        // Vẽ dot tròn tại trung tâm của cell
        return (
            <div
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '8px',   // có thể tăng lên 8px nếu muốn rõ hơn
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#0077ff',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 11,
                }}
            />
        );
    };


    return (
        <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}>
                Bản đồ bãi đỗ xe với chỉ đường
            </h2>

            {/* Nút tìm đường */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <button
                    onClick={findPath}
                    disabled={loading}
                    style={{
                        padding: "12px 24px",
                        fontSize: "16px",
                        fontWeight: "600",
                        backgroundColor: loading ? "#9ca3af" : "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: loading ? "not-allowed" : "pointer",
                        transition: "all 0.3s"
                    }}
                >
                    {loading ? "Đang tìm đường..." : "Tìm đường đến chỗ đỗ"}
                </button>
            </div>

            {/* Map */}
            <div
                style={{
                    display: "grid",
                    gridTemplateRows: `repeat(${rows}, 1fr)`,
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    gap: "0px",
                    aspectRatio: `${cols} / ${rows}`,
                    width: "min(90vw, 800px)",
                    margin: "0 auto",
                    border: "2px solid #333",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                }}
            >
                {matrix.map((row, r) => row.map((_, c) => renderCell(r, c)))}
            </div>
            <style>{`
        .map-cell {
          width: 100%;
          height: 100%;
          border: 0.2px solid rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;  
          margin: 0 auto;
          display: grid;
          grid-gap: 0px;
          aspect-ratio: 16 / 9;
        }
        .cell-0 { background-color: #cfcfcf; }
        .cell-1 { background-color: #8bc34a; }
        .cell-2, .cell-3, .cell-8 { background-color: #1f2937; }
        .cell-sensor { background-color: #34d399; border: 0px solid #059669; }
        .cell-sensor-main { background-color: #10b981; border: 0px solid #047857; }
        .cell-start { background-color: #ffcc00 !important; border: 0px solid #29323e !important; }
        .cell-goal { background-color: #cfcfcf !important; border: 0px solid #b91c1c !important; }
      `}</style>
        </div>
    );
}