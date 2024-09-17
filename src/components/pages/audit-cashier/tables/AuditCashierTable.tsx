"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import AuditTicketerDialog from "../dialogues/AuditCashierDialog";
import AuditCashierDialog from "../dialogues/AuditCashierDialog";

const AuditCashierTable = ({
  initialData,
}: {
  initialData: Awaited<
    ReturnType<
      (typeof serverApi)["transaction"]["auditCashierDailyHistory"]["query"]
    >
  >;
}) => {
  const getCashierRequestHistory =
    clientApi.transaction.auditCashierDailyHistory.useQuery(undefined, {
      initialData: initialData,
    });

  const columns: ColumnDef<any>[] = [
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
      accessorKey: "cashier",
      header: "Cashier",
      accessorFn: (row) => row.cashier.email,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "debt",
      header: "Debt",
      accessorFn: (row) => row?.debt?.toFixed(2),
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "paid",
      header: "Paid to driver",
      accessorFn: (row) => row?.paid?.toFixed(2),
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
            {!row.original.audited && (
              <div className="mr-3 flex gap-5">
                <AuditCashierDialog audit={row.original} />
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
      data={getCashierRequestHistory.data || []}
      DrawerTrigger={null}
    />
  );
};

export default AuditCashierTable;
