// src/components/ParkingMap.tsx
import React, { useEffect, useMemo, useState } from "react";
import boards from "../data/broads";
import "./ParkingMap.css";
import getRandomSensorSlots, { type Slot } from "../util/randomPosition";


type Props = {
  matrix?: number[][];
  sensorCount?: number;
  repStrategy?: "first" | "random" | "center";
};

export default function ParkingMap({
  matrix = boards,
  sensorCount = 5,
  repStrategy = "random",
}: Props) {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  // slots: mỗi slot có group[] và rep
  const [slots, setSlots] = useState<Slot[]>([]);

  // chỉ random 1 lần khi mount (nếu muốn refresh, expose function hoặc prop thay đổi)
  useEffect(() => {
    const s = getRandomSensorSlots(matrix, sensorCount, { strategy: repStrategy });
    setSlots(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only on mount

  // tập các toạ độ chính (rep) để lookup nhanh
  const repsSet = useMemo(() => {
    const set = new Set<string>();
    for (const s of slots) set.add(`${s.rep.x}-${s.rep.y}`);
    return set;
  }, [slots]);

  // map group cells to quick lookup (cell -> slotIndex) nếu cần
  const groupLookup = useMemo(() => {
    const map = new Map<string, number>();
    slots.forEach((slot, i) => {
      slot.group.forEach((cell) => map.set(`${cell.x}-${cell.y}`, i));
    });
    return map;
  }, [slots]);

  const isSensorMain = (r: number, c: number) => repsSet.has(`${r}-${c}`);
  const isSensorCell = (r: number, c: number) => groupLookup.has(`${r}-${c}`);

  // border gradients logic (kept) — memoized
  const borderGradients = useMemo(() => {
    const borders: Record<string, string> = {};
    const rowsLocal = rows;
    const colsLocal = cols;
    const slotTypes = [1, -1, -2];
    const cornerGradients: Record<number, string> = {
      6: "linear-gradient(to right, #cfcfcf 50%, transparent 50%), linear-gradient(to bottom, #cfcfcf 50%, transparent 50%)",
      7: "linear-gradient(to left, #cfcfcf 50%, transparent 50%), linear-gradient(to bottom, #cfcfcf 50%, transparent 50%)",
      4: "linear-gradient(to right, #cfcfcf 50%, transparent 50%), linear-gradient(to top, #cfcfcf 50%, transparent 50%)",
      5: "linear-gradient(to left, #cfcfcf 50%, transparent 50%), linear-gradient(to top, #cfcfcf 50%, transparent 50%)",
    };

    for (let r = 0; r < rowsLocal; r++) {
      for (let c = 0; c < colsLocal; c++) {
        const cell = matrix[r][c];
        if (cornerGradients[cell]) {
          borders[`${r}-${c}`] = cornerGradients[cell];
        }

        if (!slotTypes.includes(cell)) continue;

        const neighbors = {
          top: r > 0 ? matrix[r - 1][c] : null,
          bottom: r < rowsLocal - 1 ? matrix[r + 1][c] : null,
          left: c > 0 ? matrix[r][c - 1] : null,
          right: c < colsLocal - 1 ? matrix[r][c + 1] : null,
        };

        if (neighbors.top === 9)
          borders[`${r - 1}-${c}`] =
            "linear-gradient(to bottom, #cfcfcf 50%, transparent 50%)";
        if (neighbors.bottom === 9)
          borders[`${r + 1}-${c}`] =
            "linear-gradient(to top, #cfcfcf 50%, transparent 50%)";
        if (neighbors.left === 9)
          borders[`${r}-${c - 1}`] =
            "linear-gradient(to right, #cfcfcf 50%, transparent 50%)";
        if (neighbors.right === 9)
          borders[`${r}-${c + 1}`] =
            "linear-gradient(to left, #cfcfcf 50%, transparent 50%)";
      }
    }

    return borders;
  }, [matrix, rows, cols]);

  return (
    <div className="map-container">
      <h2 className="map-title">Bản đồ bãi đỗ xe</h2>
      {/* <div className="legend-box">
        <div className="legend-item">
          <span className="legend-color legend-empty" /> Ô trống
        </div>
        <div className="legend-item">
          <span className="legend-color legend-parked" /> Ô đang đỗ xe
        </div>
        <div className="legend-item">
          <span className="legend-color legend-sensor" /> Ô thuộc nhóm sensor
        </div>
        <div className="legend-item">
          <span className="legend-color legend-sensor-main" /> Sensor chính (ô đại diện)
        </div>
        <div className="legend-item">
          <span className="legend-color legend-path" /> Ô được chọn để tìm đường
        </div>
      </div> */}


      <div
        className="parking-map"
        style={
          {
            // CSS custom properties để grid sizing
            "--rows": rows,
            "--cols": cols,
          } as React.CSSProperties
        }
        aria-hidden={false}
      >
        {matrix.map((row, r) =>
          row.map((cellValue, c) => {
            const key = `${r}-${c}`;
            const gradient = borderGradients[key];

            const classes = ["map-cell"];
            if (isSensorCell(r, c)) {
              classes.push("cell-sensor");
              if (isSensorMain(r, c)) classes.push("cell-sensor-main");
            } else {
              classes.push(`cell-${cellValue}`);
            }

            const style: React.CSSProperties = {
              background: isSensorCell(r, c) ? undefined : gradient || undefined,
            };

            return <div key={key} className={classes.join(" ")} style={style} />;
          })
        )}
      </div>
    </div>
  );
}
