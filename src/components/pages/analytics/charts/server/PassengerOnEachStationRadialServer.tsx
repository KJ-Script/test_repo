import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import PassengerOnEachStationRadialBarChart from "../PassengerOnEachStationRadialBarChart";
import { serverApi } from "@/app/_trpc/server";

const PassengerOnEachStationRadialServer = async () => {
  let initialData;
  try {
    // initialData = await serverApi.analytics.getStationDailyCounts.query();
    return (
      <Card className="col-span-4 lg:col-span-4  space-y-4">
        <CardContent className="pl-2">
          <PassengerOnEachStationRadialBarChart initialData={undefined} />
        </CardContent>
      </Card>
    );
  } catch (e) {
    console.log(e);
  }
};

export default PassengerOnEachStationRadialServer;
