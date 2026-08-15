import type { AppointmentStatus } from "@/types";

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  Waiting: "bg-blue-50 text-blue-700",
  Serving: "bg-amber-50 text-amber-700",
  Done: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
  "No Show": "bg-slate-100 text-slate-500",
};

export const APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "Waiting",
  "Serving",
  "Done",
  "Cancelled",
  "No Show",
];
