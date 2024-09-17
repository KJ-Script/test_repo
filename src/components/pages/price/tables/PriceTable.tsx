"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import EditUserDrawer from "../drawers/EditPriceDrawer";
import DeleteUserDialogue from "../dialogues/DeletePriceDialogue";
import EditVehicleDrawer from "../drawers/EditPriceDrawer";
import EditPriceDrawer from "../drawers/EditPriceDrawer";

const PriceTable = ({
  initialData,
  session,
}: {
  initialData: Awaited<
    ReturnType<(typeof serverApi)["price"]["getAll"]["query"]>
  >;
  session: any;
}) => {
  const getPrices = clientApi.price.getAll.useQuery(undefined, {
    initialData: initialData,
  });
  const columns: ColumnDef<
    Awaited<ReturnType<(typeof serverApi)["price"]["getAll"]["query"]>>[0]
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
          accessorKey: "total",
          header: "Total Price",
          accessorFn: (row) => row.total_price,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "price",
          header: "Tariff",
          accessorFn: (row) => row.price,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "service_charge",
          header: "Service Charge",
          accessorFn: (row) => row.service_charge,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "destination",
          header: "Destination",
          accessorFn: (row) => row.route.destination_name,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "vehicle_level",
          header: "Vehicle Level",
          accessorFn: (row) => row.vehicle_level.name,
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
          id: "actions",
          header: "Actions",
          enableHiding: false,
          cell: ({ row }) => {
            return (
              <div className="mr-3 flex gap-5">
                <Button size="sm" className="p-0"></Button>
                <EditPriceDrawer price={row.original} session={session} />
                <DeleteUserDialogue price={row.original} />
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
          accessorKey: "station",
          header: "Station",
          accessorFn: (row) => row.station.name,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "service_charge",
          header: "Service Charge",
          accessorFn: (row) => row.service_charge,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "destination",
          header: "Destination",
          accessorFn: (row) => row.route.destination_name,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "price",
          header: "Tariff",
          accessorFn: (row) => row.price,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "vehicle_level",
          header: "Vehicle Level",
          accessorFn: (row) => row.vehicle_level.name,
          cell: (info) => info.getValue(),
        },
        {
          id: "actions",
          header: "Actions",
          enableHiding: false,
          cell: ({ row }) => {
            return <div className="mr-3 flex gap-5"></div>;
          },
        },
      ];
  return (
    <DataTable
      columns={columns}
      data={getPrices.data || []}
      DrawerTrigger={{
        data: {
          trigger: !session?.user?.image?.role?.privileges.includes(
            "ViewRegionalAnalytics"
          )
            ? "price"
            : "",
        },
      }}
    />
  );
};

export default PriceTable;
