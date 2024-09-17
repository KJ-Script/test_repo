"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import React, { useMemo, useState } from "react";
import { CalendarIcon, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { DateRange } from "react-day-picker";
import { subDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EthDateTime } from "ethiopian-calendar-date-converter";
import { addLeadingZero } from "../../queue/tickets/PassengerTicket";
import QueueTableSkeleton from "../../queue/sekeletons/QueueTableSkeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, filterDateValues, getFormattedDate } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FilterDateKey } from "../../analytics/stations/components/StationAnalyticsCounts";
import StationsList from "@/app/(home)/analytics/vehicle-performance/_components/StationsList";

const JourneyHistoryTable = ({
  currentStation,
  type,
}: {
  type: string;
  currentStation: any;
}) => {
  const doc = new jsPDF();
  const [searchQuery, setSearchQuery] = useState<any>("");
  const [filterDate, setFilterDate] = useState<FilterDateKey>("today");
  const [openFilter, setOpenFilter] = useState(false);
  const [stationId, setStationId] = useState(
    type == "station" ? currentStation : 3 + ""
  );
  const [date, setDate] = useState<DateRange | undefined>({
    //@ts-ignore
    from: subDays(new Date(Date.now()), 1),
    //@ts-ignore
    to: new Date(),
  });

  //@ts-ignore
  const getHistoryQueue = clientApi.queue.getHistory.useQuery(
    {
      ...(filterDate == "interval" && {
        from: date?.from,
        to: date?.to,
      }),
      filter_type: filterDate,
      stationId: Number(stationId),
    },
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const vehicleCountMap = new Map();
  let history = getHistoryQueue.data ? getHistoryQueue.data : [];
  if (history.length) {
    history.forEach((item) => {
      const vehicleId = item.vehicle.id;
      vehicleCountMap.set(vehicleId, (vehicleCountMap.get(vehicleId) || 0) + 1);
    });

    // Add checkout_count field to each object in the array
    history.forEach((item) => {
      const vehicleId = item.vehicle.id;
      //@ts-ignore
      item.checkout_count = vehicleCountMap.get(vehicleId);
    });
  }
  const totalPassenger = getHistoryQueue.data
    ? getHistoryQueue.data.reduce(
        (acc, h) => acc + h.booked_seat_count || acc,
        0
      )
    : 0;
  let totalsInLevel = {};
  const totalsInLevelArray = getHistoryQueue.data
    ? getHistoryQueue.data.map((h) => {
        //@ts-ignore
        if (totalsInLevel[h.vehicle.level.name]) {
          //@ts-ignore
          totalsInLevel[h.vehicle.level.name].passengers += h.booked_seat_count;
          //@ts-ignore
          totalsInLevel[h.vehicle.level.name].vehicle += 1;
        } else {
          //@ts-ignore
          totalsInLevel[h.vehicle.level.name] = {};
          //@ts-ignore
          totalsInLevel[h.vehicle.level.name].passengers = h.booked_seat_count;
          //@ts-ignore
          totalsInLevel[h.vehicle.level.name].vehicle = 1;
        }
      })
    : 0;

  let vehiclesInLevel = {};

  const exportPdf = () => {
    const header = [
      [
        "Plate Number",
        "Station",
        "Destination",
        "Price",
        "Passengers",
        "Checkout Count",
        "Checkout Time",
      ],
    ];
    const data = getHistoryQueue?.data
      ?.filter(
        (d) =>
          d.vehicle.plate_number.startsWith(searchQuery) ||
          d.price.route.destination_name
            ?.toLowerCase()
            .startsWith(searchQuery?.toLowerCase())
      )
      .map((h) => [
        h.vehicle.plate_number,
        h.station.name,
        h.price.route.destination_name,
        h.price.price,
        h.booked_seat_count,
        //@ts-ignore
        h.checkout_count,
        addLeadingZero(
          EthDateTime.fromEuropeanDate(
            //@ts-ignore
            h?.created_at_app
              ? h.created_at_app
              : h?.paidTime
              ? h.paidTime?.created_at
              : h.created_at
          ).date
        ) +
          "-" +
          addLeadingZero(
            EthDateTime.fromEuropeanDate(
              //@ts-ignore
              h?.created_at_app
                ? h.created_at_app
                : h?.paidTime
                ? h.paidTime?.created_at
                : h.created_at
            ).month
          ) +
          "-" +
          addLeadingZero(
            EthDateTime.fromEuropeanDate(
              //@ts-ignore
              h?.created_at_app
                ? h.created_at_app
                : h?.paidTime
                ? h.paidTime?.created_at
                : h.created_at
            ).year
          ) +
          " " +
          addLeadingZero(
            Number(
              EthDateTime.fromEuropeanDate(
                //@ts-ignore
                h?.created_at_app
                  ? h.created_at_app
                  : h?.paidTime
                  ? h.paidTime?.created_at
                  : h.created_at
              ).hour
            ) -
              6 ==
              0
              ? 12
              : Number(
                  EthDateTime.fromEuropeanDate(
                    //@ts-ignore
                    h?.created_at_app
                      ? h.created_at_app
                      : h?.paidTime
                      ? h.paidTime?.created_at
                      : h.created_at
                  ).hour
                ) -
                  6 <
                0
              ? Math.abs(
                  Number(
                    EthDateTime.fromEuropeanDate(
                      //@ts-ignore
                      h?.created_at_app
                        ? h.created_at_app
                        : h?.paidTime
                        ? h.paidTime?.created_at
                        : h.created_at
                    ).hour
                  ) -
                    6 +
                    12
                )
              : Math.abs(
                  Number(
                    EthDateTime.fromEuropeanDate(
                      //@ts-ignore
                      h?.created_at_app
                        ? h.created_at_app
                        : h?.paidTime
                        ? h.paidTime?.created_at
                        : h.created_at
                    ).hour
                  ) - 6
                )
          ) +
          ":" +
          addLeadingZero(
            EthDateTime.fromEuropeanDate(
              //@ts-ignore
              //@ts-ignore
              h?.created_at_app
                ? h.created_at_app
                : h?.paidTime
                ? h.paidTime?.created_at
                : h.created_at
            ).minute
          ) +
          `${
            Number(
              EthDateTime.fromEuropeanDate(
                //@ts-ignore
                //@ts-ignore
                h?.created_at_app
                  ? h.created_at_app
                  : h?.paidTime
                  ? h.paidTime?.created_at
                  : h.created_at
              ).hour
            ) -
              6 <=
            0
              ? " Morning"
              : ""
          }`,
      ]);

    autoTable(doc, {
      head: header,
      //@ts-ignore
      body: data,
    });
    if (!date?.from || !date?.to) {
      //@ts-ignore
      doc.save(`Journey_History_from_${filterDateValues[filterDate]}.pdf`);
      return;
    }
    const startD = `${date.from?.getFullYear()}-${
      date.from?.getMonth()! + 1
    }-${date.from?.getDate()}`;
    const endD = `${date.to?.getFullYear()}-${
      date.to?.getMonth()! + 1
    }-${date.to?.getDate()}`;

    //@ts-ignore
    doc.save(`Journey_History-${startD}-to-${endD}.pdf`);
  };

  // Table columns
  const columns: ColumnDef<
    Awaited<ReturnType<(typeof serverApi)["queue"]["getHistory"]["query"]>>[0]
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
        accessorKey: "plate_number",
        header: "Plate Number",
        accessorFn: (row) => row.vehicle.plate_number,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "station",
        header: "Station",
        accessorFn: (row) => row.station.name,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "destination",
        header: "Destination",
        accessorFn: (row) => row.price.route.destination_name,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "price",
        header: "Price",
        accessorFn: (row) => row.price.price,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "booked_seats",
        header: "Booked Seats",
        accessorFn: (row) =>
          `${
            row.booked_seat_count
              ? row.booked_seat_count
              : row.vehicle.seat_capacity + "/" + row.vehicle.seat_capacity
          }`,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "checkout_time",
        header: "Checkout Time",
        accessorFn: (row) => {
          //@ts-ignore
          const today = EthDateTime.fromEuropeanDate(
            //@ts-ignore
            row?.created_at_app
              ? row.created_at_app
              : row?.paidTime
              ? row.paidTime?.created_at
              : row.created_at
          );
          const formattedDate =
            addLeadingZero(today.date) +
            "-" +
            addLeadingZero(today.month) +
            "-" +
            addLeadingZero(today.year) +
            " " +
            addLeadingZero(
              Number(today.hour) - 6 == 0
                ? 12
                : Number(today.hour) - 6 < 0
                ? Math.abs(Number(today.hour) - 6 + 12)
                : Math.abs(Number(today.hour) - 6)
            ) +
            ":" +
            addLeadingZero(today.minute) +
            `${Number(today.hour) - 6 <= 0 ? " Morning" : ""}`;

          return formattedDate;
        },
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "checkout_count",
        header: "Checkout count",
        //@ts-ignore
        accessorFn: (row) => `${row.checkout_count}`,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "checked_out",
        header: "Checked Out",
        cell: ({ row }) => {
          return (
            <div className="">
              {row.original.checked_out ? (
                <CheckCircle2 className="text-green-400" />
              ) : (
                <XCircle className="text-red-500" />
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="border rounded-t-2xl flex flex-col">
      <div>
        <div className="flex items-center p-3 justify-between border-b">
          <div className="text-xl font-bold">
            Total Passengers: {totalPassenger}
          </div>
          <div className="flex gap-2">
            {openFilter ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {
                            //@ts-ignore
                            format(date.from, "LLL dd, y")
                          }{" "}
                          -{" "}
                          {
                            //@ts-ignore
                            format(date.to, "LLL dd, y")
                          }
                        </>
                      ) : (
                        //@ts-ignore
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            ) : null}

            {type == "regional" ? (
              <StationsList stationId={stationId} setStationId={setStationId} />
            ) : null}
            <Select
              onValueChange={(value: FilterDateKey) => {
                if (value == "interval") {
                  setOpenFilter(true);
                } else {
                  setOpenFilter(false);
                }
                setFilterDate(value);
              }}
              defaultValue={"today"}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Date</SelectLabel>
                  <SelectItem value={"today"}>Today</SelectItem>
                  <SelectItem value={"this-week"}>Weekly</SelectItem>
                  <SelectItem value={"this-month"}>Monthly</SelectItem>
                  <SelectItem value={"this-year"}>Yearly</SelectItem>
                  <SelectItem value={"interval"}>Interval</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button onClick={exportPdf}>Export</Button>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3">
          <div className="grid grid-cols-8 gap-1">
            {Object.keys(totalsInLevel).map((key) => (
              <div className="flex gap-1 border rounded-md p-2">
                <p className="text-sm text-primary font-bold">{key}: </p>
                <p className="text-sm font-bold">
                  {
                    //@ts-ignore
                    totalsInLevel[key].passengers +
                      "/" +
                      //@ts-ignore
                      totalsInLevel[key].vehicle
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-3 -mt-4">
        {getHistoryQueue.isLoading ? (
          <QueueTableSkeleton />
        ) : (
          <DataTable
            columns={columns}
            data={history}
            DrawerTrigger={{
              trigger: "journey-history",
              searchQuery,
              setSearchQuery,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default JourneyHistoryTable;
