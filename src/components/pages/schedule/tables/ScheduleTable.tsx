"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

const ScheduleTable = ({
  initialData,
  routes,
}: {
  initialData: Awaited<
    ReturnType<(typeof serverApi)["schedule"]["getAll"]["query"]>
  >;
  routes: Awaited<ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>>;
}) => {
  const getSchedule = clientApi.schedule.getAll.useQuery(undefined, {
    initialData: initialData,
  });
  const getRoutes = clientApi.route.getAll.useQuery(undefined, {
    initialData: routes,
  });

  const columns: ColumnDef<
    Awaited<ReturnType<(typeof serverApi)["schedule"]["getAll"]["query"]>>[0]
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
      accessorKey: "plate_Number",
      header: "Plate Number",
      accessorFn: (row) => `${row.plate_number}`,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "destination",
      header: "Destination",
      accessorFn: (row) => `${row.route.destination_name}`,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "creator",
      header: "Creator",
      cell: ({ row }) => {
        return (
          <div>
            {row.original.creator?.first_name +
              " " +
              row.original.creator?.last_name}
          </div>
        );
      },
    },
  ];
  return (
    <DataTable
      columns={columns}
      data={getSchedule.data || []}
      DrawerTrigger={{
        data: {
          trigger: "schedule",
          routes: getRoutes.data || [],
        },
      }}
    />
  );
};

export default ScheduleTable;
