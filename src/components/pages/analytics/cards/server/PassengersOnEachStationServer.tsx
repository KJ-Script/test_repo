import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import PassengersOnEachStationSkeleton from "./PassengersOnEachStationSkeleton";
import PassengersOnEachStationText from "../PassengersOnEachStationText";
import { serverApi } from "@/app/_trpc/server";

const PassengersOnEachStationServer = async () => {
  // let initialData;
  try {
    // initialData = await serverApi.analytics.getStationDailyCounts.query();
    return (
      <Card className="col-span-4 lg:col-span-3  space-y-4 flex-1">
        <CardHeader>
          <CardTitle>Passengers On Each Station</CardTitle>
        </CardHeader>
        <CardContent>
          <PassengersOnEachStationText initialData={undefined} />
        </CardContent>
      </Card>
    );
  } catch (e) {
    <PassengersOnEachStationSkeleton />;
  }
};

export default PassengersOnEachStationServer;
