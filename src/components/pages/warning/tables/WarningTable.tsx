"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "../filter/DateRange";
import { subDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PlateCountItem } from "@/server/api/routers/schedule";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const WarningTable = ({
  initialData,
  session,
  route,
}: {
  initialData: PlateCountItem[];
  session: any;
  route: Awaited<ReturnType<(typeof serverApi)["route"]["getAll"]["query"]>>;
}) => {
  const [routeId, setRouteId] = useState(route[0]?.id);
  const getStations = clientApi.station.getAll.useQuery();
  const [stationId, setStationId] = useState(session?.user?.image?.station?.id);
  const [date, setDate] = useState<DateRange | undefined>({
    //@ts-ignore
    from: subDays(new Date(Date.now()), 1),
    to: new Date(Date.now()),
  });
  const getRoutes = session?.user?.image?.role?.privileges.includes(
    "ViewRegionalAnalytics"
  )
    ? clientApi.route.getRouteForStation.useQuery({ station_id: stationId })
    : clientApi.route.getAll.useQuery(undefined, {
        initialData: route,
      });
  const routeData = getRoutes.data ? getRoutes.data : [];
  //@ts-ignore
  const getWarningForStation = clientApi.schedule.getWarningPerRoute.useQuery(
    {
      //@ts-ignore
      from: date?.from,
      //@ts-ignore
      to: date?.to,
      route_id: Number(routeId),
      station_id: stationId,
    },
    {
      initialData,
    }
  );

  const exportPdf = () => {
    const header = [["Plate Number", "Missed Days"]];
    const data = getWarningForStation.data.map((v) => [
      v.plate_number,
      v.count,
    ]);

    console.log(data);

    const doc = new jsPDF();
    autoTable(doc, {
      head: header,
      //@ts-ignore
      body: data,
    });
    doc.save(`warning.pdf`);
  };

  // Table columns
  const columns: ColumnDef<PlateCountItem>[] = useMemo(
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
        accessorKey: "plate_number",
        header: "Plate Number",
        accessorFn: (row) => row.plate_number,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "days_missed",
        header: "Days missed",
        accessorFn: (row) => row.count,
        cell: (info) => info.getValue(),
      },
    ],
    [routeId]
  );

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 justify-between items-end">
        <div className="col-span-4 flex gap-2 md:col-span-1">
          {session?.user?.image?.role?.privileges.includes(
            "ViewRegionalAnalytics"
          ) && (
            <div className="flex-1">
              <Label>Station</Label>
              <Select
                onValueChange={(value) => {
                  setStationId(Number(value));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Station" />
                </SelectTrigger>
                <SelectContent>
                  {getStations?.data?.map((station) => {
                    if (
                      station.region !== session?.user?.image?.station?.region
                    ) {
                      return;
                    }
                    return (
                      <SelectItem value={String(station.id)} key={station.id}>
                        {station.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex-1">
            <Label>Destination</Label>
            <Select
              onValueChange={(value) => {
                setRouteId(Number(value));
              }}
              defaultValue={route[0] && route[0].id + ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose route" />
              </SelectTrigger>
              <SelectContent>
                {routeData.map((route) => (
                  <SelectItem value={String(route.id)} key={route.id}>
                    {route.destination_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="md:justify-self-end col-span-4 md:col-span-3">
          <div className="flex items-end gap-2">
            <DatePickerWithRange date={date} setDate={setDate} />
            <Button onClick={exportPdf}>Export</Button>
          </div>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={getWarningForStation?.data || []}
        DrawerTrigger="warning"
      />
    </div>
  );
};

export default WarningTable;
