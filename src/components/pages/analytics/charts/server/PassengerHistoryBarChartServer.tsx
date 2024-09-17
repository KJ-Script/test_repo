import React from "react";
import PassengerHistoryBarChart from "../PassengerHistoryBarChart";
import { serverApi } from "@/app/_trpc/server";
import { subDays } from "date-fns";
import PassengerHistoryBarChartSkeleton from "./PassengerHistoryBarChartSkeleton";

const PassengerHistoryBarChartServer = async () => {
  let initialData;
  try {
    // initialData = await serverApi.analytics.filterTotalPassengers.query({
    //   //@ts-ignore
    //   from: subDays(new Date(Date.now()), 30),
    //   to: new Date(Date.now()),
    // });

    return (
      <div className="w-full border rounded-lg my-2 p-3">
        <div className="flex flex-col items-start">
          <p className="mb-3 font-bold">Passengers History</p>
        </div>
        <div className="w-full h-[55vh]">
          <PassengerHistoryBarChart initialData={undefined} />
        </div>
      </div>
    );
  } catch (e) {
    <PassengerHistoryBarChartSkeleton />;
  }
};

export default PassengerHistoryBarChartServer;
