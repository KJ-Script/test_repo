import React from "react";
import PassengerHistoryBarChartSkeleton from "./PassengerHistoryBarChartSkeleton";
import { PassengerVsVehicleLineChart } from "../PassengerVsVehicleLineChart";
import { serverApi } from "@/app/_trpc/server";
import { subDays } from "date-fns";

const PassengerVsVehicleServer = async () => {
  // let initialData;
  try {
    // initialData = await serverApi.analytics.filterTotalPassengers.query({
    //   //@ts-ignore
    //   from: subDays(new Date(Date.now()), 30),
    //   to: new Date(Date.now()),
    // });

    return <PassengerVsVehicleLineChart initialData={undefined} />;
  } catch (e) {
    console.log(e);
    return <PassengerHistoryBarChartSkeleton />;
  }
};

export default PassengerVsVehicleServer;
