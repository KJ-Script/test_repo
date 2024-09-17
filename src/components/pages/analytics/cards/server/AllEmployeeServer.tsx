import { serverApi } from "@/app/_trpc/server";
import React from "react";
import PassengerHistoryBarChartSkeleton from "../../charts/server/PassengerHistoryBarChartSkeleton";
import AllEmployees from "../AllEmployees";

const AllEmployeeServer = async () => {
  let initialData;
  try {
    initialData = await serverApi.analytics.getAllEmployees.query();
    return <AllEmployees initialData={initialData} />;
  } catch (e) {
    console.log(e);
    return <PassengerHistoryBarChartSkeleton />;
  }
};

export default AllEmployeeServer;
