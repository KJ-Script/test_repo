"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import DeleteUserDialogue from "../dialogues/DeleteVehicleDialogue";
import EditVehicleDrawer from "../drawers/EditVehicleDrawer";

const VehicleTable = ({
  initialData,
  session,
}: {
  initialData: Awaited<
    ReturnType<(typeof serverApi)["vehicle"]["getAll"]["query"]>
  >;
  session: any;
}) => {
  const getVehicles = clientApi.vehicle.getAll.useQuery(undefined, {
    initialData: initialData,
  });

  const columns: ColumnDef<
    Awaited<ReturnType<(typeof serverApi)["vehicle"]["getAll"]["query"]>>[0]
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
          accessorKey: "plate_number",
          header: "Plate Number",
          accessorFn: (row) => `${row.plate_number + "-" + row.region}`,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "seat_capacity",
          header: "Seat Capacity",
          accessorFn: (row) => row.seat_capacity,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "level",
          header: "Level",
          accessorFn: (row) => row.level.name,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "provider",
          header: "Provider",
          accessorFn: (row) => `${row.provider.name}`,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "creator",
          header: "Creator",
          accessorFn: (row) =>
            `${row.creator?.first_name + " " + row.creator?.last_name}`,
          cell: (info) => info.getValue(),
        },

        {
          accessorKey: "side_number",
          header: "Side Number",
          accessorFn: (row) => row.side_number,
          cell: (info) => info.getValue(),
        },

        {
          id: "actions",
          header: "Actions",
          enableHiding: false,
          cell: ({ row }) => {
            return (
              <div className=" mr-3 flex gap-5">
                <EditVehicleDrawer vehicle={row.original} />
                <DeleteUserDialogue vehicle={row.original} />
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
          accessorKey: "plate_number",
          header: "Plate Number",
          accessorFn: (row) => `${row.plate_number + "-" + row.region}`,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "seat_capacity",
          header: "Seat Capacity",
          accessorFn: (row) => row.seat_capacity,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "level",
          header: "Level",
          accessorFn: (row) => row.level.name,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "provider",
          header: "Provider",
          accessorFn: (row) => `${row.provider.name}`,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "side_number",
          header: "Side Number",
          accessorFn: (row) => row.side_number,
          cell: (info) => info.getValue(),
        },
      ];
  return (
    <DataTable
      columns={columns}
      data={getVehicles.data || []}
      DrawerTrigger={{
        data: {
          trigger: !session?.user?.image?.role?.privileges.includes(
            "ViewRegionalAnalytics"
          )
            ? "vehicle"
            : "",
        },
      }}
    />
  );
};

export default VehicleTable;
