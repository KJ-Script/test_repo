import React from "react";
import VehiclesOnEachStation from "../VehiclesOnEachStationText";
import { serverApi } from "@/app/_trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VehiclesOnEachStationSkeleton from "./VehiclesOnEachStationSkeleton";

const VehiclesOnEachStationServer = async () => {
  // let initialData;
  try {
    // initialData = await serverApi.analytics.getStationDailyCounts.query();
    return (
      <Card className="lg:col-span-3  space-y-4">
        <CardHeader>
          <CardTitle>Active Vehicles On Each Station</CardTitle>
        </CardHeader>
        <CardContent className="h-[50vh]">
          <VehiclesOnEachStation initialData={undefined} />
        </CardContent>
      </Card>
    );
  } catch (e) {
    console.log(e);
    return <VehiclesOnEachStationSkeleton />;
  }
};

export default VehiclesOnEachStationServer;
