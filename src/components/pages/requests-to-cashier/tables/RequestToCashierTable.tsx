"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import React from "react";

const RequestToCashierTable = ({
  initialData,
}: {
  initialData: Awaited<
    ReturnType<
      (typeof serverApi)["transaction"]["ticketerToCashierRequestHistory"]["query"]
    >
  >;
}) => {
  const getCashierRequestHistory =
    clientApi.transaction.ticketerToCashierRequestHistory.useQuery(undefined, {
      initialData: initialData,
    });
  const columns: ColumnDef<
    Awaited<
      ReturnType<
        (typeof serverApi)["transaction"]["ticketerToCashierRequestHistory"]["query"]
      >
    >[0]
  >[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value: any) =>
            table.toggleAllPageRowsSelected(!!value)
          }
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value: any) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "ticketer",
      header: "Ticketer",
      accessorFn: (row) => row.ticketer.email,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "type",
      header: "Request type",
      accessorFn: (row) => row.type,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      accessorFn: (row) => row.amount,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "cashier",
      header: "Cashier",
      accessorFn: (row) => row.cashier.email,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "status",
      header: "Status",
      accessorFn: (row) => row.status,
      cell: ({ row }) => (
        <p className="flex gap-2 items-center">
          {row.original.status}
          {row.original.status == "PENDING" ? (
            <CircleDashed className="text-blue-400" />
          ) : row.original.status == "ACCEPTED" ? (
            <CheckCircle2 className="text-green-400" />
          ) : (
            <XCircle className="text-red-500" />
          )}
        </p>
      ),
    },
  ];
  return (
    <DataTable
      columns={columns}
      data={getCashierRequestHistory.data || []}
      DrawerTrigger={null}
    />
  );
};

export default RequestToCashierTable;
