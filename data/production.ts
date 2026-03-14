import type { ProductionLog } from "@/types";

export const productionLogs: ProductionLog[] = [
  { id: "PRD-LOG-001", date: "2024-03-13", flavor: "Vanilla", quantity: 200, batchNumber: "BCH-2024-0313-V01", notes: "Morning batch", createdAt: "2024-03-13T06:00:00" },
  { id: "PRD-LOG-002", date: "2024-03-13", flavor: "Chocolate", quantity: 150, batchNumber: "BCH-2024-0313-C01", notes: "", createdAt: "2024-03-13T08:30:00" },
  { id: "PRD-LOG-003", date: "2024-03-12", flavor: "Strawberry", quantity: 180, batchNumber: "BCH-2024-0312-S01", notes: "Peak season", createdAt: "2024-03-12T07:00:00" },
  { id: "PRD-LOG-004", date: "2024-03-12", flavor: "Mango", quantity: 120, batchNumber: "BCH-2024-0312-M01", notes: "", createdAt: "2024-03-12T10:00:00" },
  { id: "PRD-LOG-005", date: "2024-03-11", flavor: "Butterscotch", quantity: 100, batchNumber: "BCH-2024-0311-B01", notes: "Family pack batch", createdAt: "2024-03-11T09:00:00" },
];
