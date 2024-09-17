import React from "react";
import CountsAreaChartSkeleton from "./CountsAreaChartSkeleton";
import CountsPieChart from "../CountsPieChart";
import { serverApi } from "@/app/_trpc/server";

const CountsPieChartServer = async () => {
  let initialData;

  try {
    // initialData = await serverApi.analytics.getStationDailyCounts.query();
    return <CountsPieChart initialData={undefined} />;
  } catch (e) {
    return <CountsAreaChartSkeleton />;
  }
};

export default CountsPieChartServer;
