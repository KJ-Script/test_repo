"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import React from "react";
import AcceptTicketerRequestDialogue from "../dialogues/AcceptTicketerRequestDialogue ";
import RejectTicketerRequestDialogue from "../dialogues/RejectTicketerRequestDialog";

const TicketerRequestsTable = ({
  initialData,
}: {
  initialData: Awaited<
    ReturnType<
      (typeof serverApi)["transaction"]["requestsForSpecificCashier"]["query"]
    >
  >;
}) => {
  const getCashierRequestHistory =
    clientApi.transaction.requestsForSpecificCashier.useQuery(undefined, {
      initialData: initialData,
    });

  const requestHistory = getCashierRequestHistory.data
    ? getCashierRequestHistory.data.sort((a, b) => b.id - a.id)
    : [];
  const columns: ColumnDef<
    Awaited<
      ReturnType<
        (typeof serverApi)["transaction"]["requestsForSpecificCashier"]["query"]
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
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div>
            {row.original.status == "PENDING" && (
              <div className="mr-3 flex gap-5">
                <AcceptTicketerRequestDialogue request={row.original} />
                <RejectTicketerRequestDialogue request={row.original} />
              </div>
            )}
          </div>
        );
      },
    },
  ];
  return (
    <DataTable
      columns={columns}
      data={requestHistory || []}
      DrawerTrigger={null}
    />
  );
};

export default TicketerRequestsTable;
