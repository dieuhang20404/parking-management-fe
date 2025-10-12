import { useEffect, useState } from "react";
import { Card } from "antd";
import { getSlots } from "../api/api";

export default function Parking() {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    getSlots().then(setSlots);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-4 p-6">
      {slots.map((s: any) => (
        <Card key={s.id} className={s.isTaken ? "bg-red-200" : "bg-green-200"}>
          {s.slotCode}
        </Card>
      ))}
    </div>
  );
}
