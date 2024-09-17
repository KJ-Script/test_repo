import { clientApi } from "@/app/_trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { filterDateValues } from "@/lib/utils";
import { Bus, BusFront, Route, Ticket } from "lucide-react";
import React from "react";

export type FilterDateKey =
  | "today"
  | "this-week"
  | "this-month"
  | "this-year"
  | "interval";
const StationAnalyticsCounts = ({
  stationId,
  filterDateValue,
}: {
  stationId: number;
  filterDateValue: FilterDateKey;
}) => {
  const { data, isFetching } =
    clientApi.analytics.getAnalyticsCountsForStation.useQuery(
      {
        station_id: stationId,
        filterDate: filterDateValue,
      },
      {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      }
    );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Passengers</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.counts?.passengers?.ticket_count || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {data?.counts?.passengers?.ticket_count || 0} passengers transported
            from this station.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Employees</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {" "}
            {data?.counts?.employees || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {data?.counts?.employees || 0} Bitophyiaa Employees
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Routes</CardTitle>
          <Route className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.counts?.routes || 0}</div>
          <p className="text-xs text-muted-foreground">
            {" "}
            {data?.counts?.routes || 0} destinations from this station.
          </p>
        </CardContent>
      </Card>
      {/* <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Live Vehicles Booking
          </CardTitle>
          <Bus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.counts?.liveVehicles || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {" "}
            {data?.counts?.liveVehicles || 0} vehicles currently booking
          </p>
        </CardContent>
      </Card> */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Vehicles Checked Out
          </CardTitle>
          <Bus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.counts?.vehiclesOut || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            {" "}
            {data?.counts?.vehiclesOut || 0} vehicles checked out
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StationAnalyticsCounts;
