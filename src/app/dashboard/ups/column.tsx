"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

type Tracking = {
  id: string;
  name: string;
  trackingNumber: string;
  createdAt: string;
  trackingData?: any;
};

export const columns: ColumnDef<Tracking>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 20,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "trackingNumber",
    header: "Tracking Number",
  },
  {
    accessorKey: "trackingData",
    header: "Status",
    cell: ({ row }) => {
      const statusText =
        row.original.trackingData?.trackResponse?.shipment?.[0]?.package?.[0]
          ?.activity?.[0]?.status?.description || "N/A";

      const normalizedStatus = statusText.toUpperCase();
      const statusClass =
        normalizedStatus.trim() === "DELIVERED"
          ? "text-green-600 font-bold"
          : "";

      return <span className={statusClass}>{statusText}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ getValue }) =>
      new Date(getValue<string>()).toLocaleString(),
  },
];