"use client";
import { clientApi } from "@/app/_trpc/react";
import { serverApi } from "@/app/_trpc/server";
import { DataTable } from "@/components/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "../filter/DateRange";
import { subDays } from "date-fns";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import {
  ArrowUpDown,
  ArrowUpDownIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import QueueTableSkeleton from "../../queue/sekeletons/QueueTableSkeleton";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const VehiclePerformanceTable = ({
  initialData,
}: {
  initialData: Awaited<
    ReturnType<(typeof serverApi)["queue"]["getVehiclePerformance"]["query"]>
  >;
}) => {
  const doc = new jsPDF();

  const [date, setDate] = useState<DateRange>({
    //@ts-ignore
    from: subDays(new Date(Date.now()), 1),
    to: new Date(Date.now()),
  });
  const [startDate, setStartDate] = useState<Date>(
    //@ts-ignore
    subDays(new Date(Date.now()), 15)
  );
  const [endDate, setEndDate] = useState<Date>(new Date(Date.now()));

  //@ts-ignore
  const getVehiclePerformance = clientApi.queue.getVehiclePerformance.useQuery({
    //@ts-ignore
    from: startDate,
    //@ts-ignore
    to: endDate,
  });

  const exportPdf = () => {
    const header = [["Plate Number", "Checkout count", "Distance coveredc"]];
    const data = getVehiclePerformance?.data?.map((v) => [
      v.plate_number,
      v.checkout_count,
      v.distance_covered,
    ]);

    autoTable(doc, {
      head: header,
      //@ts-ignore
      body: data,
    });

    console.log(
      date.to?.getFullYear(),
      date.to?.getDate(),
      date.to?.getMonth()! + 1
    );
    const startD = `${date.from?.getFullYear()}-${
      date.from?.getMonth()! + 1
    }-${date.from?.getDate()}`;
    const endD = `${date.to?.getFullYear()}-${
      date.to?.getMonth()! + 1
    }-${date.to?.getDate()}`;

    //@ts-ignore
    doc.save(`Vehicle_Performance${startD}-to-${endD}.pdf`);
  };

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  // Table columns
  const columns: ColumnDef<
    Awaited<
      ReturnType<(typeof serverApi)["queue"]["getVehiclePerformance"]["query"]>
    >[0]
  >[] = useMemo(
    () => [
      {
        accessorKey: "plate_number",
        header: "Plate Number",
        accessorFn: (row) => row.plate_number,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "checkout_count",
        header: "Checkout Count",
        accessorFn: (row) => row.checkout_count,
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "distance",
        header: "Distance Covered",
        accessorFn: (row) => row.distance_covered + "Km",
        cell: (info) => info.getValue(),
      },
    ],
    []
  );

  const table = useReactTable({
    data: getVehiclePerformance.data || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    debugTable: true,
    debugHeaders: true,
    debugColumns: false,
  });
  return (
    <div>
      <div className="flex items-end gap-2 mb-2">
        <div className="flex items-end gap-2 mb-2">
          <div className="flex flex-col gap-2">
            <Label>Start date</Label>
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

                  {startDate ? (
                    //@ts-ignore
                    format(startDate, "PPP")
                  ) : (
                    <span>Pick start date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  //@ts-ignore
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-2 ml-3">
            <Label>End date</Label>
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

                  {endDate ? (
                    //@ts-ignore
                    format(endDate, "PPP")
                  ) : (
                    <span>Pick end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  //@ts-ignore
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button onClick={exportPdf}>Export</Button>
        </div>
      </div>
      {getVehiclePerformance.isLoading ? (
        <QueueTableSkeleton />
      ) : (
        <DataTable
          fuzzyFilterToggle="no"
          columns={columns}
          data={getVehiclePerformance.data || []}
          DrawerTrigger="journey-history"
        />
      )}
    </div>
  );
};

export default VehiclePerformanceTable;
