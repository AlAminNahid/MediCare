"use client";

import { useRef } from "react";
import { Building2, Calendar, Pencil, Printer } from "lucide-react";
import type { Prescription } from "@/types";

export default function PrescriptionSlip({
  rx,
  onEdit,
}: {
  rx: Prescription;
  onEdit?: () => void;
}) {
  const degrees = Array.isArray(rx.doctor?.degrees)
    ? rx.doctor.degrees.map((d) => d.degree).join(", ")
    : "";
  const slipRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    slipRef.current?.classList.add("rx-print-target");
    document.body.classList.add("printing-rx");
    const cleanup = () => {
      document.body.classList.remove("printing-rx");
      slipRef.current?.classList.remove("rx-print-target");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  };

  return (
    <div
      ref={slipRef}
      className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden print:shadow-none print:border-0"
    >
      {/* Header — mimics prescription letterhead */}
      <div className="border-b-2 border-indigo-600 bg-indigo-600 px-6 py-5 text-white print:bg-white print:text-slate-900 print:border-slate-900">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-bold">{rx.doctor?.fullName}</p>
            {degrees && (
              <p className="mt-0.5 text-sm text-indigo-200 print:text-slate-600">
                {degrees}
              </p>
            )}
            {rx.doctor?.specialization && (
              <p className="mt-0.5 text-sm text-indigo-200 print:text-slate-600">
                {rx.doctor.specialization}
              </p>
            )}
          </div>
          <div className="text-right">
            {rx.chamber && (
              <>
                <p className="flex items-center justify-end gap-1.5 font-semibold">
                  <Building2 className="h-4 w-4" />
                  {rx.chamber.name}
                </p>
                <p className="mt-0.5 text-sm text-indigo-200 print:text-slate-600">
                  {rx.chamber.address}
                </p>
              </>
            )}
            <p className="mt-1 flex items-center justify-end gap-1.5 text-sm text-indigo-200 print:text-slate-600">
              <Calendar className="h-3.5 w-3.5" />
              {rx.date}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Patient info */}
        <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-1 border-b border-slate-100 pb-4 text-sm text-slate-600">
          <span>
            <span className="font-semibold text-slate-900">Patient: </span>
            {rx.patient?.fullName}
          </span>
          {rx.patient?.age !== undefined && (
            <span>
              <span className="font-semibold text-slate-900">Age: </span>
              {rx.patient.age}
            </span>
          )}
          {rx.patient?.gender && (
            <span>
              <span className="font-semibold text-slate-900">Gender: </span>
              {rx.patient.gender}
            </span>
          )}
        </div>

        {/* Diagnosis */}
        {rx.diagnosis && (
          <div className="mb-4 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Diagnosis: </span>
            {rx.diagnosis}
          </div>
        )}

        {/* Medicines */}
        <div className="mb-4">
          <p className="mb-2 text-lg font-semibold text-indigo-600">℞</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="w-8 pb-2">#</th>
                <th className="pb-2">Medicine</th>
                <th className="pb-2">Dosage</th>
                <th className="pb-2">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rx.medicines?.map((m, i) => (
                <tr key={i}>
                  <td className="py-2 text-slate-400">{i + 1}</td>
                  <td className="py-2 font-medium text-slate-900">
                    {m.medicineName}
                  </td>
                  <td className="py-2 text-slate-600">{m.dosage}</td>
                  <td className="py-2 text-slate-600">{m.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tests advised */}
        {rx.tests && rx.tests.length > 0 && (
          <div className="mb-4 text-sm text-slate-700">
            <p className="mb-1 font-semibold text-slate-900">Tests Advised:</p>
            <ul className="list-inside list-disc space-y-0.5 text-slate-600">
              {rx.tests.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Advice */}
        {rx.notes && (
          <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-slate-700 print:border-slate-300 print:bg-white">
            <span className="font-semibold text-amber-800 print:text-slate-900">
              Advice:{" "}
            </span>
            {rx.notes}
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2 print:hidden">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </button>
        </div>
      </div>
    </div>
  );
}
