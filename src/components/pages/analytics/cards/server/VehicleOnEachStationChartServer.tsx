import React from "react";
import VehiclesOnEachStationChartSkeleton from "./VehiclesOnEachStationChartSkeleton";
import { serverApi } from "@/app/_trpc/server";
import { Card, CardContent } from "@/components/ui/card";
import VehiclesOnEachStationChart from "../VehiclesOnEachStationChart";

const VehicleOnEachStationChartServer = async () => {
  // let initialData;
  try {
    // initialData = await serverApi.analytics.getStationDailyCounts.query();
    return (
      <Card className="col-span-4 lg:col-span-4  space-y-4">
        <CardContent className="pl-2">
          <VehiclesOnEachStationChart initialData={undefined} />
        </CardContent>
      </Card>
    );
  } catch (e) {
    console.log(e);
    return <VehiclesOnEachStationChartSkeleton />;
  }
};

export default VehicleOnEachStationChartServer;
