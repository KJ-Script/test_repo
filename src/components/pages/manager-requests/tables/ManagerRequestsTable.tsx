"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, getDate, getYYYYMMDD } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapIcon } from "lucide-react";
import { format, toDate, startOfDay, subDays } from "date-fns";
import ManagerRequestTableSkeleton from "../sekeletons/ManagerRequestTableSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const ManagerRequestsTable = () => {
  //@ts-ignore
  const [date, setDate] = useState<Date>();
  const getManagerRequests = clientApi.transaction.getManagerRequests.useQuery(
    {
      date,
    },
    {
      refetchOnMount: true,
    }
  );
  const columns: ColumnDef<
    Awaited<
      ReturnType<
        (typeof serverApi)["transaction"]["getManagerRequests"]["query"]
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
      accessorKey: "station",
      header: "Station",
      accessorFn: (row) => row?.station,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "manager",
      header: "Manager",
      accessorFn: (row) => row?.manager,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "amount",
      header: "Request Amount",
      accessorFn: (row) => row?.amount,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "earning",
      header: "Earning",
      accessorFn: (row) => row?.earning,
      cell: (info) => info.getValue(),
    },
    {
      accessorKey: "date",
      header: "Date",
      accessorFn: (row) => getYYYYMMDD(date || new Date()),
      cell: (info) => info.getValue(),
    },
  ];

  if (getManagerRequests.isLoading) {
    return <ManagerRequestTableSkeleton />;
  }

  const total = getManagerRequests?.data
    ? getManagerRequests?.data
        .map((s) => s.earning)
        .reduce((acc, cur) => {
          if (cur >= 0) return acc + cur;
          else return acc;
        }, 0)
    : 0;

  const actual = getManagerRequests?.data
    ? getManagerRequests?.data
        .map((s) => s.amount)
        .reduce((acc, cur) => {
          if (cur >= 0) return acc + cur;
          else return acc;
        }, 0)
    : 0;

  let regionalEarningActual = getManagerRequests?.data
    ? getManagerRequests.data.reduce((acc: any, obj) => {
        const key = obj["region"];
        acc[key] = (acc[key] || 0) + obj["amount"];
        return acc;
      }, {})
    : [];

  let regionalEarningExpected = getManagerRequests?.data
    ? getManagerRequests.data.reduce((acc: any, obj) => {
        const key = obj["region"];
        acc[key] = (acc[key] || 0) + obj["earning"];
        return acc;
      }, {})
    : [];

  console.log(regionalEarningActual);

  return (
    <div>
      <div className="flex md:flex-row flex-col md:h-32 mb-5  md:items-end justify-between">
        <div>
          <div className="my-3">
            Expected Earning:&nbsp;
            {total?.toFixed(2)}
          </div>
          <div className="flex gap-3 my-3">
            {regionalEarningExpected &&
              Object.keys(regionalEarningExpected).map((r) => (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <MapIcon />
                      <div className="flex flex-col">
                        <span className="font-bold">
                          {regionalEarningExpected[r]?.toFixed(2)}
                        </span>
                        <span className="text-gray-500"> {r}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
        <Separator orientation="vertical" className="h-full" />
        <div>
          <div className="mb-3">
            Actual Earning:&nbsp;
            {actual?.toFixed(2)}
          </div>
          <div className="flex gap-3 my-3">
            {regionalEarningActual &&
              Object.keys(regionalEarningActual).map((r) => (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <MapIcon />
                      <div className="flex flex-col">
                        <span className="font-bold">
                          {regionalEarningActual[r]?.toFixed(2)}
                        </span>
                        <span className="text-gray-500"> {r}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
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
      <DataTable
        columns={columns}
        data={getManagerRequests.data || []}
        DrawerTrigger={null}
      />
    </div>
  );
};

export default ManagerRequestsTable;
