"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import DeleteFromQueueDialogue from "../dialogues/DeleteRoleDialogue";
import DeleteRoleDialogue from "../dialogues/DeleteRoleDialogue";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import EditRoleDrawer from "../drawers/EditRoleDrawer";

const RoleTable = ({
  initialData,
}: {
  initialData: Awaited<
    ReturnType<(typeof serverApi)["role"]["getAll"]["query"]>
  >;
}) => {
  const getRoles = clientApi.role.getAll.useQuery(undefined, {
    initialData: initialData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const [rowForEnable, setRowForEnable] = useState<number | null>(null);
  const [rowForCheckout, setRowForCheckout] = useState<number | null>(null);

  const columns: ColumnDef<
    Awaited<ReturnType<(typeof serverApi)["role"]["getAll"]["query"]>>[0]
  >[] = useMemo(
    () => [
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
        accessorKey: "name",
        header: "Role Name",
        accessorFn: (row) => row.name,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "privileges",
        header: "Privileges",
        accessorFn: (row) => row.privileges.join(", "),
        cell: ({ row }) => {
          return (
            <div className="max-w-[60vw] break-all">
              <p className="flex w-full flex-wrap gap-1">
                {row.original.privileges.map((privilege) => (
                  <div className="p-2 border rounded-lg">{privilege}</div>
                ))}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: "creator",
        header: "Creator",
        accessorFn: (row) =>
          `${row.creator?.first_name + " " + row.creator?.last_name}`,
        cell: (info) => info.getValue(),
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <div className=" mr-3 flex gap-5">
              <EditRoleDrawer role={row.original} />
              <DeleteRoleDialogue role={row.original} />
            </div>
          );
        },
      },
    ],
    []
  );
  return (
    <DataTable
      columns={columns}
      data={getRoles.data || []}
      DrawerTrigger="role"
    />
  );
};

export default RoleTable;
