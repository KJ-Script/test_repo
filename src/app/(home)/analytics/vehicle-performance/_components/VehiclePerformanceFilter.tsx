"use client";
import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDebouncedState } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { CalendarIcon, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import VehiclePerformanceCounts from "./VehiclePerformanceCounts";
import { VehiclePerformanceChart } from "./VehiclePerformanceChart";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format, subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import { FilterDateKey } from "@/components/pages/analytics/stations/components/StationAnalyticsCounts";
import { VehiclePerformanceRoutesChart } from "./VehiclePerformanceRoutesChart";
import { clientApi } from "@/app/_trpc/react";
import { cx } from "class-variance-authority";
import StationsList from "./StationsList";

const VehiclePerformanceFilter = ({
  initialPlateNumber,
  region,
  currentStation,
}: {
  initialPlateNumber: string;
  region: string;
  currentStation: any;
}) => {
  const [plateNumber, setPlateNumber] = useState(initialPlateNumber);
  const [plateNumberQuery, setPlateNumberQuery] = useState(initialPlateNumber);
  const [mode, setMode] = useState("vehicle");
  const [vehicleReportTitle, setVehicleReportTitle] = useState(
    initialPlateNumber + "-" + region
  );
  const [stationId, setStationId] = useState(currentStation);
  const [openFilter, setOpenFilter] = useState(false);
  const [filterDate, setFilterDate] = useState<FilterDateKey>("today");

  const searchVehicle = async () => {
    setPlateNumberQuery(plateNumber);
    setVehicleReportTitle(plateNumber);
  };

  const [date, setDate] = useState<DateRange | undefined>({
    //@ts-ignore
    from: subDays(new Date(Date.now()), 1),
    //@ts-ignore
    to: new Date(),
  });

  const getVehiclePerformance = clientApi.vehicle.getPerformance.useQuery({
    filter_type: filterDate,
    plateNumber: plateNumberQuery,
    ...(filterDate == "interval" && {
      from: date?.from,
      to: date?.to,
    }),
    ...(mode == "station" && {
      stationId: Number(stationId),
    }),
  });

  return (
    <div>
      <div className="flex items-center justify-between border rounded-t-2xl p-5">
        <h2 className="text-2xl space-x-2 font-bold">
          <Button
            variant="outline"
            className={cx(
              mode == "vehicle" && "bg-accent hover:text-accent-foreground"
            )}
            onClick={() => setMode("vehicle")}
          >
            Vehicle Mode
          </Button>
          <Button
            variant="outline"
            className={cx(
              mode == "station" && "bg-accent hover:text-accent-foreground"
            )}
            onClick={() => setMode("station")}
          >
            Station Mode
          </Button>
        </h2>
        <div className="flex gap-2">
          {mode == "vehicle" ? (
            <div className="flex">
              <Input
                placeholder="plate number"
                className="rounded-r-none"
                onChange={(e) => {
                  setPlateNumber(e.target.value);
                }}
                value={plateNumber}
              />
              <Button className="rounded-l-none" onClick={searchVehicle}>
                <SearchIcon />
              </Button>
            </div>
          ) : (
            <StationsList stationId={stationId} setStationId={setStationId} />
          )}
          {openFilter ? (
            <div className={cn("grid gap-2")}>
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
            </div>
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
        </div>
      </div>
      <div className="p-5 border-x border-b flex flex-col gap-4">
        <VehiclePerformanceCounts
          data={getVehiclePerformance.data || undefined}
        />
        <div className="grid md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <VehiclePerformanceChart
              data={getVehiclePerformance.data || undefined}
            />
          </div>
          <VehiclePerformanceRoutesChart
            data={
              getVehiclePerformance.data
                ? getVehiclePerformance.data.routeDistribution
                : undefined
            }
          />
        </div>
      </div>
    </div>
  );
};

export default VehiclePerformanceFilter;
