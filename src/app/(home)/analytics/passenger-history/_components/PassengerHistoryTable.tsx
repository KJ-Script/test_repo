"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn, getFormattedDate } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import PassengerHistoryTableSkeleton from "./PassengerHistoryTableSkeleton";
import { EthDateTime } from "ethiopian-calendar-date-converter";
import { addLeadingZero } from "@/components/pages/queue/tickets/PassengerTicket";
import BookTicketDrawerNoModal from "@/components/pages/queue/drawers/BookTicketDrawerNoModal";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PassengerHistoryPdf from "./PassengerHistoryPdf";

const PassengerHistoryTable = ({ session }: { session: any }) => {
  const [date, setDate] = useState<Date>();
  const [queue, setQueue] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<any>("");
  const getPassengerHistory = clientApi.analytics.getPassengersHistory.useQuery(
    {
      date,
    }
  );
  const columns: ColumnDef<
    Awaited<
      ReturnType<
        (typeof serverApi)["analytics"]["getPassengersHistory"]["query"]
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
      accessorKey: "vehicle",
      header: "Vehicle",
      accessorFn: (row) => row.queue.vehicle.plate_number,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "ticketer",
      header: "Ticketer",
      accessorFn: (row) => row.creator.email,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "tickets",
      header: "Ticket Count",
      accessorFn: (row) => row.ticket_count,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "price",
      header: "Price",
      accessorFn: (row) => row.amount / row.ticket_count,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "passenger",
      header: "Passenger",
      accessorFn: (row) => row.passenger_detail || "",
      cell: (info) => info.getValue(),
    },

    {
      accessorKey: "date",
      header: "Date",
      accessorFn: (row) => {
        const today = EthDateTime.fromEuropeanDate(row.queue.created_at);
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
      id: "actions",
      header: "Actions",
      enableHiding: false,
      cell: ({ row }) => {
        return (
          <Button
            onClick={() => {
              setQueue({
                ...row.original.queue,
                ticket_date: row.original.created_at,
                passenger_name: row.original.passenger_detail,
              });
            }}
            variant="outline"
          >
            Reprint
          </Button>
        );
      },
    },
  ];
  return (
    <div>
      <BookTicketDrawerNoModal
        session={session}
        queue={queue}
        setQueue={setQueue}
        type="reprint"
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />

            {date ? (
              //@ts-ignore
              format(date, "PPP")
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            //@ts-ignore
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {getPassengerHistory?.data && (
        <PDFDownloadLink
          document={
            <PassengerHistoryPdf
              history={getPassengerHistory?.data?.filter(
                (d) =>
                  d.queue?.vehicle.plate_number.startsWith(searchQuery) ||
                  d.queue.price.route.destination_name
                    ?.toLowerCase()
                    .startsWith(searchQuery?.toLowerCase())
              )}
              date={date}
            />
          }
        >
          {({ blob, url, loading, error }) =>
            loading ? "Loading document..." : <Button>Export</Button>
          }
        </PDFDownloadLink>
      )}
      {getPassengerHistory.isLoading ? (
        <PassengerHistoryTableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={getPassengerHistory?.data || []}
          DrawerTrigger={{
            trigger: "",
            searchQuery,
            setSearchQuery,
          }}
        />
      )}
    </div>
  );
};
export default PassengerHistoryTable;
