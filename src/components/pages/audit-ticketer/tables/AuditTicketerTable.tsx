"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import AuditTicketerDialog from "../dialogues/AuditTicketerDialog";

const AuditTicketerTable = ({
  initialData,
}: {
  initialData: Awaited<
    ReturnType<
      (typeof serverApi)["transaction"]["auditTicketerDailyHistory"]["query"]
    >
  >;
}) => {
  const getCashierRequestHistory =
    clientApi.transaction.auditTicketerDailyHistory.useQuery(undefined, {
      initialData: initialData,
      refetchInterval: 5000,
    });
  const columns: ColumnDef<
    Awaited<
      ReturnType<
        (typeof serverApi)["transaction"]["auditTicketerDailyHistory"]["query"]
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
      accessorKey: "book",
      header: "Book",
      accessorFn: (row) => row.book,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "reprint",
      header: "Reprint",
      accessorFn: (row) => row.reprint,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "extra",
      header: "Extra",
      accessorFn: (row) => row.extra,
      cell: (info) => info.getValue(),
    },

    {
      accessorKey: "returnedCash",
      header: "Returned Cash",
      accessorFn: (row) => row.returnedCash,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "returnedTicket",
      header: "Returned Ticket",
      accessorFn: (row) => row.returnedTicket,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      accessorFn: (row) => row.balance?.toFixed(2),
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div>
            <div className="mr-3 flex gap-5">
              <AuditTicketerDialog audit={row.original} />
            </div>
          </div>
        );
      },
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

export default AuditTicketerTable;
