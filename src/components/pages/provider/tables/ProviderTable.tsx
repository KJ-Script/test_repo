"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import EditProviderDrawer from "../drawers/EditProviderDrawer";
import DeleteProviderDialogue from "../dialogues/DeleteProviderDialogue";

const ProviderTable = ({
  initialData,
  session,
}: {
  initialData: Awaited<
    ReturnType<(typeof serverApi)["provider"]["getAll"]["query"]>
  >;
  session: any;
}) => {
  const getProviders = clientApi.provider.getAll.useQuery(undefined, {
    initialData: initialData,
  });
  const columns: ColumnDef<
    Awaited<ReturnType<(typeof serverApi)["provider"]["getAll"]["query"]>>[0]
  >[] = !session?.user?.image?.role?.privileges.includes(
    "ViewRegionalAnalytics"
  )
    ? [
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
          header: "Provider Name",
          accessorFn: (row) => row.name,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "region",
          header: "Region",
          accessorFn: (row) => row.region,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "phone_number",
          header: "Phone Number",
          accessorFn: (row) => row.phone_number,
          cell: (info) => info.getValue(),
        },
        {
          id: "actions",
          enableHiding: false,
          cell: ({ row }) => {
            return (
              <div className=" mr-3 flex gap-5">
                <Button
                  size="sm"
                  // disabled={
                  //   cur.enabled == 0 || cur.onBook.toLowerCase() != "booking"
                  // }
                  className="p-0"
                >
                  {/* <TicketDrawer queue={cur} /> */}
                </Button>
                <EditProviderDrawer provider={row.original} />
                <DeleteProviderDialogue provider={row.original} />
              </div>
            );
          },
        },
      ]
    : [
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
          header: "Provider Name",
          accessorFn: (row) => row.name,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "region",
          header: "Region",
          accessorFn: (row) => row.region,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "phone_number",
          header: "Phone Number",
          accessorFn: (row) => row.phone_number,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "creator",
          header: "Creator",
          accessorFn: (row) =>
            `${row.creator?.first_name + " " + row.creator?.last_name}`,
          cell: (info) => info.getValue(),
        },
      ];
  return (
    <DataTable
      columns={columns}
      data={getProviders.data || []}
      DrawerTrigger={
        !session?.user?.image?.role?.privileges.includes(
          "ViewRegionalAnalytics"
        )
          ? "provider"
          : ""
      }
    />
  );
};

export default ProviderTable;
