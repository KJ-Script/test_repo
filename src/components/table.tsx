"use client";
import React, { useState } from "react";
import {
  Column,
  FilterFn,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { rankItem } from "@tanstack/match-sorter-utils";
import {
  ChevronDown,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import AddUserDrawer from "./pages/user/drawers/AddUserDrawer";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import AddStationDrawer from "./pages/station/drawers/AddStationDrawer";
import AddProviderDrawer from "./pages/provider/drawers/AddProviderDrawer";
import AddVehicleDrawer from "./pages/vehicle/drawers/AddVehicleDrawer";
import AddRouteDrawer from "./pages/route/drawers/AddRouteDrawer";
import AddPriceDrawer from "./pages/price/drawers/AddPriceDrawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import AddScheduleDialogue from "./pages/schedule/dialogues/AddScheduleDialogue";
import AddToQueueDialogue from "./pages/queue/dialogues/AddToQueueDialogue";
import AddRoleDrawer from "./pages/role/drawers/AddRoleDrawer";

interface propTypes {
  columns: any;
  data: any;
  DrawerTrigger:
    | any
    | {
        data: {
          providers: any;
          vehicleLevels: any;
        };
      };
  filterColumn?: any;
  fuzzyFilterToggle?: string;
}
export function DataTable({
  columns,
  data,
  DrawerTrigger,
  fuzzyFilterToggle,
  filterColumn,
}: propTypes) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value);
    addMeta({
      itemRank,
    });
    return itemRank.passed;
  };

  const table = useReactTable({
    data,
    columns,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: fuzzyFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div>
      {DrawerTrigger != "schedule" ? (
        <div className="flex justify-between items-center py-4">
          {DrawerTrigger?.data && DrawerTrigger.data.trigger == "schedule" ? (
            <div className="w-1/3">
              <Select
                onValueChange={(value) => {
                  setGlobalFilter(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select the Destination." />
                </SelectTrigger>
                <SelectContent>
                  {DrawerTrigger?.data.routes.map((route: any) => (
                    <SelectItem
                      value={String(route.destination_name)}
                      key={route.id}
                    >
                      {route.destination_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              {fuzzyFilterToggle !== "no" ? (
                <Input
                  placeholder="Filter columns..."
                  value={globalFilter ?? ""}
                  onChange={(event) => {
                    setGlobalFilter(event.target.value);
                    console.log(event.target.value);
                    if (DrawerTrigger?.trigger == "journey-history") {
                      DrawerTrigger?.setSearchQuery(event.target.value || "");
                    }
                  }}
                  className="max-w-sm"
                />
              ) : (
                <></>
              )}
            </>
          )}
          <div className="flex items-center gap-3">
            {DrawerTrigger !== "warning" &&
              (fuzzyFilterToggle !== "no" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      Columns <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <></>
              ))}
            {DrawerTrigger && DrawerTrigger == "user" && <AddUserDrawer />}
            {DrawerTrigger && DrawerTrigger == "station" && (
              <AddStationDrawer />
            )}
            {DrawerTrigger && DrawerTrigger == "provider" && (
              <AddProviderDrawer />
            )}
            {DrawerTrigger && DrawerTrigger == "route" && <AddRouteDrawer />}
            {DrawerTrigger && DrawerTrigger?.data?.trigger == "vehicle" && (
              <AddVehicleDrawer />
            )}
            {DrawerTrigger && DrawerTrigger?.data?.trigger == "price" && (
              <AddPriceDrawer />
            )}
            {DrawerTrigger && DrawerTrigger?.data?.trigger == "schedule" && (
              <AddScheduleDialogue routes={DrawerTrigger.data.routes} />
            )}
            {DrawerTrigger && DrawerTrigger?.data?.trigger == "queue" && (
              <AddToQueueDialogue
                routes={DrawerTrigger.data.routes}
                session={DrawerTrigger.data.session}
              />
            )}
            {DrawerTrigger && DrawerTrigger == "role" && <AddRoleDrawer />}
          </div>
        </div>
      ) : (
        ""
      )}
      <ScrollArea className="max-w-[87vw]  whitespace-nowrap rounded-md">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <>
                            <div
                              {...{
                                className: header.column.getCanSort()
                                  ? "cursor-pointer select-none py-2"
                                  : "",
                                onClick:
                                  header.column.getToggleSortingHandler(),
                              }}
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              {header.column.getCanSort() &&
                              filterColumn !== "no" ? (
                                {
                                  asc: (
                                    <ChevronUpIcon className="inline ml-2 h-4" />
                                  ),
                                  desc: (
                                    <ChevronDownIcon className="inline ml-2 h-4" />
                                  ),
                                }[header.column.getIsSorted() as string] ?? (
                                  <ChevronsUpDownIcon className="inline ml-2 h-4" />
                                )
                              ) : (
                                <></>
                              )}
                            </div>
                            {header.column.getCanFilter() &&
                            filterColumn !== "no" ? (
                              <div>
                                <Filter column={header.column} />
                              </div>
                            ) : null}
                          </>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="w-[87vw] flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function Filter({ column }: { column: Column<any, unknown> }) {
  const filterVariant = column.columnDef.meta ?? {};

  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = React.useMemo(
    () =>
      filterVariant === "range"
        ? []
        : Array.from(column.getFacetedUniqueValues().keys())
            .sort()
            .slice(0, 5000),
    [column.getFacetedUniqueValues(), filterVariant]
  );

  return filterVariant === "range" ? (
    <div>
      <div className="flex space-x-2">
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={`Min ${
            column.getFacetedMinMaxValues()?.[0] !== undefined
              ? `(${column.getFacetedMinMaxValues()?.[0]})`
              : ""
          }`}
          className="w-24 border shadow rounded"
        />
        <DebouncedInput
          type="number"
          min={Number(column.getFacetedMinMaxValues()?.[0] ?? "")}
          max={Number(column.getFacetedMinMaxValues()?.[1] ?? "")}
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={`Max ${
            column.getFacetedMinMaxValues()?.[1]
              ? `(${column.getFacetedMinMaxValues()?.[1]})`
              : ""
          }`}
          className="w-24 border shadow rounded"
        />
      </div>
      <div className="h-1" />
    </div>
  ) : filterVariant === "select" ? (
    <select
      onChange={(e) => column.setFilterValue(e.target.value)}
      value={columnFilterValue?.toString()}
    >
      <option value="">All</option>
      {sortedUniqueValues.map((value) => (
        //dynamically generated select options from faceted values feature
        <option value={value} key={value}>
          {value}
        </option>
      ))}
    </select>
  ) : (
    <>
      {/* Autocomplete suggestions from faceted values feature */}
      <datalist id={column.id + "list"}>
        {sortedUniqueValues.map((value: any) => (
          <option value={value} key={value} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Search...`}
        list={column.id + "list"}
      />
      <div className="h-1" />
    </>
  );
}

// A typical debounced input react component
function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <input
      className="rounded-md border w-[123px] border-input bg-background p-[6px] my-[3px]"
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
