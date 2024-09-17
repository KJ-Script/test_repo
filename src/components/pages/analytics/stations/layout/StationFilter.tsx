"use client";
import { serverApi } from "@/app/_trpc/server";
import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { clientApi } from "@/app/_trpc/react";
import StationAnalyticsCounts, {
  FilterDateKey,
} from "../components/StationAnalyticsCounts";
import { StationBarChart } from "../components/StationBarChart";
import PassengerOnEachRoute from "../components/PassengerOnEachRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PassengerOnEachRoutePieChart from "../components/PassengerOnEachRoutePieChart";
import { PassengerHistoryLineChart } from "../components/PassengerHistoryLineChart";
import Employees from "../components/Employees";
import StationsMap from "../../map/Map";
import AllRoutes from "../components/AllRoutes";
import RoutesRadialBarChart from "../components/RoutesRadialBarChart";
import VehiclesOnEachRoute from "../components/VehiclesOnEachRoute";
import VehiclesOnEachRouteChart from "../components/VehiclesOnEachRouteChart";
import { Loader2 } from "lucide-react";

const StationFilter = ({
  initialData,
  type,
}: {
  initialData: Awaited<
    ReturnType<(typeof serverApi)["station"]["getAll"]["query"]>
  >;
  type?: string;
}) => {
  const getStations = clientApi.station.getAll.useQuery(undefined, {
    initialData,
  });
  const [stationId, setStationId] = useState<number>(
    type == "regional" ? 3 : initialData[0]?.id
  );
  const [filterDate, setFilterDate] = useState<FilterDateKey>("today");

  if (getStations.isLoading) {
    return <Loader2 />;
  }
  return (
    <div>
      <div className="flex items-center justify-between border rounded-t-2xl p-5">
        <h2 className="text-2xl font-bold">Station Analytics</h2>
        <div className="flex gap-2">
          <Select
            onValueChange={(value: FilterDateKey) => setFilterDate(value)}
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
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => setStationId(Number(value))}
            defaultValue={stationId + ""}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select station" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Stations</SelectLabel>
                <SelectItem value={0 + ""}>All</SelectItem>
                {getStations.data.map((station) => (
                  <SelectItem value={station.id + ""}>
                    {station.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="p-5 border-x border-b">
        <div className="flex-col">
          <div className="flex-1 space-y-4">
            <StationAnalyticsCounts
              stationId={stationId}
              filterDateValue={filterDate}
            />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <StationBarChart stationId={stationId} />
            </div>
          </div>
          {/* <div className="w-[87vw] overflow-hidden -z-10 h-[60vh] mt-4 rounded-sm">
            <StationsMap />
          </div> */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 my-4">
            <Card className="col-span-4 lg:col-span-3  space-y-4">
              <CardHeader>
                <CardTitle>Passengers On Each Route</CardTitle>
              </CardHeader>
              <CardContent>
                <PassengerOnEachRoute
                  stationId={stationId}
                  filterDateValue={filterDate}
                />
              </CardContent>
            </Card>
            <Card className="col-span-4 lg:col-span-4  space-y-4">
              <CardContent className="pl-2">
                <PassengerOnEachRoutePieChart
                  stationId={stationId}
                  filterDateValue={filterDate}
                />
              </CardContent>
            </Card>{" "}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <PassengerHistoryLineChart stationId={stationId} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 my-4">
            <Card className="col-span-4 lg:col-span-3  space-y-4">
              <CardHeader>
                <CardTitle>Daily Active Vehicles On Each Route</CardTitle>
              </CardHeader>
              <CardContent>
                <VehiclesOnEachRoute
                  stationId={stationId}
                  filterDateValue={filterDate}
                />
              </CardContent>
            </Card>
            <Card className="col-span-4 lg:col-span-4  space-y-4">
              <CardContent className="pl-2">
                <VehiclesOnEachRouteChart
                  stationId={stationId}
                  filterDateValue={filterDate}
                />
              </CardContent>
            </Card>{" "}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 my-4">
            <Employees station_id={stationId} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 my-4">
            <Card className="col-span-4 lg:col-span-4  space-y-4">
              <CardContent className="pl-2">
                <RoutesRadialBarChart stationId={stationId} />
              </CardContent>
            </Card>{" "}
            <Card className="col-span-4 lg:col-span-3  space-y-4">
              <CardHeader>
                <CardTitle>Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <AllRoutes station_id={stationId} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationFilter;
