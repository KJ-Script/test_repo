"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";
import EditProviderDrawer from "../drawers/EditRouteDrawer";
import DeleteProviderDialogue from "../dialogues/DeleteRouteDialogue";
import EditRouteDrawer from "../drawers/EditRouteDrawer";

const RouteTable = ({
  initialData,
  session,
}: {
  initialData: Awaited<
    ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>
  >;
  session: any;
}) => {
  const getProviders = clientApi.route.getAll.useQuery(undefined, {
    initialData: initialData,
  });
  const columns: ColumnDef<
    Awaited<ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>>[0]
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
          accessorKey: "route_name",
          header: "Destination Name",
          accessorFn: (row) => row.destination_name,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "destination_region",
          header: "Destination Region",
          accessorFn: (row) => row.destination_region,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "distance",
          header: "Distance",
          accessorFn: (row) => row.destination_region,
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
                <EditRouteDrawer route={row.original} />
                <DeleteProviderDialogue route={row.original} />
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
          accessorKey: "station_name",
          header: "Station Name",
          accessorFn: (row) => row.station.name,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "route_name",
          header: "Destination Name",
          accessorFn: (row) => row.destination_name,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "destination_region",
          header: "Destination Region",
          accessorFn: (row) => row.destination_region,
          cell: (info) => info.getValue(),
        },
        {
          accessorKey: "distance",
          header: "Distance",
          accessorFn: (row) => row.distance + " Km",
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
          ? "route"
          : ""
      }
    />
  );
};

export default RouteTable;
