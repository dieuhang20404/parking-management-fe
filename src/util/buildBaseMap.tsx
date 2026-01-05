// utils/buildBaseMap.ts
import { PARKING_LAYOUT, SLOT_INDEX } from "../util/board";

export type Cell = {
    type: "slot" | "road" | "entrance" | "exit" | "wall";
    id?: number;
    status?: number; // 0: trống, 1: có xe, 2: khóa
    isPath?: boolean;
};


export const buildBaseMap = (): Cell[][] => {
    const slotMap = new Map<string, number>();
    SLOT_INDEX.forEach(s => {
        slotMap.set(`${s.r}-${s.c}`, s.id);
    });

    return PARKING_LAYOUT.map((row, r) =>
        row.map((cell, c) => {
            if (cell === 2) return { type: "wall" };
            if (cell === 0) return { type: "road" };
            if (cell === 1) {
                return {
                    type: "slot",
                    id: slotMap.get(`${r}-${c}`),
                    status: 0,
                };
            }
            return { type: "road" };
        })
    );
};
