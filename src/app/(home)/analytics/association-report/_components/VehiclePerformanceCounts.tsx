import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, Loader2, Route, Ticket } from "lucide-react";
import React from "react";

export type FilterDateKey = "today" | "this-week" | "this-month";
const VehiclePerformanceCounts = ({ data }: { data: any }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Passengers</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold h-8 flex items-center justify-start">
            {data ? (
              data.passengers.toLocaleString()
            ) : (
              <Loader2 className="h-4 animate-spin" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            passengers transported from this station.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Distance Covered
          </CardTitle>
          <Route className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-1 items-center text-2xl font-bold h-8">
            {data ? (
              data.distanceCovered.toLocaleString()
            ) : (
              <Loader2 className="h-4 animate-spin" />
            )}
            KM
          </div>
          <p className="text-xs text-muted-foreground">Covered.</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Exit Count</CardTitle>
          <Bus className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-2xl font-bold h-8">
            {data ? (
              data.checkoutCount.toLocaleString()
            ) : (
              <Loader2 className="h-4 animate-spin" />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Left The station {data ? data.checkoutCount.toLocaleString() : "-"}{" "}
            times
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VehiclePerformanceCounts;
