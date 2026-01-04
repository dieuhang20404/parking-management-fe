type PathPoint = { x: number; y: number };

type Props = {
    path: PathPoint[];
    show: boolean;
    rows: number;
    cols: number;
};

export default function PathOverlay({
                                        path,
                                        show,
                                        rows,
                                        cols,
                                    }: Props) {
    if (!show || path.length === 0) return null;

    return (
        <svg
            className="path-overlay"
            width={cols * 50}
            height={rows * 50}
        >
            <polyline
                points={path
                    .map(p => `${p.y * 50 + 25},${p.x * 50 + 25}`)
                    .join(" ")}
                stroke="red"
                strokeWidth="4"
                fill="none"
            />
        </svg>
    );
}
