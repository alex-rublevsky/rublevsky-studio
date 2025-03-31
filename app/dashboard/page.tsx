"use client";

import { ChartAreaInteractive } from "@/components/ui/admin/chart-area-interactive";
import { DataTable } from "@/components/ui/admin/data-table";
import { SectionCards } from "@/components/ui/admin/section-cards";

import data from "./data.json";

export default function DashboardPage() {
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  );
}
